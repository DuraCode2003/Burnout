package com.burnouttracker.service;

import com.burnouttracker.model.DailyTip;
import com.burnouttracker.repository.DailyTipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DailyTipService {
    private final DailyTipRepository dailyTipRepository;

    public Optional<DailyTip> getTodayTip() {
        return dailyTipRepository.findByDisplayDate(LocalDate.now());
    }

    public DailyTip getFallbackTip() {
        return DailyTip.builder()
            .content("Take a deep breath and stay focused on your goals.")
            .category("General")
            .build();
    }
}
