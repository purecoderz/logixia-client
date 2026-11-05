export const TASKS_PATH = "/instructor/tasks";
// The task editor comes next, so this leads to a page that doesn't exist yet
export const taskEditorPath = (courseId: number | string, taskId: number | string) =>
  `/instructor/courses/${courseId}/tasks/${taskId}`;
export const tasksForModulePath = (courseId: number | string, moduleId: number | string) =>
  `${TASKS_PATH}?course=${courseId}&module=${moduleId}`;