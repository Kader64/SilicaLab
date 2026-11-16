import { useCallback, useState } from "react";
import type { Lesson } from "../types";

/** Which lessons the student has completed, and how many are left. */
export function useLessonProgress(lessons: Lesson[]) {
  const [completedIds, setCompletedIds] = useState(
    () => new Set(lessons.filter((l) => l.completed).map((l) => l.id)),
  );

  // TODO API: POST / DELETE /api/lessons/{id}/progress
  const complete = useCallback((id: string) => {
    setCompletedIds((prev) => new Set(prev).add(id));
  }, []);

  const undo = useCallback((id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return { completedIds, remaining: lessons.length - completedIds.size, complete, undo };
}
