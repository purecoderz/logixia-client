// components/LiveRoom/ChatPanel.tsx
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ChatMessage } from "../../hooks/useLiveRoom";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

export function ChatPanel({ messages, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-line bg-surface">
      <h2 className="border-b border-line px-3 py-2 text-xs font-semibold text-muted">
        Chat
      </h2>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-3 text-sm">
        {messages.map((m, i) => {
          const mine = m.author === "You";
          // show the name only when the sender changes, like WhatsApp groups
          const showName = !mine && messages[i - 1]?.author !== m.author;

          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] break-words rounded-lg px-3 py-1.5 shadow-sm ${
                  mine
                    ? "rounded-tr-none bg-[#005c4b] text-[#e9edef]"
                    : "rounded-tl-none bg-surface-muted text-body"
                }`}
              >
                {showName && (
                  <p className="mb-0.5 text-xs font-semibold text-accent">
                    {m.author}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-t border-line p-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Message"
          placeholder="Type a message"
          className="min-w-0 flex-1 rounded-full border border-line bg-input px-4 py-2 text-sm text-body outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-full bg-[#00a884] px-4 py-2 text-sm font-medium text-white hover:bg-[#06cf9c]"
        >
          Send
        </button>
      </form>
    </section>
  );
}
