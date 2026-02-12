import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Minimize2, Maximize2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../ui/Button";

interface Message {
  id: string;
  sender: "user" | "other";
  text: string;
  timestamp: Date;
}

const now = Date.now();
const initialMessages: Message[] = [
  {
    id: "1",
    sender: "other",
    text: "Hi! I saw your wheat listing. Is it available?",
    timestamp: new Date(now - 300000),
  },
  {
    id: "2",
    sender: "user",
    text: "Yes, it is. How much quantity do you need?",
    timestamp: new Date(now - 240000),
  },
];

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(2);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    const value = draft.trim();
    if (!value) return;

    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), sender: "user", text: value, timestamp: new Date() },
    ]);
    setDraft("");
    setTyping(true);

    window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "other",
          text: "Thank you. I will confirm quantity and get back shortly.",
          timestamp: new Date(),
        },
      ]);
      if (!open) {
        setUnread((prev) => prev + 1);
        toast.success("New message received");
      }
    }, 1300);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setUnread(0);
        }}
        className="fixed bottom-5 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-card-hover)] transition hover:brightness-105"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-5 right-5 z-30 w-[min(94vw,23rem)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card-hover)]"
      style={{ height: minimized ? 64 : 520 }}
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
        <div>
          <p className="font-semibold">Marketplace Chat</p>
          <p className="text-xs text-soft">Rajesh Kumar • online</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMinimized((value) => !value)}
            className="rounded-[var(--radius-sm)] p-1 text-soft hover:bg-[var(--surface-strong)]"
          >
            {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-[var(--radius-sm)] p-1 text-soft hover:bg-[var(--surface-strong)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!minimized ? (
        <>
          <div className="h-[390px] space-y-3 overflow-auto px-3 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    message.sender === "user"
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--surface-muted)] text-[var(--text)]"
                  }`}
                >
                  <p>{message.text}</p>
                  <p className="mt-1 text-[10px] opacity-80">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {typing ? (
              <div className="rounded-2xl bg-[var(--surface-muted)] px-3 py-2 text-xs text-soft">Typing...</div>
            ) : null}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[var(--border)] p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    send();
                  }
                }}
                className="field-base"
                placeholder="Type your message"
              />
              <Button size="sm" onClick={send} aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
