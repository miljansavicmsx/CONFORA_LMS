/**
 * Simple cart for Module 2.0.1 — persisted in sessionStorage.
 */
const KEY = "confora_cart_course_ids";

export function getCartCourseIds(): string[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p)) return [];
    return p.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function setCartCourseIds(ids: string[]): void {
  sessionStorage.setItem(KEY, JSON.stringify([...new Set(ids)]));
}

export function addToCart(courseId: string): void {
  const cur = getCartCourseIds();
  if (!cur.includes(courseId)) {
    cur.push(courseId);
  }
  setCartCourseIds(cur);
}

export function removeFromCart(courseId: string): void {
  setCartCourseIds(getCartCourseIds().filter((id) => id !== courseId));
}

export function clearCart(): void {
  sessionStorage.removeItem(KEY);
}
