import { useState } from "react";
import { Button } from "../../../../components/ui/Button";
import { Field, fieldProps } from "../../../../components/ui/Field";
import { inputClass } from "../../../../components/ui/formStyles";
import { Markdown } from "../../../../components/ui/Markdown";
import { MarkdownEditor } from "../../../../components/ui/MarkdownEditor";
import { PrefixInput } from "../../../../components/ui/PrefixInput";
import { TagInput } from "../../../../components/ui/TagInput";
import {
  emptyCourseForm,
  type CourseFormErrors,
  type CourseFormField,
  type CourseFormValues,
  type Language,
} from "../../types/form";
import { formatPrice } from "../../utils/formatPrice";
import { formatPriceInput, parsePrice } from "../../utils/priceInput";
import { slugify } from "../../utils/slugify";
import { getSaleChecklist, hasErrors, validateCourseForm } from "../../utils/validateCourseForm";

export type SubmitAction = "draft" | "builder";

interface CreateCourseFormProps {
  languages: Language[];
  /** Return field errors from the server (like a duplicate title) to show them on the form. */
  onSubmit: (values: CourseFormValues, action: SubmitAction) => Promise<CourseFormErrors | void>;
  onCancel: () => void;
}

// Order the fields appear in, so we can focus the first one with a problem
const FIELD_ORDER: CourseFormField[] = ["title", "slug", "languageId", "description", "skills", "price"];

const sectionClass = "space-y-5 border-b border-gray-800 p-6";

export function CreateCourseForm({ languages, onSubmit, onCancel }: CreateCourseFormProps) {
  const [values, setValues] = useState<CourseFormValues>(emptyCourseForm);
  const [errors, setErrors] = useState<CourseFormErrors>({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /** Update fields. After a first submit attempt, re-check only the fields that changed. */
  function change(patch: Partial<CourseFormValues>) {
    const updated = { ...values, ...patch };
    setValues(updated);
    if (!attempted) return;

    const fresh = validateCourseForm(updated);
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as CourseFormField[]) {
        if (fresh[key]) next[key] = fresh[key];
        else delete next[key];
      }
      return next;
    });
  }

  async function submit(action: SubmitAction) {
    setAttempted(true);
    const found = validateCourseForm(values);
    setErrors(found);

    if (hasErrors(found)) {
      const first = FIELD_ORDER.find((f) => found[f]);
      if (first) document.getElementById(first)?.focus();
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const serverErrors = await onSubmit(values, action);
      if (serverErrors) {
        setErrors(serverErrors);
        const first = FIELD_ORDER.find((f) => serverErrors[f]);
        if (first) document.getElementById(first)?.focus();
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const language = languages.find((l) => String(l.id) === values.languageId);
  const price = parsePrice(values.price);
  const checklist = getSaleChecklist(values);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:items-start">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit("draft");
        }}
        className="rounded-xl border border-gray-800 bg-gray-800/30"
      >
        <section className={sectionClass}>
          <div>
            <h2 className="text-base font-semibold text-gray-50">Basics</h2>
            <p className="mt-1 text-sm text-gray-400">What students see first.</p>
          </div>

          <Field label="Title" htmlFor="title" error={errors.title}>
            <input
              {...fieldProps("title", errors.title)}
              value={values.title}
              onChange={(e) => {
                const title = e.target.value;
                change(slugTouched ? { title } : { title, slug: slugify(title) });
              }}
              className={inputClass}
            />
          </Field>

          <Field
            label="Web address"
            htmlFor="slug"
            error={errors.slug}
            hint="Filled in from the title. Change it if you want something shorter."
          >
            <PrefixInput
              {...fieldProps("slug", errors.slug, true)}
              leading="/courses/"
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                change({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") });
              }}
            />
          </Field>

          <Field label="Language" htmlFor="languageId" error={errors.languageId}>
            <select
              {...fieldProps("languageId", errors.languageId)}
              value={values.languageId}
              onChange={(e) => change({ languageId: e.target.value })}
              className={inputClass}
            >
              <option value="">Choose a language</option>
              {languages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>

          <MarkdownEditor
            id="description"
            label="Description"
            value={values.description}
            onChange={(description) => change({ description })}
            error={errors.description}
            hint="Markdown is supported. Optional for a draft, but needed before you put the course on sale."
          />
        </section>

        <section className={sectionClass}>
          <div>
            <h2 className="text-base font-semibold text-gray-50">What students will learn</h2>
            <p className="mt-1 text-sm text-gray-400">Short skills, one at a time. They appear as tags on the course page.</p>
          </div>
          <Field label="Skills" htmlFor="skills" error={errors.skills}>
            <TagInput
              id="skills"
              value={values.skills}
              onChange={(skills) => change({ skills })}
              placeholder="Add a skill and press Enter"
            />
          </Field>
        </section>

        <section className={sectionClass}>
          <div>
            <h2 className="text-base font-semibold text-gray-50">Self-paced price</h2>
            <p className="mt-1 text-sm text-gray-400">
              What a student pays to take this course on their own. Cohorts have their own price.
            </p>
          </div>
          <div className="max-w-64">
            <Field label="Price" htmlFor="price" error={errors.price} hint="Enter 0 for a free course.">
              <PrefixInput
                {...fieldProps("price", errors.price, true)}
                leading="₦"
                inputMode="numeric"
                value={values.price}
                onChange={(e) => change({ price: e.target.value })}
                onBlur={() => change({ price: formatPriceInput(values.price) })}
              />
            </Field>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          {formError && (
            <p role="alert" className="w-full text-sm text-red-400">
              {formError}
            </p>
          )}
          <p className="max-w-xs text-sm text-gray-400">
            Saves as a draft. Add modules and lessons next, or create a cohort on it right away.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button variant="ghost" type="submit" disabled={saving}>
              Save draft
            </Button>
            <Button onClick={() => void submit("builder")} disabled={saving}>
              Save and add modules
            </Button>
          </div>
        </div>
      </form>

      <aside aria-label="Preview and checklist" className="space-y-4 lg:sticky lg:top-6">
        <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-5">
          <p className="mb-3 text-xs font-semibold text-gray-400">How students will see it</p>
          <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
            <span className="inline-block rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold text-sky-300">
              {language?.name ?? "Language"}
            </span>
            <p className={`text-base font-semibold leading-snug ${values.title.trim() ? "text-gray-50" : "text-gray-500"}`}>
              {values.title.trim() || "Your course title"}
            </p>
            {values.description.trim() ? (
              <div className="max-h-36 overflow-hidden">
                <Markdown>{values.description}</Markdown>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Your description appears here.</p>
            )}
            {values.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {values.skills.slice(0, 2).map((s) => (
                  <span key={s} className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                    {s}
                  </span>
                ))}
                {values.skills.length > 2 && (
                  <span className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                    +{values.skills.length - 2}
                  </span>
                )}
              </div>
            )}
            <p className="border-t border-gray-800 pt-3 text-[15px] font-semibold text-gray-50">
              {price === null ? "—" : formatPrice(price)}{" "}
              <span className="text-xs font-normal text-gray-400">self-paced</span>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-5">
          <p className="mb-3 text-xs font-semibold text-gray-400">Before you can sell it self-paced</p>
          <ul className="space-y-3 text-sm text-gray-300">
            {checklist.map((item) => (
              <li key={item.key} className="flex items-center gap-2.5">
                <CheckIcon done={item.done} />
                <span className={item.done ? "" : "text-gray-400"}>{item.label}</span>
              </li>
            ))}
            <li className="flex items-center gap-2.5 text-gray-400">
              <CheckIcon done={false} />
              At least one module with a lesson
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-gray-400">
            None of this is needed to run a cohort on the course.
          </p>
        </div>
      </aside>
    </div>
  );
}

function CheckIcon({ done }: { done: boolean }) {
  return done ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Done" role="img">
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6b7280" strokeWidth="1.8" aria-label="Not done" role="img">
      <circle cx="8" cy="8" r="5.5" />
    </svg>
  );
}