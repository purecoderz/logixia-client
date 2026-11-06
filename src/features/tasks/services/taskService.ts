import type { TaskTestResult, TaskTestSubmission } from "../taskTest";
import { apiFetch } from "@/lib/http";
import { apiErrorFrom } from "@/lib/apiError";
import type { TaskInput, TaskDocument } from "../taskForm";

export const TaskService = {
  async remove(id: string): Promise<void> {
    const response = await apiFetch(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) throw await apiErrorFrom(response);
  },

  async test(id: string, submission: TaskTestSubmission): Promise<TaskTestResult> {
    const response = await apiFetch(`/tasks/${encodeURIComponent(id)}/test`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(submission) });
    if (!response.ok) throw await apiErrorFrom(response);
    const result: TaskTestResult = await response.json();
    if (typeof result.passed !== "boolean" || !Array.isArray(result.checks) || result.checks.some((check) => typeof check.name !== "string" || typeof check.passed !== "boolean" || (check.message !== undefined && typeof check.message !== "string")) || (result.stdout !== undefined && typeof result.stdout !== "string") || (result.stderr !== undefined && typeof result.stderr !== "string")) throw new Error("Invalid task test response");
    return result;
  },

  async get(id: string): Promise<TaskDocument> {
    const response=await apiFetch(`/tasks/${encodeURIComponent(id)}`);
    if(!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
  async create(lessonId: string, task: TaskInput): Promise<TaskDocument> {
    const response=await apiFetch(`/lessons/${encodeURIComponent(lessonId)}/tasks`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(task)});
    if(!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
  async update(id: string, task: TaskInput): Promise<TaskDocument> {
    const response=await apiFetch(`/tasks/${encodeURIComponent(id)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(task)});
    if(!response.ok) throw await apiErrorFrom(response);
    return response.json();
  },
};
