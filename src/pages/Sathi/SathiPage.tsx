import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, User, Video } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageHeader, PageShell, SectionCard } from "../../components/layout/PageShell";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Tutorial {
  id: string;
  title: string;
  duration: string;
  language: string;
  emoji: string;
}

const tutorials: Tutorial[] = [
  { id: "1", title: "Wheat Cultivation Basics", duration: "12:45", language: "Hindi", emoji: "🌾" },
  { id: "2", title: "Organic Farming Techniques", duration: "18:30", language: "English", emoji: "🌱" },
  { id: "3", title: "Pest Control Methods", duration: "15:20", language: "Hindi", emoji: "🐛" },
  { id: "4", title: "Irrigation Best Practices", duration: "20:15", language: "English", emoji: "💧" },
];

const quickPrompts = [
  "How to improve soil health?",
  "Best crops for summer?",
  "Pest control methods",
  "Government schemes for farmers",
];

export const SathiPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content:
        "Namaste! I'm Sathi, your AI farming companion. Ask me about crop techniques, pests, weather patterns, soil health, or government schemes.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getResponse = (query: string) => {
    const q = query.toLowerCase();

    if (q.includes("wheat") || q.includes("गेहूं")) {
      return "Wheat guidance: sow in Oct-Nov, prefer loamy soil with pH 6-7, ensure 4-6 irrigation cycles, and monitor rust/pest risk during growth stage.";
    }

    if (q.includes("pest") || q.includes("disease")) {
      return "Use integrated pest management: field monitoring, neem-based options, crop rotation, pheromone traps, and early-stage intervention.";
    }

    if (q.includes("soil") || q.includes("मिट्टी")) {
      return "Improve soil health with compost, green manure, pH correction, and periodic soil testing. Balanced nutrients drive better yield stability.";
    }

    if (q.includes("scheme") || q.includes("योजना")) {
      return "Major schemes include PM-KISAN, PMFBY crop insurance, Soil Health Card, and Kisan Credit Card. Verify district-level eligibility before applying.";
    }

    return "I can help with crop planning, pest control, weather adaptation, and scheme awareness. Share your crop and region for tailored guidance.";
  };

  const pushUserMessage = (content: string) => {
    const next = {
      id: `u-${Date.now()}`,
      role: "user" as const,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, next]);
  };

  const ask = (prompt: string) => {
    if (!prompt.trim() || loading) return;

    pushUserMessage(prompt.trim());
    setInput("");
    setLoading(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: getResponse(prompt),
          timestamp: new Date(),
        },
      ]);
      setLoading(false);
    }, 900);
  };

  return (
    <PageShell>
      <PageHeader
        badge={
          <Badge className="bg-white/20 text-white border-white/35">
            <MessageCircle className="h-3.5 w-3.5" />
            Always-on advisor
          </Badge>
        }
        title="Sathi AI"
        description="Get instant farming assistance, ask practical crop questions, and explore tutorial recommendations."
      />

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2" title="Conversation" description="Ask in English or Hindi">
          <div className="flex h-[520px] flex-col">
            <div className="mb-3 flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-muted">
              <Bot className="h-4 w-4 text-[var(--primary)]" />
              Sathi AI is online
            </div>

            <div className="flex-1 space-y-3 overflow-auto pr-1">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2 ${
                      message.role === "user"
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "bg-[var(--surface-muted)] text-[var(--text)]"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1 text-[10px] opacity-75">
                      {message.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                      <span>{message.role === "user" ? "You" : "Sathi"}</span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}

              {loading ? <p className="text-sm text-soft">Sathi is typing...</p> : null}
              <div ref={listEndRef} />
            </div>

            <form
              className="mt-4 flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                ask(input);
              }}
            >
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about crops, pests, weather, or schemes"
                className="flex-1"
              />
              <Button type="submit" disabled={!input.trim() || loading}>
                <Send className="h-4 w-4" />
                Send
              </Button>
            </form>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Quick ask" description="Tap to ask instantly">
            <div className="space-y-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={loading}
                  onClick={() => ask(prompt)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-left text-sm font-semibold text-muted transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Video tutorials" description="Popular practical guides">
            <div className="space-y-2">
              {tutorials.map((item) => (
                <Card key={item.id} className="bg-[var(--surface-muted)] p-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{item.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-soft">
                        {item.duration} • {item.language}
                      </p>
                    </div>
                    <Video className="h-4 w-4 text-soft" />
                  </div>
                </Card>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>
    </PageShell>
  );
};
