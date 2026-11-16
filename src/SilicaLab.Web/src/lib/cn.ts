type ClassValue = string | false | null | undefined;

/** Joins class names and drops falsy values: cn("a", isActive && "b"). */
export const cn = (...values: ClassValue[]) => values.filter(Boolean).join(" ");
