import { cn } from "../../lib/cn";
import type { StudentQuestion } from "../../types";

type Props = {
  question: StudentQuestion;
  index: number;
  total: number;
  selected?: number;
  /** Highlights the card as unanswered (after a review request). */
  missing: boolean;
  onSelect: (answerIndex: number) => void;
};

export default function QuestionCard({ question, index, total, selected, missing, onSelect }: Props) {
  return (
    <li
      id={`question-${question.id}`}
      className={cn("card-feature p-5 shadow-none sm:p-6", missing && "border-danger")}
    >
      <fieldset aria-describedby={missing ? `missing-${question.id}` : undefined}>
        <legend className="w-full">
          <span className="eyebrow block">
            Question {index + 1} of {total}
          </span>
          <span className="mt-1.5 block text-base font-bold leading-snug text-ink sm:text-lg">{question.text}</span>
        </legend>

        <div className="mt-4 space-y-2.5">
          {question.answers.map((answer, i) => (
            <label
              key={`${question.id}-${i}`}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm transition-colors hover:bg-page has-checked:border-accent has-checked:bg-accent-soft has-checked:font-semibold has-checked:text-accent-dark has-focus-visible:ring-2 has-focus-visible:ring-accent"
            >
              <input
                type="radio"
                name={question.id}
                value={i}
                checked={selected === i}
                onChange={() => onSelect(i)}
                className="h-4 w-4 shrink-0 accent-accent"
              />
              <span>{answer}</span>
            </label>
          ))}
        </div>
        {missing && (
          <p id={`missing-${question.id}`} className="field-error mt-3 font-semibold">
            Choose an answer.
          </p>
        )}
      </fieldset>
    </li>
  );
}
