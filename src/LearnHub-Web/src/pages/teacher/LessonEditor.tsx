import MDEditor from "@uiw/react-md-editor";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LessonVideo from "../../components/lesson/LessonVideo";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Field from "../../components/ui/Field";
import PageHeader from "../../components/ui/PageHeader";
import { useNavigationGuard } from "../../hooks/useNavigationGuard";
import { validateVideoUrl } from "../../lib/video";
import { lessonContent, lessons } from "../../mocks/data";

export default function LessonEditor() {
  const { id, lessonId } = useParams(); // id = course id
  const navigate = useNavigate();
  const isNew = lessonId === "new";
  const coursePath = `/teach/courses/${id}`;

  // TODO API: GET /api/lessons/{lessonId} for an existing lesson
  const [initial] = useState(() => {
    const existing = lessons.find((l) => l.id === lessonId);
    return isNew || !existing
      ? {
          title: "",
          order: String(lessons.length + 1),
          content: "",
          videoUrl: "",
        }
      : {
          title: existing.title,
          order: String(existing.order),
          content: lessonContent,
          videoUrl: existing.videoUrl ?? "",
        };
  });
  const [title, setTitle] = useState(initial.title);
  const [order, setOrder] = useState(initial.order);
  const [content, setContent] = useState(initial.content);
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl);
  const [videoTouched, setVideoTouched] = useState(false);

  const videoError = validateVideoUrl(videoUrl);
  const dirty =
    title !== initial.title ||
    order !== initial.order ||
    content !== initial.content ||
    videoUrl !== initial.videoUrl;
  const guard = useNavigationGuard(dirty);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO API: POST /api/courses/{id}/lessons or PUT /api/lessons/{lessonId}
    guard.allowLeaving();
    navigate(coursePath);
  }

  return (
    <>
      <PageHeader
        title={isNew ? "New lesson" : "Edit lesson"}
        description="Write the lesson in Markdown. File uploads are not available."
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-4">
          <Field label="Title" className="sm:col-span-3">
            {(control) => (
              <input
                {...control}
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={150}
                required
              />
            )}
          </Field>
          <Field label="Order">
            {(control) => (
              <input
                {...control}
                type="number"
                className="input"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                min={1}
                required
              />
            )}
          </Field>
        </div>

        <div data-color-mode="light">
          <label htmlFor="lesson-content" className="label">
            Content
          </label>
          <MDEditor
            value={content}
            onChange={(value) => setContent(value ?? "")}
            preview="edit"
            height={320}
            visibleDragbar
            textareaProps={{ id: "lesson-content", required: true }}
          />
        </div>

        <Field
          label="Video URL (optional)"
          hint="Only YouTube and Vimeo links are accepted."
          error={videoTouched ? videoError : null}
        >
          {(control) => (
            <input
              {...control}
              type="url"
              className="input"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onBlur={() => setVideoTouched(true)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          )}
        </Field>
        {videoUrl && !videoError && (
          <LessonVideo url={videoUrl} title={title || "Preview"} />
        )}

        <div className="flex-row justify-between gap-3">
          <div className="flex gap-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!!videoError}
            >
              Save lesson
            </button>
            <Link to={coursePath} className="btn btn-secondary">
              Cancel
            </Link>
          </div>
          {dirty && (
            <span className="text-sm text-red-500">Unsaved changes</span>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={guard.blocked}
        title="Discard unsaved changes?"
        tone="danger"
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onConfirm={guard.leave}
        onCancel={guard.stay}
      >
        <p>
          You have changes in this lesson that are not saved. If you leave now,
          they will be lost.
        </p>
      </ConfirmDialog>
    </>
  );
}
