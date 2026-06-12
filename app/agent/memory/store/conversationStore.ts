import type { Message } from "@/agent/types/message";

export class ConversationStore {
  private messages: Message[] = [];

  setMessages(messages: Message[]): void {
    this.messages = messages;
  }

  getMessages(): Message[] {
    return this.messages;
  }
}
