import {
  emptyTask,
  validateTask,
  type CodeTaskInput,
  type TaskInput,
  type TaskTests,
} from "./taskForm";
import {
  validateQuiz,
  type QuizTaskInput,
  type QuizQuestion,
} from "./quizForm";

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const fail = (message: string): never => {
  throw new Error(message);
};
const text = (
  object: Record<string, unknown>,
  key: string,
  path = key,
): string =>
  typeof object[key] === "string"
    ? (object[key] as string)
    : fail(`${path} must be a string.`);
function known(object: Record<string, unknown>, keys: string[], path: string) {
  for (const key of Object.keys(object))
    if (!keys.includes(key))
      fail(
        `Unknown field ${path}${key}. Use an exported task JSON as your template.`,
      );
}
function strings(value: unknown, path: string): string[] {
  if (!Array.isArray(value) || value.some((word) => typeof word !== "string"))
    return fail(`${path} must be an array of strings.`);
  return value as string[];
}

/** Parse untrusted pasted/file JSON before it can enter either editor's form state. */
export function parseTaskJson(
  source: string,
  expected: "code" | "quiz",
): TaskInput {
  if (new TextEncoder().encode(source).length > 1024 * 1024)
    return fail("Keep task JSON below 1 MB.");
  let raw: unknown;
  try {
    raw = JSON.parse(source);
  } catch {
    return fail("Invalid JSON. Check quotes, commas and brackets.");
  }
  if (!record(raw))
    return fail("The JSON must be a task object, not an array or primitive.");
  if (raw.type !== expected)
    return fail(
      `This is the ${expected} editor. Set type to “${expected}” or open the matching task editor.`,
    );
  const title = text(raw, "title");
  const instructions = text(raw, "instructions");
  if (expected === "quiz") {
    known(raw, ["title", "type", "instructions", "questions"], "");
    if (!Array.isArray(raw.questions))
      return fail("questions must be an array.");
    const questions: QuizQuestion[] = raw.questions.map(
      (q: unknown, index: number) => {
        if (!record(q)) return fail(`questions[${index}] must be an object.`);
        known(
          q,
          ["id", "prompt", "choices", "correct_choice_id", "explanation"],
          `questions[${index}].`,
        );
        if (!Array.isArray(q.choices))
          return fail(`questions[${index}].choices must be an array.`);
        return {
          id: text(q, "id", `questions[${index}].id`),
          prompt: text(q, "prompt", `questions[${index}].prompt`),
          correct_choice_id: text(
            q,
            "correct_choice_id",
            `questions[${index}].correct_choice_id`,
          ),
          explanation:
            q.explanation === undefined ? "" : text(q, "explanation"),
          choices: q.choices.map((c: unknown, ci: number) => {
            if (!record(c))
              return fail(
                `questions[${index}].choices[${ci}] must be an object.`,
              );
            known(c, ["id", "text"], `questions[${index}].choices[${ci}].`);
            return { id: text(c, "id"), text: text(c, "text") };
          }),
        };
      },
    );
    const quiz: QuizTaskInput = {
      title,
      type: "quiz",
      instructions,
      questions,
    };
    const problems = validateQuiz(quiz);
    if (problems.length)
      return fail(
        problems
          .slice(0, 8)
          .map((p) => p.message)
          .join("\n"),
      );
    return quiz;
  }
  known(raw, ["title", "type", "instructions", "starter_files", "tests"], "");
  if (
    !record(raw.starter_files) ||
    Object.values(raw.starter_files).some((code) => typeof code !== "string")
  )
    return fail(
      "starter_files must map relative Python file paths to source strings.",
    );
  const defaults = emptyTask().tests;
  const rules = raw.tests === undefined ? {} : raw.tests;
  if (!record(rules)) return fail("tests must be an object.");
  known(rules, Object.keys(defaults), "tests.");
  for (const key of ["check_syntax", "require_main_guard"] as const)
    if (rules[key] !== undefined && typeof rules[key] !== "boolean")
      return fail(`tests.${key} must be true or false.`);
  const output = rules.output_tests ?? [];
  if (!Array.isArray(output))
    return fail("tests.output_tests must be an array.");
  const tests: TaskTests = {
    check_syntax: (rules.check_syntax ?? defaults.check_syntax) as boolean,
    require_main_guard: (rules.require_main_guard ??
      defaults.require_main_guard) as boolean,
    required_words: strings(rules.required_words ?? [], "tests.required_words"),
    forbidden_words: strings(
      rules.forbidden_words ?? [],
      "tests.forbidden_words",
    ),
    custom_test:
      rules.custom_test === undefined ? "" : text(rules, "custom_test"),
    output_tests: output.map((test: unknown, index: number) => {
      if (!record(test))
        return fail(`tests.output_tests[${index}] must be an object.`);
      known(
        test,
        ["name", "input", "expected", "match"],
        `tests.output_tests[${index}].`,
      );
      if (test.match !== "exact" && test.match !== "contains")
        return fail(
          `tests.output_tests[${index}].match must be exact or contains.`,
        );
      return {
        name: text(test, "name"),
        input: text(test, "input"),
        expected: text(test, "expected"),
        match: test.match,
      };
    }),
  };
  const task: CodeTaskInput = {
    title,
    type: "code",
    instructions,
    starter_files: raw.starter_files as Record<string, string>,
    tests,
  };
  const problems = validateTask(task);
  if (problems.length)
    return fail(
      problems
        .slice(0, 8)
        .map((p) => p.message)
        .join("\n"),
    );
  return task;
}
