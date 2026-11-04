// TODO: change these if your routes are named differently
export const COURSES_PATH = "/instructor/courses";
export const builderPath = (courseId: string | number) => `${COURSES_PATH}/${courseId}/builder`;
export const lessonEditorPath = (courseId: string | number, lessonId: string | number) =>
  `${COURSES_PATH}/${courseId}/lessons/${lessonId}`;

// TODO: check these three against your router
export const NEW_COURSE_PATH = `${COURSES_PATH}/new`;
export const editCoursePath = (courseId: string | number) => `${COURSES_PATH}/${courseId}/edit`;
export const newCohortPath = (courseId: string | number) => `/instructor/cohorts/new?course=${courseId}`;