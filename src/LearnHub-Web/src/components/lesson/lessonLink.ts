/** Lessons are selected with ?lesson=<id>, so no extra route is needed. */
export const lessonLink = (id: string) => ({ search: `?lesson=${id}` });
