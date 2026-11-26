import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { coursesApi } from "../api/courses.api";
import type { CourseQueryParams } from "../types/courses";

export const courseKeys = {
  all: ["courses"] as const,
  categories: () => [...courseKeys.all, "categories"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (params: CourseQueryParams) => [...courseKeys.lists(), params] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: courseKeys.categories(),
    queryFn: coursesApi.getCategories,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCourses(params: CourseQueryParams) {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => coursesApi.getCourses(params),
    placeholderData: keepPreviousData,
  });
}