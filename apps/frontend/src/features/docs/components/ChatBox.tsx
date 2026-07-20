"use client";

import { useState } from "react";
import { Send, Bot } from "lucide-react";
import { useMessages, useSendMessage } from "../hooks/usePageMessage";
import { getErrorMessage } from "@/shared/lib/get-error-message";

type ChatBoxProps = {
  pageId: number;
};

export function ChatBox({ pageId }: ChatBoxProps) {
  const { data: messages } = useMessages(pageId);
  const sendMessage = useSendMessage(pageId);
  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    setInput("");
    setHistoryOpen(true);
    sendMessage.mutate(content);
  }

  return (
    <div className="fixed bottom-8 left-1/2 z-20 w-full max-w-2xl -translate-x-1/2 px-6">
      <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface p-4 shadow-2xl">
        {historyOpen && messages && messages.length > 0 && (
          <div className="flex max-h-64 flex-col gap-3 overflow-y-auto border-b border-outline-variant pb-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded p-3 text-body-md ${
                  m.role === "user"
                    ? "ml-auto max-w-[80%] bg-surface-container-highest text-on-surface"
                    : "mr-auto max-w-[80%] bg-surface-container text-on-surface"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sendMessage.isPending && (
              <div className="mr-auto flex max-w-[80%] items-center gap-2 rounded bg-surface-container p-3 text-body-md text-on-surface-variant">
                <Bot size={16} className="animate-pulse" />
                Thinking...
              </div>
            )}
          </div>
        )}

        {sendMessage.error && (
          <p className="text-label-sm text-error">
            {getErrorMessage(sendMessage.error)}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 rounded border border-outline-variant bg-surface-container px-4 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => messages && messages.length > 0 && setHistoryOpen(true)}
            placeholder="Ask AI about this page..."
            disabled={sendMessage.isPending}
            className="w-full flex-1 bg-transparent font-mono text-body-md text-on-surface placeholder:text-outline focus:outline-none"
          />
          <button
            type="submit"
            disabled={sendMessage.isPending || !input.trim()}
            className="flex-shrink-0 text-primary transition-transform hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}