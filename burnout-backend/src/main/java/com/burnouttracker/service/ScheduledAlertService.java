package com.burnouttracker.service;

import com.burnouttracker.model.User;
import com.burnouttracker.model.enums.Role;
import com.burnouttracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledAlertService {

    private final UserRepository userRepository;
    private final AlertTriggerService alertTriggerService;

    /**
     * Proactive loop: Evaluate active student patterns twice a day.
     * This pushes scheduled alerts to RabbitMQ for the AI Agent to act upon,
     * maintaining proactive wellness monitoring during inactive student periods.
     */
    @Scheduled(cron = "${app.alert.schedule.cron:0 0 8,20 * * *}")
    @Transactional
    public void evaluateProactiveAlerts() {
        log.info("Starting scheduled proactive alert evaluation");

        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .toList();

        int evaluated = 0;
        for (User student : students) {
            try {
                alertTriggerService.evaluateAndTriggerAlert(student.getId());
                evaluated++;
            } catch (Exception e) {
                log.error("Failed to evaluate proactive alert for student UUID: {}", student.getId(), e);
            }
        }

        log.info("Completed proactive alert evaluation. Evaluated {} students.", evaluated);
    }
}
