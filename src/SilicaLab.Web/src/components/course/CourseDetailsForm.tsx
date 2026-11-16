import { COURSE_LEVELS } from "../../lib/constants";
import { categories } from "../../mocks/data";
import type { Course } from "../../types";
import Field from "../ui/Field";

export default function CourseDetailsForm({ course }: { course?: Course }) {
  return (
    <section className="space-y-5 pb-8">
      <h2 className="section-title">Details</h2>
      <Field label="Title">
        {(control) => (
          <input
            {...control}
            name="title"
            className="input"
            defaultValue={course?.title}
            maxLength={150}
            required
          />
        )}
      </Field>
      <Field label="Description">
        {(control) => (
          <textarea
            {...control}
            name="description"
            className="input min-h-28"
            defaultValue={course?.description}
            required
          />
        )}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category">
          {(control) => (
            <select
              {...control}
              name="category"
              className="input"
              defaultValue={course?.category}
            >
              {categories.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Level">
          {(control) => (
            <select
              {...control}
              name="level"
              className="input"
              defaultValue={course?.level}
            >
              {COURSE_LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          )}
        </Field>
      </div>
    </section>
  );
}
