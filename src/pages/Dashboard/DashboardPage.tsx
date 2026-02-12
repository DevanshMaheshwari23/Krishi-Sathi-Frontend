import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  DollarSign,
  MessageCircle,
  Package,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { PageHeader, PageShell, SectionCard, StatCard } from "../../components/layout/PageShell";

const priceData = [
  { month: "Jan", wheat: 2400, rice: 2800 },
  { month: "Feb", wheat: 2300, rice: 2900 },
  { month: "Mar", wheat: 2500, rice: 3000 },
  { month: "Apr", wheat: 2700, rice: 3100 },
  { month: "May", wheat: 2600, rice: 2950 },
  { month: "Jun", wheat: 2800, rice: 3200 },
];

const cropDistribution = [
  { name: "Wheat", value: 35, color: "#cb8e2c" },
  { name: "Rice", value: 28, color: "#3f7f4c" },
  { name: "Cotton", value: 20, color: "#2d6d9f" },
  { name: "Others", value: 17, color: "#b97a1d" },
];

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <PageShell>
      <PageHeader
        badge={
          <Badge className="bg-white/20 text-white border-white/35">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Agriculture Workspace
          </Badge>
        }
        title={`Good to see you, ${firstName}`}
        description="Track your marketplace performance, monitor price trends, and move quickly between core farming workflows."
        actions={
          <>
            <Link to="/marketplace">
              <Button variant="secondary">Open Marketplace</Button>
            </Link>
            <Link to="/forecast">
              <Button>View Forecast</Button>
            </Link>
          </>
        }
      />

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value="₹2.4L" hint="+12.5% this month" icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Active Listings" value="24" hint="3 added this week" icon={<Package className="h-5 w-5" />} />
        <StatCard label="Listing Views" value="1,234" hint="+25% engagement" icon={<Activity className="h-5 w-5" />} />
        <StatCard label="Connections" value="89" hint="8 new today" icon={<Users className="h-5 w-5" />} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Market price trends"
          description="Last six months overview for major crops"
          actions={<Badge variant="info">Realtime snapshot</Badge>}
        >
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={priceData}>
              <defs>
                <linearGradient id="wheatFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cb8e2c" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#cb8e2c" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="riceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3f7f4c" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3f7f4c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-soft)" />
              <YAxis stroke="var(--text-soft)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  color: "var(--text)",
                }}
              />
              <Area type="monotone" dataKey="wheat" stroke="#cb8e2c" fill="url(#wheatFill)" strokeWidth={2} />
              <Area type="monotone" dataKey="rice" stroke="#3f7f4c" fill="url(#riceFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Listing distribution" description="Current crop mix">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={cropDistribution} dataKey="value" innerRadius={58} outerRadius={80} paddingAngle={4}>
                {cropDistribution.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {cropDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FeatureCard
          title="AI price forecasting"
          description="Use ML-backed trend estimates to decide the best selling window for each crop."
          features={[
            "Month-over-month comparison",
            "Region-aware recommendations",
            "Weather influence analysis",
          ]}
          ctaText="Open Forecast"
          ctaLink="/forecast"
          icon={<TrendingUp className="h-6 w-6" />}
        />

        <FeatureCard
          title="Sathi AI assistant"
          description="Get quick farming guidance, scheme information, and practical crop advice through chat."
          features={[
            "Multilingual query-ready",
            "Quick ask prompts",
            "Integrated tutorial references",
          ]}
          ctaText="Chat with Sathi"
          ctaLink="/sathi"
          icon={<MessageCircle className="h-6 w-6" />}
        />
      </section>
    </PageShell>
  );
};

const FeatureCard = ({
  title,
  description,
  features,
  ctaLink,
  ctaText,
  icon,
}: {
  title: string;
  description: string;
  features: string[];
  ctaLink: string;
  ctaText: string;
  icon: ReactNode;
}) => {
  return (
    <Card interactive className="surface-card-hover">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-[var(--radius-md)] bg-[var(--primary-soft)] p-2 text-[var(--primary)]">{icon}</div>
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
      </div>

      <ul className="mb-5 space-y-2 text-sm text-muted">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link to={ctaLink} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline">
        {ctaText}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
};
