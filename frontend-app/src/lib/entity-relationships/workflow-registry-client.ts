import snapshot from "./workflow-registry-snapshot.json";

export const WORKFLOW_REGISTRY_VERSION: string = snapshot.version;

export type WorkflowRegistryTransition = (typeof snapshot.transitions)[number];

export function transitionsFromStatus(
  workflowType: string,
  fromStatus: string,
): readonly WorkflowRegistryTransition[] {
  const f = fromStatus.trim().toUpperCase();
  return snapshot.transitions.filter((t) => t.workflowType === workflowType && t.from === f);
}

export function allTransitionsForWorkflow(workflowType: string): readonly WorkflowRegistryTransition[] {
  return snapshot.transitions.filter((t) => t.workflowType === workflowType);
}
