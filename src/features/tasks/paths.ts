export const TASKS_PATH = "/instructor/tasks";
export const taskEditorPath = (courseId: number | string, taskId: number | string) =>
  `/instructor/courses/${courseId}/tasks/${taskId}`;
export const tasksForModulePath = (courseId: number | string, moduleId: number | string) =>
  `${TASKS_PATH}?course=${courseId}&module=${moduleId}`;
export const newCodeTaskPath = (courseId: number | string, lessonId: number | string) =>
  `/instructor/courses/${courseId}/lessons/${lessonId}/tasks/new`;

export const newQuizTaskPath = (courseId: number | string, lessonId: number | string) =>
  `${newCodeTaskPath(courseId,lessonId)}?type=quiz`;

export const taskTestPath = (courseId: number | string, taskId: number | string) =>
  `/instructor/courses/${courseId}/tasks/${taskId}/test`;
