package com.burnouttracker.service;

import com.burnouttracker.dto.response.admin.*;
import com.burnouttracker.model.enums.RiskLevel;
import com.burnouttracker.repository.BurnoutScoreRepository;
import com.burnouttracker.repository.MoodEntryRepository;
import com.burnouttracker.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final BurnoutScoreRepository burnoutScoreRepository;
    private final MoodEntryRepository moodEntryRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter WEEK_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MMM d");

    public AdminService(UserRepository userRepository,
                        BurnoutScoreRepository burnoutScoreRepository,
                        MoodEntryRepository moodEntryRepository) {
        this.userRepository = userRepository;
        this.burnoutScoreRepository = burnoutScoreRepository;
        this.moodEntryRepository = moodEntryRepository;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public CampusStatsDTO getCampusStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekAgo = now.minusDays(7);
        LocalDateTime twoWeeksAgo = now.minusDays(14);

        long totalStudents = userRepository.countByRoleAndIsActiveTrue(com.burnouttracker.model.enums.Role.STUDENT);
        long activeThisWeek = userRepository.countDistinctActiveThisWeek(weekAgo);

        double checkinRatePercent = totalStudents > 0
                ? round((activeThisWeek * 100.0) / totalStudents, 2)
                : 0.0;

        Map<String, Object> burnoutStats = getLatestBurnoutStats();
        Double avgBurnoutScore = (Double) burnoutStats.get("avgScore");
        Long highRiskCount = (Long) burnoutStats.get("highCount");
        Long mediumRiskCount = (Long) burnoutStats.get("mediumCount");
        Long lowRiskCount = (Long) burnoutStats.get("lowCount");

        Map<String, Double> moodStats = getMoodStatsForPeriod(weekAgo);
        Double avgMoodScore = moodStats.get("avgMood");
        Double avgSleepHours = moodStats.get("avgSleep");

        long activeLastWeek = userRepository.countDistinctActiveThisWeek(twoWeeksAgo);
        double trendVsLastWeek = activeLastWeek > 0
                ? round(((activeThisWeek - activeLastWeek) * 100.0) / activeLastWeek, 2)
                : 0.0;

        return CampusStatsDTO.builder()
                .totalStudents(totalStudents)
                .activeThisWeek(activeThisWeek)
                .checkinRatePercent(checkinRatePercent)
                .avgBurnoutScore(avgBurnoutScore)
                .avgMoodScore(avgMoodScore)
                .avgSleepHours(avgSleepHours)
                .highRiskCount(highRiskCount)
                .mediumRiskCount(mediumRiskCount)
                .lowRiskCount(lowRiskCount)
                .trendVsLastWeek(trendVsLastWeek)
                .build();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<DepartmentStatsDTO> getDepartmentStats() {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<Object[]> deptData = userRepository.getDepartmentAggregateStats(weekAgo);
        List<DepartmentStatsDTO> result = new ArrayList<>();

        for (Object[] row : deptData) {
            String department = row[0] != null ? row[0].toString() : "Unassigned";
            Long studentCount = ((Number) row[1]).longValue();
            Double avgBurnout = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            Long highRisk = ((Number) row[3]).longValue();
            Long mediumRisk = ((Number) row[4]).longValue();
            Long lowRisk = ((Number) row[5]).longValue();
            Long activeCount = row[6] != null ? ((Number) row[6]).longValue() : 0L;

            String dominantRisk = determineDominantRisk(highRisk, mediumRisk, lowRisk);
            double checkinRate = studentCount > 0 ? round((activeCount * 100.0) / studentCount, 2) : 0.0;
            String trend = determineTrend(avgBurnout);

            result.add(DepartmentStatsDTO.builder()
                    .department(department)
                    .studentCount(studentCount)
                    .avgBurnoutScore(round(avgBurnout, 2))
                    .riskLevel(dominantRisk)
                    .checkinRate(checkinRate)
                    .trend(trend)
                    .build());
        }

        result.sort(Comparator.comparingLong(DepartmentStatsDTO::getStudentCount).reversed());
        return result;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public RiskDistributionDTO getRiskDistribution() {
        Map<String, Long> currentDistribution = getCurrentRiskDistribution();
        Long high = currentDistribution.get("high");
        Long medium = currentDistribution.get("medium");
        Long low = currentDistribution.get("low");
        Long total = high + medium + low;

        double highPercent = total > 0 ? round((high * 100.0) / total, 2) : 0.0;
        double mediumPercent = total > 0 ? round((medium * 100.0) / total, 2) : 0.0;
        double lowPercent = total > 0 ? round((low * 100.0) / total, 2) : 0.0;

        List<RiskDistributionDTO.WeeklyRiskHistoryDTO> weeklyHistory = getWeeklyRiskHistory(8);

        return RiskDistributionDTO.builder()
                .high(high)
                .medium(medium)
                .low(low)
                .highPercent(highPercent)
                .mediumPercent(mediumPercent)
                .lowPercent(lowPercent)
                .weeklyHistory(weeklyHistory)
                .build();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<WeeklyTrendDTO> getWeeklyTrends(int weeks) {
        List<WeeklyTrendDTO> result = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = weeks - 1; i >= 0; i--) {
            LocalDate weekStart = today.minusWeeks(i).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate weekEnd = weekStart.plusDays(6);
            LocalDateTime startDateTime = weekStart.atStartOfDay();
            LocalDateTime endDateTime = weekEnd.atTime(23, 59, 59);

            String weekLabel = i == 0 ? "Current Week" : "Week " + (weeks - i);

            Double avgBurnout = burnoutScoreRepository.getWeeklyAverageBurnout(startDateTime, endDateTime);
            Map<String, Double> moodStats = getMoodStatsForPeriodInRange(startDateTime, endDateTime);

            Long checkinCount = moodEntryRepository.countCheckinsInRange(startDateTime, endDateTime);

            result.add(WeeklyTrendDTO.builder()
                    .weekLabel(weekLabel)
                    .avgBurnoutScore(avgBurnout != null ? round(avgBurnout, 2) : 0.0)
                    .avgMoodScore(moodStats.get("avgMood") != null ? round(moodStats.get("avgMood"), 2) : 0.0)
                    .avgSleepHours(moodStats.get("avgSleep") != null ? round(moodStats.get("avgSleep"), 2) : 0.0)
                    .checkinCount(checkinCount != null ? checkinCount : 0L)
                    .build());
        }

        return result;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<DailyCheckinDTO> getCheckinRates() {
        List<DailyCheckinDTO> result = new ArrayList<>();
        LocalDate today = LocalDate.now();
        long totalStudents = userRepository.countByRoleAndIsActiveTrue(com.burnouttracker.model.enums.Role.STUDENT);

        for (int i = 29; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(23, 59, 59);

            Long checkinCount = moodEntryRepository.countCheckinsInRange(startOfDay, endOfDay);
            double participationPercent = totalStudents > 0
                    ? round((checkinCount * 100.0) / totalStudents, 2)
                    : 0.0;

            result.add(DailyCheckinDTO.builder()
                    .date(date.format(DATE_FORMATTER))
                    .checkinCount(checkinCount)
                    .participationPercent(participationPercent)
                    .build());
        }

        return result;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<HeatmapDataPoint> getHeatmapData() {
        List<HeatmapDataPoint> heatmapData = new ArrayList<>();
        LocalDate today = LocalDate.now();
        List<Object[]> deptData = userRepository.countStudentsByDepartment();

        for (int i = 7; i >= 0; i--) {
            LocalDate weekStart = today.minusWeeks(i).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate weekEnd = weekStart.plusDays(6);
            LocalDateTime startDateTime = weekStart.atStartOfDay();
            LocalDateTime endDateTime = weekEnd.atTime(23, 59, 59);

            String weekLabel = weekStart.format(DateTimeFormatter.ofPattern("MMM d"));

            List<Object[]> deptScores = burnoutScoreRepository.getDepartmentScoresInRange(startDateTime, endDateTime);

            for (Object[] row : deptScores) {
                String department = row[0] != null ? row[0].toString() : "Unassigned";
                Double avgScore = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                Long studentCount = row[2] != null ? ((Number) row[2]).longValue() : 0L;

                heatmapData.add(HeatmapDataPoint.builder()
                        .department(department)
                        .week("Week " + (8 - i))
                        .weekLabel(weekLabel)
                        .avgScore(round(avgScore, 2))
                        .studentCount(studentCount.intValue())
                        .build());
            }
        }

        return heatmapData;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public byte[] exportCSV() {
        CampusStatsDTO campusStats = getCampusStats();
        List<WeeklyTrendDTO> weeklyTrends = getWeeklyTrends(8);
        RiskDistributionDTO riskDistribution = getRiskDistribution();

        StringBuilder csv = new StringBuilder();
        csv.append("Week,Avg Burnout Score,Avg Mood,High Risk %,Medium Risk %,Low Risk %,Checkin Rate %\n");

        for (WeeklyTrendDTO trend : weeklyTrends) {
            csv.append(trend.getWeekLabel()).append(",");
            csv.append(trend.getAvgBurnoutScore()).append(",");
            csv.append(trend.getAvgMoodScore()).append(",");
            csv.append(riskDistribution.getHighPercent()).append(",");
            csv.append(riskDistribution.getMediumPercent()).append(",");
            csv.append(riskDistribution.getLowPercent()).append(",");
            csv.append(campusStats.getCheckinRatePercent()).append("\n");
        }

        return csv.toString().getBytes();
    }

    private Map<String, Object> getLatestBurnoutStats() {
        List<Object[]> results = burnoutScoreRepository.getLatestBurnoutStatsPerUser();
        
        double sum = 0;
        long count = 0;
        long highCount = 0;
        long mediumCount = 0;
        long lowCount = 0;

        for (Object[] row : results) {
            double score = ((Number) row[0]).doubleValue();
            String riskLevelStr = row[1].toString();
            
            sum += score;
            count++;

            RiskLevel riskLevel = RiskLevel.valueOf(riskLevelStr);
            switch (riskLevel) {
                case HIGH -> highCount++;
                case MEDIUM -> mediumCount++;
                case LOW -> lowCount++;
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("avgScore", count > 0 ? round(sum / count, 2) : 0.0);
        stats.put("highCount", highCount);
        stats.put("mediumCount", mediumCount);
        stats.put("lowCount", lowCount);
        return stats;
    }

    private Map<String, Double> getMoodStatsForPeriod(LocalDateTime startDate) {
        Double avgMood = moodEntryRepository.getAverageMoodForPeriod(startDate);
        Double avgSleep = moodEntryRepository.getAverageSleepForPeriod(startDate);

        Map<String, Double> stats = new HashMap<>();
        stats.put("avgMood", avgMood != null ? round(avgMood, 2) : 0.0);
        stats.put("avgSleep", avgSleep != null ? round(avgSleep, 2) : 0.0);
        return stats;
    }

    private Map<String, Double> getMoodStatsForPeriodInRange(LocalDateTime startDate, LocalDateTime endDate) {
        Double avgMood = moodEntryRepository.getAverageMoodInRange(startDate, endDate);
        Double avgSleep = moodEntryRepository.getAverageSleepInRange(startDate, endDate);

        Map<String, Double> stats = new HashMap<>();
        stats.put("avgMood", avgMood != null ? round(avgMood, 2) : 0.0);
        stats.put("avgSleep", avgSleep != null ? round(avgSleep, 2) : 0.0);
        return stats;
    }

    private Map<String, Long> getCurrentRiskDistribution() {
        List<Object[]> results = burnoutScoreRepository.getLatestRiskDistribution();
        
        Map<String, Long> distribution = new HashMap<>();
        distribution.put("high", 0L);
        distribution.put("medium", 0L);
        distribution.put("low", 0L);

        for (Object[] row : results) {
            String riskLevel = row[0].toString();
            Long count = ((Number) row[1]).longValue();
            distribution.put(riskLevel.toLowerCase(), count);
        }

        return distribution;
    }

    private List<RiskDistributionDTO.WeeklyRiskHistoryDTO> getWeeklyRiskHistory(int weeks) {
        List<RiskDistributionDTO.WeeklyRiskHistoryDTO> history = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = weeks - 1; i >= 0; i--) {
            LocalDate weekStart = today.minusWeeks(i).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate weekEnd = weekStart.plusDays(6);
            LocalDateTime startDateTime = weekStart.atStartOfDay();
            LocalDateTime endDateTime = weekEnd.atTime(23, 59, 59);

            String weekLabel = weekStart.format(WEEK_LABEL_FORMATTER);
            
            Map<String, Long> weeklyDist = getWeeklyRiskDistribution(startDateTime, endDateTime);

            history.add(RiskDistributionDTO.WeeklyRiskHistoryDTO.builder()
                    .week(weekLabel)
                    .high(weeklyDist.get("high"))
                    .medium(weeklyDist.get("medium"))
                    .low(weeklyDist.get("low"))
                    .build());
        }

        return history;
    }

    private Map<String, Long> getWeeklyRiskDistribution(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = burnoutScoreRepository.getRiskDistributionInRange(startDate, endDate);
        
        Map<String, Long> distribution = new HashMap<>();
        distribution.put("high", 0L);
        distribution.put("medium", 0L);
        distribution.put("low", 0L);

        for (Object[] row : results) {
            String riskLevel = row[0].toString();
            Long count = ((Number) row[1]).longValue();
            distribution.put(riskLevel.toLowerCase(), count);
        }

        return distribution;
    }

    private String determineDominantRisk(Long high, Long medium, Long low) {
        if (high >= medium && high >= low) return "HIGH";
        if (medium >= high && medium >= low) return "MEDIUM";
        return "LOW";
    }

    private String determineTrend(Double avgBurnout) {
        if (avgBurnout >= 70) return "up";
        if (avgBurnout >= 40) return "stable";
        return "down";
    }

    private double round(double value, int scale) {
        if (Double.isNaN(value)) return 0.0;
        BigDecimal bd = BigDecimal.valueOf(value);
        return bd.setScale(scale, RoundingMode.HALF_UP).doubleValue();
    }
}
