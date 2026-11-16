import { Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import QuestionEditor, {
  type EditorQuestion,
} from "../../components/examEditor/QuestionEditor";
import Field from "../../components/ui/Field";
import PageHeader from "../../components/ui/PageHeader";
import { examQuestions, examSettings } from "../../mocks/data";
import { uid } from "../../lib/uid";

const newQuestion = (): EditorQuestion => ({
  id: uid(),
  text: "",
  answers: [
    { id: uid(), text: "" },
    { id: uid(), text: "" },
  ],
  correct: 0,
});

export default function ExamEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  // TODO API: GET /api/courses/{id}/exam
  const [questions, setQuestions] = useState<EditorQuestion[]>(() =>
    examQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      correct: q.correct,
      answers: q.answers.map((text) => ({ id: uid(), text })),
    })),
  );

  const complete = questions.every(
    (q) => q.text.trim() && q.answers.every((a) => a.text.trim()),
  );
  const canSave = questions.length > 0 && complete;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // TODO API: PUT /api/courses/{id}/exam
        navigate(`/teach/courses/${id}`);
      }}
    >
      <PageHeader
        title="Edit exam"
        description="Single choice questions: 2-6 answers each, exactly one correct."
        actions={
          <Link to={`/teach/courses/${id}`} className="btn btn-secondary">
            Back to course
          </Link>
        }
      />

      <section className="grid gap-5 pb-8 sm:grid-cols-3">
        <Field label="Pass mark (%)" hint="Between 0 and 100.">
          {(control) => (
            <input
              {...control}
              type="number"
              className="input"
              defaultValue={examSettings.passMarkPercent}
              min={0}
              max={100}
              required
            />
          )}
        </Field>
        <Field label="Max attempts" hint="Leave empty for unlimited.">
          {(control) => (
            <input
              {...control}
              type="number"
              className="input"
              placeholder="Unlimited"
              min={1}
            />
          )}
        </Field>
        <Field label="Time limit (minutes)" hint="Optional.">
          {(control) => (
            <input
              {...control}
              type="number"
              className="input"
              placeholder="No limit"
              min={1}
            />
          )}
        </Field>
      </section>

      {questions.length === 0 ? (
        <p className="alert alert-warning">
          The exam needs at least one question before the course can be
          published.
        </p>
      ) : (
        <ol className="divide-y divide-line border-y border-line">
          {questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              onChange={(next) =>
                setQuestions(
                  questions.map((q) => (q.id === next.id ? next : q)),
                )
              }
              onDelete={() =>
                setQuestions(questions.filter((q) => q.id !== question.id))
              }
            />
          ))}
        </ol>
      )}

      <div className=" mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setQuestions([...questions, newQuestion()])}
        >
          <Plus size={16} /> Add question
        </button>
        <div className="flex items-center gap-3">
          {!canSave && questions.length > 0 && (
            <span className="text-sm text-muted">
              Fill in every question and answer to save.
            </span>
          )}
          <button type="submit" className="btn btn-primary" disabled={!canSave}>
            Save exam
          </button>
        </div>
      </div>
    </form>
  );
}
