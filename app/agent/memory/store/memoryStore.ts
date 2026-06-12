import type { MemoryFact } from "@/agent/memory/types";

export class MemoryStore {
  private memories: MemoryFact[] = [];

  getMemories(): MemoryFact[] {
    return this.memories;
  }

  setMemories(memories: MemoryFact[]): void {
    this.memories = memories;
  }

  addMemory(fact: MemoryFact): void {
    const index = this.memories.findIndex((item) => item.key === fact.key);
    if (index >= 0) {
      this.memories[index] = fact;
    } else {
      this.memories.push(fact);
    }
  }
}
