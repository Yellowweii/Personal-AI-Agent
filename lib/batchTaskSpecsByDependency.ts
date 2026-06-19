import type { TaskSpec } from "@/agent/types/plan";

/** 按 dependsOn 分批：同批可并行，批与批之间串行 */
export const batchTaskSpecsByDependency = (
  taskSpecs: TaskSpec[],
): TaskSpec[][] => {
  const parallelBatches: TaskSpec[][] = [];
  const remaining = [...taskSpecs];
  const completedTools = new Set<TaskSpec["tool"]>();

  while (remaining.length > 0) {
    const readySpecs = remaining.filter((spec) =>
      spec.dependsOn.every((dep) => completedTools.has(dep)),
    );

    if (readySpecs.length === 0) {
      parallelBatches.push([...remaining]);
      break;
    }

    parallelBatches.push(readySpecs);
    for (const spec of readySpecs) {
      completedTools.add(spec.tool);
      const index = remaining.indexOf(spec);
      if (index >= 0) {
        remaining.splice(index, 1);
      }
    }
  }

  return parallelBatches;
};
