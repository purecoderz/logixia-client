import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { inputClass } from "@/components/ui/formStyles";
import type { OutputTest } from "../../taskForm";

export function OutputTests({
  tests,
  onChange,
  disabled,
}: {
  tests: OutputTest[];
  onChange: (tests: OutputTest[]) => void;
  disabled: boolean;
}) {
  function change(index: number, patch: Partial<OutputTest>) {
    onChange(
      tests.map((test, i) => (i === index ? { ...test, ...patch } : test)),
    );
  }
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        Each test runs main.py in a fresh environment. Put answers for input()
        on separate lines. Exact compares the complete output; contains allows
        prompts and extra text. For numeric answers, exact is safer.
      </p>
      {tests.length === 0 && (
        <p className="rounded-lg border border-dashed border-line p-5 text-sm text-muted">
          No output tests yet. Add one, or use word rules and a custom test
          instead.
        </p>
      )}
      {tests.map((test, index) => (
        <div
          key={index}
          className="space-y-3 rounded-lg border border-line p-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Output test {index + 1}
            </h3>
            <Button
              variant="ghost"
              disabled={disabled}
              aria-label={`Remove output test ${index + 1}`}
              onClick={() => onChange(tests.filter((_, i) => i !== index))}
            >
              Remove
            </Button>
          </div>
          <Field label="Test name" htmlFor={`output-name-${index}`}>
            <input
              id={`output-name-${index}`}
              value={test.name}
              onChange={(event) => change(index, { name: event.target.value })}
              className={inputClass}
              placeholder="For example: Classifies a positive number"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Input"
              htmlFor={`output-input-${index}`}
              hint="Optional. One answer per line; leave blank for no input."
            >
              <textarea
                id={`output-input-${index}`}
                rows={4}
                value={test.input}
                onChange={(e) => change(index, { input: e.target.value })}
                className={`${inputClass} font-mono`}
                spellCheck={false}
              />
            </Field>
            <Field label="Expected output" htmlFor={`output-expected-${index}`}>
              <textarea
                id={`output-expected-${index}`}
                rows={4}
                value={test.expected}
                onChange={(e) => change(index, { expected: e.target.value })}
                className={`${inputClass} font-mono`}
                spellCheck={false}
              />
            </Field>
          </div>
          <Field label="Comparison" htmlFor={`output-mode-${index}`}>
            <Select
              id={`output-mode-${index}`}
              disabled={disabled}
              value={test.match}
              onChange={(value) =>
                change(index, { match: value as OutputTest["match"] })
              }
              options={[
                {
                  value: "exact",
                  label: "Exact",
                  description: "Compare all printed output",
                },
                {
                  value: "contains",
                  label: "Contains",
                  description: "Expected text appears anywhere in the output",
                },
              ]}
            />
          </Field>
        </div>
      ))}
      <Button
        variant="ghost"
        disabled={disabled}
        onClick={() =>
          onChange([
            ...tests,
            { name: "", input: "", expected: "", match: "exact" },
          ])
        }
      >
        Add output test
      </Button>
    </div>
  );
}
