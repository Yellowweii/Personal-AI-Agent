import type { MemoryFact } from "@/agent/memory/types";
import type { MemoryStore } from "@/agent/memory/store/memoryStore";

export const getMemories = (memoryStore: MemoryStore): MemoryFact[] =>
  memoryStore.getMemories();
