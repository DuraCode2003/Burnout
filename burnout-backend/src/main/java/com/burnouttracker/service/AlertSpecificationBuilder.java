package com.burnouttracker.service;

import com.burnouttracker.model.Alert;
import com.burnouttracker.model.enums.AlertStatus;
import com.burnouttracker.model.enums.AlertType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class AlertSpecificationBuilder {

    public Specification<Alert> buildDynamicQueueFilters(List<AlertStatus> statuses, AlertType type, UUID studentId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (statuses != null && !statuses.isEmpty()) {
                predicates.add(root.get("status").in(statuses));
            }

            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("alertType"), type));
            }

            if (studentId != null) {
                predicates.add(criteriaBuilder.equal(root.get("userId"), studentId));
            }

            // Default dashboard sorting logic - mimics "find first RED, then ORANGE..."
            if (query != null && query.getResultType() != Long.class && query.getResultType() != long.class) {
                query.orderBy(
                    criteriaBuilder.asc(
                        criteriaBuilder.selectCase()
                            .when(criteriaBuilder.equal(root.get("alertType"), AlertType.RED), 1)
                            .when(criteriaBuilder.equal(root.get("alertType"), AlertType.ORANGE), 2)
                            .when(criteriaBuilder.equal(root.get("alertType"), AlertType.YELLOW), 3)
                            .otherwise(4)
                    ),
                    criteriaBuilder.desc(root.get("createdAt"))
                );
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
