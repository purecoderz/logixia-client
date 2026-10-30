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
    <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-[#30363d] bg-[#161b22]">
      <h2 className="border-b border-[#21262d] px-3 py-2 text-xs font-semibold text-[#8b949e]">
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
                    : "rounded-tl-none bg-[#202c33] text-[#e9edef]"
                }`}
              >
                {showName && (
                  <p className="mb-0.5 text-xs font-semibold text-[#53bdeb]">
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

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-[#21262d] p-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Message"
          placeholder="Type a message"
          className="min-w-0 flex-1 rounded-full border border-[#30363d] bg-[#0d1117] px-4 py-2 text-sm outline-none focus:border-[#00a884]"
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