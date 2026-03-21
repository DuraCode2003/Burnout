"use client";

import { useState, useMemo, useCallback } from "react";
import { DepartmentStats } from "@/types/admin";

export type DepartmentSortKey = "risk" | "students" | "score" | "name";
export type SortOrder = "asc" | "desc";

interface UseDepartmentDataReturn {
  departments: DepartmentStats[];
  sortedDepartments: DepartmentStats[];
  sortBy: DepartmentSortKey;
  setSortBy: (key: DepartmentSortKey) => void;
  order: SortOrder;
  setOrder: (order: SortOrder) => void;
  filter: string;
  setFilter: (filter: string) => void;
  toggleSort: (key: DepartmentSortKey) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const riskLevelOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function useDepartmentData(
  departments: DepartmentStats[]
): UseDepartmentDataReturn {
  const [sortBy, setSortBy] = useState<DepartmentSortKey>("risk");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [filter, setFilter] = useState("");

  const sortedDepartments = useMemo(() => {
    let filtered = departments;

    // Apply text filter
    if (filter.trim()) {
      const searchLower = filter.toLowerCase();
      filtered = departments.filter((dept) =>
        dept.department.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "risk":
          comparison = riskLevelOrder[a.riskLevel] - riskLevelOrder[b.riskLevel];
          break;
        case "students":
          comparison = a.studentCount - b.studentCount;
          break;
        case "score":
          comparison = a.avgBurnoutScore - b.avgBurnoutScore;
          break;
        case "name":
          comparison = a.department.localeCompare(b.department);
          break;
      }

      return order === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [departments, sortBy, order, filter]);

  const toggleSort = useCallback(
    (key: DepartmentSortKey) => {
      if (sortBy === key) {
        setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(key);
        setOrder("desc");
      }
    },
    [sortBy]
  );

  const clearFilters = useCallback(() => {
    setFilter("");
    setSortBy("risk");
    setOrder("desc");
  }, []);

  const hasActiveFilters = useMemo(() => {
    return filter.trim() !== "" || sortBy !== "risk" || order !== "desc";
  }, [filter, sortBy, order]);

  return {
    departments,
    sortedDepartments,
    sortBy,
    setSortBy,
    order,
    setOrder,
    filter,
    setFilter,
    toggleSort,
    clearFilters,
    hasActiveFilters,
  };
}

export default useDepartmentData;
