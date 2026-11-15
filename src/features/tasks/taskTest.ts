export type TaskTestSubmission =
  | { files: Record<string, string> }
  | { answers: { question_id: string; choice_id: string }[] };

export interface TaskTestCheck {
  name: string;
  passed: boolean;
  message?: string | null;
}

export interface TaskTestResult {
  passed: boolean;
  tests: TaskTestCheck[];
  stdout?: string | null;
  stderr?: string | null;
}
