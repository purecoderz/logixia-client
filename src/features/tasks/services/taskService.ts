import type { TaskTestResult, TaskTestSubmission } from "../taskTest";
import { apiFetch } from "@/lib/http";
import { apiErrorFrom } from "@/lib/apiError";
import type { TaskInput, TaskDocument } from "../taskForm";
import type { CohortTaskInput } from "@/features/cohorts/types/cohortTask";

export const TaskService = {
  async remove(id: string): Promise<void> {
    const response = await apiFetch(`/tasks/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!response.ok) throw await apiErrorFrom(response);
  },

  async test(
    courseId: string,
    taskId: string,
    submission: TaskTestSubmission,
  ): Promise<TaskTestResult> {
    const response = await apiFetch(
      `/instructor/courses/${encodeURIComponent(courseId)}/tasks/${encodeURIComponent(taskId)}/test`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      },
    );
    if (!response.ok) throw await apiErrorFrom(response);
    const raw: {
      passed?: unknown;
      tests?: unknown;
      checks?: unknown;
      stdout?: unknown;
      stderr?: unknown;
    } = await response.json();
    const rawChecks = Array.isArray(raw.tests)
      ? raw.tests
      : Array.isArray(raw.checks)
        ? raw.checks
        : null;
    if (
      typeof raw.passed !== "boolean" ||
      !rawChecks ||
      rawChecks.some(
        (check) =>
          typeof check !== "object" ||
          check === null ||
          typeof (check as { name?: unknown }).name !== "string" ||
          typeof (check as { passed?: unknown }).passed !== "boolean" ||
          ((check as { message?: unknown }).message !== undefined &&
            (check as { message?: unknown }).message !== null &&
            typeof (check as { message?: unknown }).message !== "string"),
      ) ||
      (raw.stdout !== undefined &&
        raw.stdout !== null &&
        typeof raw.stdout !== "string") ||
      (raw.stderr !== undefined &&
        raw.stderr !== null &&
        typeof raw.stderr !== "string")
    )
      throw new Error("Invalid task test response");
    return {
      passed: raw.passed,
      tests: rawChecks as TaskTestResult["tests"],
      stdout: raw.stdout ?? undefined,
      stderr: raw.stderr ?? undefined,
    };
  },

  async get(id: string): Promise<TaskDocument> {
    const response = await apiFetch(`/tasks/${encodeURIComponent(id)}`);
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
  async create(lessonId: string, task: TaskInput): Promise<TaskDocument> {
    const response = await apiFetch(
      `/lessons/${encodeURIComponent(lessonId)}/tasks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      },
    );
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
  async createForCohort(
    cohortId: string,
    task: TaskInput,
    assignment: Omit<CohortTaskInput, "task_id">,
  ): Promise<TaskDocument> {
    const response = await apiFetch(
      `/cohorts/${encodeURIComponent(cohortId)}/tasks/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, ...assignment }),
      },
    );
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
  async update(id: string, task: TaskInput): Promise<TaskDocument> {
    const response = await apiFetch(`/tasks/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
};
