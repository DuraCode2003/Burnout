package com.burnouttracker.controller;

import com.burnouttracker.model.DailyTip;
import com.burnouttracker.service.DailyTipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tips")
@RequiredArgsConstructor
public class DailyTipController {
    private final DailyTipService dailyTipService;

    @GetMapping("/today")
    public ResponseEntity<DailyTip> getTodayTip() {
        return ResponseEntity.ok(
            dailyTipService.getTodayTip().orElse(dailyTipService.getFallbackTip())
        );
    }
}
