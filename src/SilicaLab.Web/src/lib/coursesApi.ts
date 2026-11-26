import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  CategoryDto,
  CourseQueryParams,
  CourseSummaryDto,
  PagedResponse,
} from "../types/courses";
import { api } from "./api";

export const coursesApi = {
  getCategories: () =>
    api.get<CategoryDto[]>("/courses/categories").then((r) => r.data),

  getCourses: (params: CourseQueryParams) =>
    api
      .get<PagedResponse<CourseSummaryDto>>("/courses", {
        params: {
          search: params.search || undefined,
          category:
            params.category && params.category !== "all"
              ? params.category
              : undefined,
          level:
            params.level && params.level !== "all" ? params.level : undefined,
          sort: params.sort || undefined,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 9,
        },
      })
      .then((r) => r.data),
};

export function useCategories() {
  return useQuery({
    queryKey: ["courses", "categories"],
    queryFn: coursesApi.getCategories,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCourses(params: CourseQueryParams) {
  return useQuery({
    queryKey: ["courses", "list", params],
    queryFn: () => coursesApi.getCourses(params),
    placeholderData: keepPreviousData,
  });
}
