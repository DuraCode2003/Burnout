package com.burnouttracker.service;

import com.burnouttracker.dto.response.UserManagementDTO;
import com.burnouttracker.dto.response.admin.*;
import com.burnouttracker.model.enums.Role;
import com.burnouttracker.repository.BurnoutScoreRepository;
import com.burnouttracker.repository.MoodEntryRepository;
import com.burnouttracker.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final BurnoutScoreRepository burnoutScoreRepository;
    private final MoodEntryRepository moodEntryRepository;
    private final AdminAnalyticsService analyticsService;
    private final AdminStatsMapper statsMapper;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter WEEK_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MMM d");

    public AdminService(UserRepository userRepository,
                        BurnoutScoreRepository burnoutScoreRepository,
                        MoodEntryRepository moodEntryRepository,
                        AdminAnalyticsService analyticsService,
                        AdminStatsMapper statsMapper,
                        org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.burnoutScoreRepository = burnoutScoreRepository;
        this.moodEntryRepository = moodEntryRepository;
        this.analyticsService = analyticsService;
        this.statsMapper = statsMapper;
        this.passwordEncoder = passwordEncoder;
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
                ? statsMapper.round((activeThisWeek * 100.0) / totalStudents, 2)
                : 0.0;

        Map<String, Object> burnoutStats = analyticsService.getLatestBurnoutStats();
        Double avgBurnoutScore = (Double) burnoutStats.get("avgScore");
        Long highRiskCount = (Long) burnoutStats.get("highCount");
        Long mediumRiskCount = (Long) burnoutStats.get("mediumCount");
        Long lowRiskCount = (Long) burnoutStats.get("lowCount");

        Map<String, Double> moodStats = analyticsService.getMoodStatsForPeriod(weekAgo);
        Double avgMoodScore = moodStats.get("avgMood");
        Double avgSleepHours = moodStats.get("avgSleep");

        long activeLastWeek = userRepository.countDistinctActiveThisWeek(twoWeeksAgo);
        double trendVsLastWeek = activeLastWeek > 0
                ? statsMapper.round(((activeThisWeek - activeLastWeek) * 100.0) / activeLastWeek, 2)
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
            result.add(statsMapper.mapToDepartmentStatsDTO(row));
        }

        result.sort(Comparator.comparingLong(DepartmentStatsDTO::getStudentCount).reversed());
        return result;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public RiskDistributionDTO getRiskDistribution() {
        Map<String, Long> currentDistribution = analyticsService.getCurrentRiskDistribution();
        Long high = currentDistribution.getOrDefault("high", 0L);
        Long medium = currentDistribution.getOrDefault("medium", 0L);
        Long low = currentDistribution.getOrDefault("low", 0L);
        long total = (high != null ? high : 0L) + (medium != null ? medium : 0L) + (low != null ? low : 0L);

        double highPercent = total > 0 ? statsMapper.round(((high != null ? high : 0L) * 100.0) / total, 2) : 0.0;
        double mediumPercent = total > 0 ? statsMapper.round(((medium != null ? medium : 0L) * 100.0) / total, 2) : 0.0;
        double lowPercent = total > 0 ? statsMapper.round(((low != null ? low : 0L) * 100.0) / total, 2) : 0.0;

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

            Double avgBurnout = burnoutScoreRepository.getWeeklyAverageBurnout(startDateTime, endDateTime);
            Map<String, Double> moodStats = analyticsService.getMoodStatsForPeriodInRange(startDateTime, endDateTime);
            Long checkinCount = moodEntryRepository.countCheckinsInRange(startDateTime, endDateTime);

            WeeklyTrendDTO dto = statsMapper.mapToWeeklyTrendDTO(weekStart, weekEnd, avgBurnout != null ? avgBurnout : 0.0);
            dto.setWeekLabel(i == 0 ? "Current Week" : "Week " + (weeks - i));
            dto.setAvgMoodScore(moodStats.get("avgMood") != null ? statsMapper.round(moodStats.get("avgMood"), 2) : 0.0);
            dto.setAvgSleepHours(moodStats.get("avgSleep") != null ? statsMapper.round(moodStats.get("avgSleep"), 2) : 0.0);
            dto.setCheckinCount(checkinCount != null ? checkinCount : 0L);

            result.add(dto);
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
                    ? statsMapper.round((checkinCount * 100.0) / totalStudents, 2)
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

        for (int i = 7; i >= 0; i--) {
            LocalDate weekStart = today.minusWeeks(i).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate weekEnd = weekStart.plusDays(6);
            LocalDateTime startDateTime = weekStart.atStartOfDay();
            LocalDateTime endDateTime = weekEnd.atTime(23, 59, 59);

            String weekLabel = weekStart.format(WEEK_LABEL_FORMATTER);

            List<Object[]> deptScores = burnoutScoreRepository.getDepartmentScoresInRange(startDateTime, endDateTime);

            for (Object[] row : deptScores) {
                String department = row[0] != null ? row[0].toString() : "Unassigned";
                Double avgScore = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                Long studentCount = row[2] != null ? ((Number) row[2]).longValue() : 0L;

                heatmapData.add(HeatmapDataPoint.builder()
                        .department(department)
                        .week("Week " + (8 - i))
                        .weekLabel(weekLabel)
                        .avgScore(statsMapper.round(avgScore, 2))
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

    private List<RiskDistributionDTO.WeeklyRiskHistoryDTO> getWeeklyRiskHistory(int weeks) {
        List<RiskDistributionDTO.WeeklyRiskHistoryDTO> history = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = weeks - 1; i >= 0; i--) {
            LocalDate weekStart = today.minusWeeks(i).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate weekEnd = weekStart.plusDays(6);
            LocalDateTime startDateTime = weekStart.atStartOfDay();
            LocalDateTime endDateTime = weekEnd.atTime(23, 59, 59);

            String weekLabel = weekStart.format(WEEK_LABEL_FORMATTER);
            
            Map<String, Long> weeklyDist = analyticsService.getWeeklyRiskDistribution(startDateTime, endDateTime);

            history.add(RiskDistributionDTO.WeeklyRiskHistoryDTO.builder()
                    .week(weekLabel)
                    .high(weeklyDist.get("high"))
                    .medium(weeklyDist.get("medium"))
                    .low(weeklyDist.get("low"))
                    .build());
        }

        return history;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserManagementDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserManagementDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .department(user.getDepartment())
                        .isActive(user.getIsActive())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserManagementDTO updateUserRole(UUID userId, Role newRole) {
        com.burnouttracker.model.User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        user.setRole(newRole);
        com.burnouttracker.model.User savedUser = userRepository.save(user);

        return UserManagementDTO.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .department(savedUser.getDepartment())
                .isActive(savedUser.getIsActive())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UserManagementDTO createStaffUser(com.burnouttracker.dto.request.CreateStaffRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        if (request.getRole() != Role.ADMIN && request.getRole() != Role.COUNSELOR) {
            throw new IllegalArgumentException("Only ADMIN or COUNSELOR roles can be created via this endpoint");
        }

        com.burnouttracker.model.User user = com.burnouttracker.model.User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .department(request.getDepartment())
                .isActive(true)
                .build();

        com.burnouttracker.model.User savedUser = userRepository.save(user);

        return UserManagementDTO.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .department(savedUser.getDepartment())
                .isActive(savedUser.getIsActive())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }
}
