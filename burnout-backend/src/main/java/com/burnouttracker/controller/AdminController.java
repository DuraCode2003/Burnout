package com.burnouttracker.controller;

import com.burnouttracker.dto.request.UpdateRoleRequest;
import com.burnouttracker.dto.response.UserManagementDTO;
import com.burnouttracker.dto.response.admin.*;
import com.burnouttracker.service.AdminService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * GET /api/admin/stats
     * Returns campus-wide aggregate statistics (anonymized)
     */
    @GetMapping("/stats")
    public ResponseEntity<CampusStatsDTO> getCampusStats() {
        CampusStatsDTO stats = adminService.getCampusStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/admin/department-stats
     * Returns per-department breakdown (anonymized aggregates)
     */
    @GetMapping("/department-stats")
    public ResponseEntity<List<DepartmentStatsDTO>> getDepartmentStats() {
        List<DepartmentStatsDTO> stats = adminService.getDepartmentStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/admin/risk-distribution
     * Returns risk level distribution with 8-week history
     */
    @GetMapping("/risk-distribution")
    public ResponseEntity<RiskDistributionDTO> getRiskDistribution() {
        RiskDistributionDTO distribution = adminService.getRiskDistribution();
        return ResponseEntity.ok(distribution);
    }

    /**
     * GET /api/admin/weekly-trends
     * Returns weekly trends for specified number of weeks (default 8)
     */
    @GetMapping("/weekly-trends")
    public ResponseEntity<List<WeeklyTrendDTO>> getWeeklyTrends(
            @RequestParam(name = "weeks", defaultValue = "8") int weeks) {
        List<WeeklyTrendDTO> trends = adminService.getWeeklyTrends(weeks);
        return ResponseEntity.ok(trends);
    }

    /**
     * GET /api/admin/checkin-rates
     * Returns daily check-in rates for last 30 days
     */
    @GetMapping("/checkin-rates")
    public ResponseEntity<List<DailyCheckinDTO>> getCheckinRates() {
        List<DailyCheckinDTO> rates = adminService.getCheckinRates();
        return ResponseEntity.ok(rates);
    }

    /**
     * GET /api/admin/export/csv
     * Downloads CSV report with aggregated campus analytics
     * NO individual student data included
     */
    @GetMapping(value = "/export/csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportCSV() {
        byte[] csvContent = adminService.exportCSV();

        String fileName = "campus-report-" + 
                LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE) + ".csv";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", fileName);
        headers.setCacheControl("no-cache, no-store, must-revalidate");
        headers.setPragma("no-cache");
        headers.setExpires(0L);

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvContent);
    }

    /**
     * GET /api/admin/heatmap-data
     * Returns department × week heatmap data for last 8 weeks
     * Used for visual stress pattern analysis
     */
    @GetMapping("/heatmap-data")
    public ResponseEntity<List<HeatmapDataPoint>> getHeatmapData() {
        List<HeatmapDataPoint> data = adminService.getHeatmapData();
        return ResponseEntity.ok(data);
    }

    /**
     * GET /api/admin/users
     * Returns all users in the system (Admin only)
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserManagementDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    /**
     * PUT /api/admin/users/{userId}/role
     * Updates a user's role (Admin only)
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<UserManagementDTO> updateUserRole(
            @PathVariable UUID userId,
            @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(userId, request.getRole()));
    }

    /**
     * POST /api/admin/users/staff
     * Creates a new staff member (Admin/Counselor)
     */
    @PostMapping("/users/staff")
    public ResponseEntity<UserManagementDTO> createStaffUser(
            @RequestBody com.burnouttracker.dto.request.CreateStaffRequest request) {
        return ResponseEntity.ok(adminService.createStaffUser(request));
    }
}
