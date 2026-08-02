/** Novi kurikulumi — backend `require_course_creator_actor`. */

export type CourseCreatorAccessInput = {
  readonly roleFromProfile: string | null | undefined;
};

export function evaluateCourseCreatorAccess(input: CourseCreatorAccessInput): boolean {
  const r = String(input.roleFromProfile ?? "")
    .trim()
    .toLowerCase();
  return r === "training_admin" || r === "admin" || r === "sys_admin";
}
