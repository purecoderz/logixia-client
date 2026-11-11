import type { QuizTaskInput } from "./quizForm";
export interface OutputTest {
  name: string;
  input: string;
  expected: string;
  match: "exact" | "contains";
}
export interface TaskTests {
  check_syntax: boolean;
  require_main_guard: boolean;
  required_words: string[];
  forbidden_words: string[];
  output_tests: OutputTest[];
  custom_test: string;
}
export interface CodeTaskInput {
  title: string;
  type: "code";
  instructions: string;
  starter_files: Record<string, string>;
  tests: TaskTests;
}
export type TaskInput = CodeTaskInput | QuizTaskInput;
export type TaskDocument = TaskInput & {
  id: number;
  lesson_id: number | null;
  task_order: number | null;
  owner_cohort_id: number | null;
  created_by_id?: string | null;
};
export type TaskSection =
  "details" | "files" | "rules" | "output" | "custom" | "preview";
export interface TaskProblem {
  section: TaskSection;
  field: string;
  message: string;
}

export const emptyTask = (): CodeTaskInput => ({
  title: "",
  type: "code",
  instructions: "",
  starter_files: {
    "main.py":
      'def main():\n    # Write your code here\n    pass\n\n\nif __name__ == "__main__":\n    main()\n',
  },
  tests: {
    check_syntax: true,
    require_main_guard: true,
    required_words: [],
    forbidden_words: [],
    output_tests: [],
    custom_test: "",
  },
});
export const wordsFrom = (value: string) => [
  ...new Set(value.split(/[\s,]+/).filter(Boolean)),
];
export const validPythonPath = (value: string) =>
  /^(?:[A-Za-z_]\w*\/)*[A-Za-z_]\w*\.py$/.test(value);

export function validateTask(task: CodeTaskInput): TaskProblem[] {
  const errors: TaskProblem[] = [];
  const add = (section: TaskSection, field: string, message: string) =>
    errors.push({ section, field, message });
  if (!task.title.trim() || task.title.trim().length > 200)
    add("details", "task-title", "Enter a title between 1 and 200 characters.");
  if (!task.instructions.trim())
    add("details", "task-instructions", "Add instructions for the student.");
  if (!Object.hasOwn(task.starter_files, "main.py"))
    add("files", "starter-code", "The project must include main.py.");
  for (const name of Object.keys(task.starter_files))
    if (!validPythonPath(name))
      add(
        "files",
        "starter-code",
        `Invalid Python file path: ${name}. Use relative paths such as helpers.py or utils/helpers.py.`,
      );
  for (const word of [
    ...task.tests.required_words,
    ...task.tests.forbidden_words,
  ])
    if (!/^[A-Za-z_]\w*$/.test(word))
      add(
        "rules",
        "required-words",
        `“${word}” is not a whole code word. Use identifiers or keywords.`,
      );
  const conflict = task.tests.required_words.find((word) =>
    task.tests.forbidden_words.includes(word),
  );
  if (conflict)
    add(
      "rules",
      "forbidden-words",
      `“${conflict}” cannot be both required and forbidden.`,
    );
  task.tests.output_tests.forEach((test, index) => {
    if (!test.name.trim())
      add("output", `output-name-${index}`, "Give this output test a name.");
    if (!["exact", "contains"].includes(test.match))
      add("output", `output-mode-${index}`, "Choose an output comparison.");
    if (test.match === "contains" && !test.expected)
      add(
        "output",
        `output-expected-${index}`,
        "Contains checks need expected text; an empty string always matches.",
      );
  });
  if (
    task.tests.custom_test.trim() &&
    !/^\s*def\s+test_student\s*\(\s*student\s*\)\s*:/m.test(
      task.tests.custom_test,
    )
  )
    add(
      "custom",
      "custom-test",
      "Define the custom test as def test_student(student):.",
    );
  return errors;
}

export function taskPayload(task: CodeTaskInput): CodeTaskInput {
  return {
    ...task,
    title: task.title.trim(),
    tests: { ...task.tests, custom_test: task.tests.custom_test.trim() },
  };
}
