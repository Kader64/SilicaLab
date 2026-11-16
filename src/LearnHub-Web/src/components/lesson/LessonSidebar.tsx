import ProgressBar from "../ui/ProgressBar";
import LessonList, { type LessonListProps } from "./LessonList";

type Props = Omit<LessonListProps, "onNavigate"> & { courseTitle: string };

/** Sticky lesson list for desktop. On small screens use MobileLessonMenu. */
export default function LessonSidebar({ courseTitle, ...list }: Props) {
  return (
    <aside aria-label="Course lessons" className="hidden lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:block lg:self-start">
      <p className="font-bold text-ink">{courseTitle}</p>
      <div className="mt-3">
        <ProgressBar done={list.completedIds.size} total={list.lessons.length} />
      </div>
      <div className="mt-4 max-h-[calc(100dvh-var(--header-h)-9rem)] overflow-y-auto">
        <LessonList {...list} />
      </div>
    </aside>
  );
}
