import { Plus, Trash2 } from "lucide-react";
import { uid } from "../../lib/uid";

export interface EditorQuestion {
  id: string;
  text: string;
  answers: { id: string; text: string }[];
  /** Index in `answers`. */
  correct: number;
}

const MIN_ANSWERS = 2;
const MAX_ANSWERS = 6;

interface Props {
  question: EditorQuestion;
  index: number;
  onChange: (question: EditorQuestion) => void;
  onDelete: () => void;
}

export default function QuestionEditor({ question, index, onChange, onDelete }: Props) {
  const { answers } = question;

  function setAnswerText(answerId: string, text: string) {
    onChange({ ...question, answers: answers.map((a) => (a.id === answerId ? { ...a, text } : a)) });
  }

  function addAnswer() {
    onChange({ ...question, answers: [...answers, { id: uid(), text: "" }] });
  }

  function removeAnswer(position: number) {
    const correct = position === question.correct ? 0 : position < question.correct ? question.correct - 1 : question.correct;
    onChange({ ...question, answers: answers.filter((_, i) => i !== position), correct });
  }

  return (
    <li className="py-6">
      <div className="flex items-start gap-3">
        <span className="w-6 pt-2.5 text-sm tabular-nums text-muted">{index + 1}.</span>
        <input
          className="input font-semibold"
          aria-label={`Question ${index + 1}`}
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          required
        />
        <button type="button" className="icon-btn icon-btn-danger mt-0.5" aria-label={`Delete question ${index + 1}`} onClick={onDelete}>
          <Trash2 size={18} />
        </button>
      </div>

      <fieldset className="mt-4 space-y-2.5 pl-9">
        <legend className="sr-only">Answers to question {index + 1}. Select the correct one.</legend>
        {answers.map((answer, position) => (
          <div key={answer.id} className="flex items-center gap-3">
            <input
              type="radio"
              name={`correct-${question.id}`}
              checked={question.correct === position}
              onChange={() => onChange({ ...question, correct: position })}
              className="h-4 w-4 accent-accent"
              aria-label={`Mark answer ${position + 1} as correct`}
            />
            <input
              className="input"
              aria-label={`Answer ${position + 1}`}
              value={answer.text}
              onChange={(e) => setAnswerText(answer.id, e.target.value)}
              required
            />
            <button
              type="button"
              className="icon-btn"
              aria-label={`Delete answer ${position + 1}`}
              disabled={answers.length <= MIN_ANSWERS}
              onClick={() => removeAnswer(position)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary btn-sm" disabled={answers.length >= MAX_ANSWERS} onClick={addAnswer}>
          <Plus size={14} /> Add answer
        </button>
      </fieldset>
    </li>
  );
}
