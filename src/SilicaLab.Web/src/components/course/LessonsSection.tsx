import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ClipboardCheck,
  Lock,
  Pencil,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import type { Lesson } from "../../types";
import ConfirmDialog from "../ui/ConfirmDialog";
import EmptyState from "../ui/EmptyState";

interface Props {
  courseId: string;
  initialLessons: Lesson[];
  examQuestionCount?: number;
  readOnly?: boolean;
}

export default function LessonsSection({
  courseId,
  initialLessons,
  examQuestionCount = 0,
  readOnly = false,
}: Props) {
  const [items, setItems] = useState(initialLessons);
  const [toDelete, setToDelete] = useState<Lesson | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // TODO API: PUT /api/courses/{id}/lessons/order, DELETE /api/lessons/{id}
  const renumber = (list: Lesson[]) =>
    list.map((l, i) => ({ ...l, order: i + 1 }));

  function move(index: number, direction: -1 | 1) {
    const next = [...items];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    setItems(renumber(next));
  }

  function handleDragStart(e: DragEvent<HTMLLIElement>, id: string) {
    if (readOnly) {
      e.preventDefault();
      return;
    }
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(e: DragEvent<HTMLLIElement>, targetId: string) {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== targetId) setDragOverId(targetId);
  }

  function handleDrop(e: DragEvent<HTMLLIElement>, targetId: string) {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      resetDrag();
      return;
    }

    const fromIndex = items.findIndex((l) => l.id === draggedId);
    const toIndex = items.findIndex((l) => l.id === targetId);
    if (fromIndex !== -1 && toIndex !== -1) {
      const next = [...items];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      setItems(renumber(next));
    }

    resetDrag();
  }

  function resetDrag() {
    setDraggedId(null);
    setDragOverId(null);
  }

  function remove() {
    if (toDelete) setItems(renumber(items.filter((l) => l.id !== toDelete.id)));
    setToDelete(null);
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="section-title">Lessons</h2>
          <span className="text-sm text-muted">{items.length} in total</span>
        </div>
        {!readOnly && (
          <Link
            to={`/teach/courses/${courseId}/lessons/new`}
            className="btn btn-secondary"
          >
            <Plus size={16} /> Add lesson
          </Link>
        )}
      </div>

      {items.length === 0 && (
        <div className="mt-5 rounded-lg border border-dashed border-line-strong">
          <EmptyState
            icon={BookOpen}
            title="No lessons yet"
            description="Add the first lesson to start building the course."
          />
        </div>
      )}

      <ul className="mt-5 divide-y divide-line border-y border-line">
        {items.map((lesson, index) => {
          const isDragging = draggedId === lesson.id;
          const isOver = dragOverId === lesson.id && draggedId !== lesson.id;

          return (
            <li
              key={lesson.id}
              draggable={!readOnly}
              onDragStart={(e) => handleDragStart(e, lesson.id)}
              onDragOver={(e) => handleDragOver(e, lesson.id)}
              onDragLeave={() =>
                setDragOverId((prev) => (prev === lesson.id ? null : prev))
              }
              onDrop={(e) => handleDrop(e, lesson.id)}
              onDragEnd={resetDrag}
              className={`flex items-center gap-4 py-3.5 transition-colors ${
                !readOnly
                  ? "cursor-grab select-none active:cursor-grabbing"
                  : ""
              } ${isDragging ? "opacity-40" : ""} ${
                isOver ? "border-t-2 border-t-accent bg-accent-soft/25" : ""
              }`}
            >
              <span className="w-7 text-base font-semibold tabular-nums text-muted">
                {lesson.order}
              </span>
              <span className="flex-1 text-base font-semibold text-ink">
                {lesson.title}
              </span>
              {lesson.videoUrl && (
                <span title="Has video" className="text-muted">
                  <Video size={18} aria-label="Has video" />
                </span>
              )}
              <span className="hidden w-16 text-right text-sm tabular-nums text-muted sm:block">
                {lesson.duration}
              </span>
              {!readOnly && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Move "${lesson.title}" up`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp size={20} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Move "${lesson.title}" down`}
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown size={20} />
                  </button>
                  <Link
                    to={`/teach/courses/${courseId}/lessons/${lesson.id}`}
                    className="icon-btn"
                    aria-label={`Edit "${lesson.title}"`}
                    draggable={false}
                  >
                    <Pencil size={20} />
                  </Link>
                  <button
                    type="button"
                    className="icon-btn icon-btn-danger"
                    aria-label={`Delete "${lesson.title}"`}
                    onClick={() => setToDelete(lesson)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </li>
          );
        })}

        {/* Pinned Final Exam row — always last, cannot be dragged */}
        <li
          draggable={false}
          onDragOver={(e) => e.preventDefault()}
          className="flex items-center gap-4 bg-page/60 py-3.5"
        >
          <span
            className="flex w-7 items-center text-accent"
            title="Final exam stays at the end"
          >
            <ClipboardCheck size={20} aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <span className="text-base font-semibold text-ink">Final exam</span>
            <span className="ml-2.5 text-sm text-muted">
              {examQuestionCount === 0
                ? "No questions yet"
                : `${examQuestionCount} ${examQuestionCount === 1 ? "question" : "questions"}`}
            </span>
          </div>

          <span
            className="flex items-center gap-1 text-xs font-medium text-muted"
            title="Final exam cannot be moved"
          >
            <Lock size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Locked at end</span>
          </span>

          {!readOnly && (
            <Link
              to={`/teach/courses/${courseId}/exam`}
              className="icon-btn"
              aria-label="Edit final exam"
            >
              <Pencil size={20} />
            </Link>
          )}
        </li>
      </ul>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this lesson?"
        tone="danger"
        confirmLabel="Delete lesson"
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      >
        <p>
          <strong className="text-ink">{toDelete?.title}</strong> will be
          removed from the course. Students lose their progress on it.
        </p>
      </ConfirmDialog>
    </section>
  );
}
