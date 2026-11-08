export interface QuizChoice {
  id: string;
  text: string;
}
export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: QuizChoice[];
  correct_choice_id: string;
  explanation: string;
}
export interface QuizTaskInput {
  title: string;
  type: "quiz";
  instructions: string;
  questions: QuizQuestion[];
}
export type QuizSection = "details" | "questions" | "preview";
export interface QuizProblem {
  section: QuizSection;
  field: string;
  message: string;
}
const id = () => crypto.randomUUID();
export const newQuestion = (): QuizQuestion => ({
  id: id(),
  prompt: "",
  choices: [
    { id: id(), text: "" },
    { id: id(), text: "" },
  ],
  correct_choice_id: "",
  explanation: "",
});
export const emptyQuiz = (): QuizTaskInput => ({
  title: "",
  type: "quiz",
  instructions: "",
  questions: [newQuestion()],
});
export function validateQuiz(quiz: QuizTaskInput): QuizProblem[] {
  const problems: QuizProblem[] = [];
  if (!quiz.title.trim() || quiz.title.trim().length > 200)
    problems.push({
      section: "details",
      field: "quiz-title",
      message: "Enter a title between 1 and 200 characters.",
    });
  if (!quiz.instructions.trim())
    problems.push({
      section: "details",
      field: "quiz-instructions",
      message: "Add instructions for the student.",
    });
  if (!quiz.questions.length)
    problems.push({
      section: "questions",
      field: "add-question",
      message: "Add at least one question.",
    });
  const questionIds = new Set<string>();
  quiz.questions.forEach((q, index) => {
    const add = (field: string, message: string) =>
      problems.push({
        section: "questions",
        field,
        message: `Question ${index + 1}: ${message}`,
      });
    if (!q.id || questionIds.has(q.id))
      add(`question-${index}`, "use a unique, nonempty question ID.");
    questionIds.add(q.id);
    if (!q.prompt.trim()) add(`question-${index}`, "enter the question text.");
    if (q.choices.length < 2)
      add(`question-${index}`, "include at least two choices.");
    const choiceIds = new Set<string>();
    q.choices.forEach((choice, ci) => {
      if (!choice.id || choiceIds.has(choice.id))
        add(
          `choice-${index}-${ci}`,
          "use unique, nonempty choice IDs within each question.",
        );
      choiceIds.add(choice.id);
      if (!choice.text.trim())
        add(`choice-${index}-${ci}`, `enter text for choice ${ci + 1}.`);
    });
    if (!q.choices.some((choice) => choice.id === q.correct_choice_id))
      add(`correct-${index}`, "select one correct answer.");
  });
  return problems;
}
export function quizPayload(quiz: QuizTaskInput): QuizTaskInput {
  return {
    ...quiz,
    title: quiz.title.trim(),
    questions: quiz.questions.map((q) => ({
      ...q,
      prompt: q.prompt.trim(),
      explanation: q.explanation.trim(),
      choices: q.choices.map((choice) => ({
        ...choice,
        text: choice.text.trim(),
      })),
    })),
  };
}
export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const to = index + direction;
  if (index < 0 || to < 0 || to >= items.length) return items;
  const next = [...items];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}
