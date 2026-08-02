/**
 * Motion policy — calm enterprise cockpit; respect user preferences.
 */

export const ENTERPRISE_MOTION_POLICY = {
  defaultDurationMs: 200,
  maxDistancePx: 12,
  useReducedMotionQuery: true,
  pulseLoaders: "Allow motion-safe:animate-pulse with motion-reduce:animate-none",
  graphTransitions: "Defer heavy Framer to opt-in user actions where possible",
} as const;
