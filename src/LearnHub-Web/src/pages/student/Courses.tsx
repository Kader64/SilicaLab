import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import CourseCard from "../../components/course/CourseCard";
import EmptyState from "../../components/ui/EmptyState";
import FilterSelect from "../../components/ui/FilterSelect";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import SearchInput from "../../components/ui/SearchInput";
import { cn } from "../../lib/cn";
import { COURSE_LEVELS } from "../../lib/constants";
import { categories, courses } from "../../mocks/data";

const PAGE_SIZE = 9;
const ALL = "all";

const levelOptions = [{ value: ALL, label: "All levels" }, ...COURSE_LEVELS.map((l) => ({ value: l, label: l }))];
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

  // Changing a filter returns to the first page.
  const filter = <T,>(set: (value: T) => void) => (value: T) => {
    set(value);
    setPage(1);
  };

  // TODO API: GET /api/courses?search=&category=&level=&sort=&page=
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses
      .filter(
        (c) =>
          c.status === "Published" &&
          (category === ALL || c.category === category) &&
          (level === ALL || c.level === level) &&
          (!q || [c.title, c.description, c.teacher].some((text) => text.toLowerCase().includes(q))),
      )
      .sort((a, b) =>
        sort === "title" ? a.title.localeCompare(b.title) : sort === "oldest" ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt),
      );
  }, [query, category, level, sort]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageItems = visible.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function clearFilters() {
    setQuery("");
    setCategory(ALL);
    setLevel(ALL);
    setPage(1);
  }

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

      {pageItems.length === 0 ? (
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
          {pageItems.map((course) => (
            <li key={course.id}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
      )}

      <Pagination page={current} pageCount={pageCount} onChange={setPage} />
    </>
  );
}
