import { AlertCircle, Search } from "lucide-react";
import { useState } from "react";
import CourseCard from "../../components/course/CourseCard";
import EmptyState from "../../components/ui/EmptyState";
import FilterSelect from "../../components/ui/FilterSelect";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import { cn } from "../../lib/cn";
import { useCategories, useCourses } from "../../queries/courses.query";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { COURSE_LEVELS } from "../../types/courses";

const PAGE_SIZE = 9;
const ALL = "all";

const levelOptions = [
  { value: ALL, label: "All levels" },
  ...COURSE_LEVELS.map((l) => ({ value: l, label: l })),
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title A-Z" },
];

export default function Courses() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [level, setLevel] = useState(ALL);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  const { data: categories = [] } = useCategories();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useCourses({
    search: debouncedQuery,
    category,
    level,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  const filter = <T,>(set: (value: T) => void) => (value: T) => {
    set(value);
    setPage(1);
  };

  function clearFilters() {
    setQuery("");
    setCategory(ALL);
    setLevel(ALL);
    setSort("newest");
    setPage(1);
  }

  const items = data?.items ?? [];
  const currentPage = data?.page ?? page;
  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      <PageHeader title="Browse courses" description="Find a course and start learning today." />

      <div className="toolbar">
        <SearchInput value={query} onChange={filter(setQuery)} placeholder="Search courses..." />
        <FilterSelect label="Level" value={level} onChange={filter(setLevel)} options={levelOptions} />
        <FilterSelect label="Sort by" value={sort} onChange={filter(setSort)} options={sortOptions} />
      </div>

      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Category">
        {[ALL, ...categories.map((c) => c.name)].map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={category === name}
            onClick={() => filter(setCategory)(name)}
            className={cn("chip", category === name && "chip-active")}
          >
            {name === ALL ? "All" : name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading courses">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="card-feature h-80 animate-pulse bg-surface-muted" />
          ))}
        </ul>
      ) : isError ? (
        <div className="card">
          <EmptyState
            icon={AlertCircle}
            title="Could not load courses"
            description="Something went wrong while fetching courses."
            action={
              <button type="button" className="btn btn-secondary" onClick={() => refetch()}>
                Try again
              </button>
            }
          />
        </div>
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Search}
            title="No courses found"
            description="Try a different search or clear the filters."
            action={
              <button type="button" className="btn btn-secondary" onClick={clearFilters}>
                Clear filters
              </button>
            }
          />
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((course) => (
            <li key={course.id}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
      )}

      <Pagination page={currentPage} pageCount={totalPages} onChange={setPage} />
    </>
  );
}