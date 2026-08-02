/** Dedicated identity review route — same RBAC as user registry (§12.1). */

export {
  evaluateUserRegistryAccess as evaluateIdentityReviewAccess,
  type UserRegistryAccessInput as IdentityReviewAccessInput,
} from "@/lib/user-registry-access";
