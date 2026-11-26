export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  count === 1 ? singular : plural;

// "CourseSuspended" -> "Course suspended"
export function formatAction(action: string) {
  const text = action.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
