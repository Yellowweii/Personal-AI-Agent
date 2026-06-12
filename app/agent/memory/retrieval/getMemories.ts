import type { MemoryFact } from "@/agent/types/memory";
import type { MemoryStore } from "@/agent/memory/store/memoryStore";

export const getMemories = (memoryStore: MemoryStore): MemoryFact[] =>
  memoryStore.getMemories();
