import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowUp,
  Calendar,
  Droplets,
  Info,
  MapPin,
  Sparkles,
  Sun,
  TrendingUp,
  Wind,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Tabs } from "../../components/ui/Tabs";
import { PageHeader, PageShell, SectionCard, StatCard } from "../../components/layout/PageShell";

const priceData = [
  { month: "Jan", current: 2400, predicted: 2450, lastYear: 2200 },
  { month: "Feb", current: 2300, predicted: 2500, lastYear: 2250 },
  { month: "Mar", current: 2500, predicted: 2650, lastYear: 2300 },
  { month: "Apr", current: 2700, predicted: 2800, lastYear: 2550 },
  { month: "May", current: 2600, predicted: 2900, lastYear: 2600 },
  { month: "Jun", current: null, predicted: 3000, lastYear: 2650 },
  { month: "Jul", current: null, predicted: 3100, lastYear: 2700 },
  { month: "Aug", current: null, predicted: 3050, lastYear: 2750 },
];

const weatherData = [
  { day: "Mon", temp: 28, rainfall: 10 },
  { day: "Tue", temp: 30, rainfall: 5 },
  { day: "Wed", temp: 32, rainfall: 0 },
  { day: "Thu", temp: 31, rainfall: 15 },
  { day: "Fri", temp: 29, rainfall: 20 },
  { day: "Sat", temp: 27, rainfall: 25 },
  { day: "Sun", temp: 28, rainfall: 10 },
];

const crops = ["Wheat", "Rice", "Cotton", "Sugarcane", "Potato", "Tomato"];
const regions = ["Punjab", "Uttar Pradesh", "Maharashtra", "Gujarat", "Madhya Pradesh"];

export const ForecastPage = () => {
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [selectedRegion, setSelectedRegion] = useState("Punjab");
  const [timeRange, setTimeRange] = useState<"1M" | "3M" | "6M" | "1Y">("6M");

  const recommendation = useMemo(() => {
    return `Based on market data for ${selectedCrop} in ${selectedRegion}, projected price movement remains positive for the next ${timeRange}.`;
  }, [selectedCrop, selectedRegion, timeRange]);

  return (
    <PageShell>
      <PageHeader
        badge={
          <Badge className="bg-white/20 text-white border-white/35">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered predictions
          </Badge>
        }
        title="Price Forecast"
        description="Combine historical market movement, regional effects, and weather signals to plan crop sale timing."
      />

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted">Crop</p>
            <Badge variant="info">Model target</Badge>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {crops.map((crop) => (
              <button
                key={crop}
                type="button"
                className={`rounded-[var(--radius-md)] border px-3 py-2 text-sm font-semibold transition ${
                  selectedCrop === crop
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--surface-muted)]"
                }`}
                onClick={() => setSelectedCrop(crop)}
              >
                {crop}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <Select label="Region" value={selectedRegion} onChange={(event) => setSelectedRegion(event.target.value)}>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </Select>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-soft">
            <MapPin className="h-3.5 w-3.5" />
            Region-specific output
          </p>
        </Card>

        <Card>
          <p className="field-label">Time range</p>
          <Tabs
            tabs={[
              { key: "1M", label: "1M" },
              { key: "3M", label: "3M" },
              { key: "6M", label: "6M" },
              { key: "1Y", label: "1Y" },
            ]}
            value={timeRange}
            onChange={setTimeRange}
            className="w-full"
          />
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-soft">
            <Calendar className="h-3.5 w-3.5" />
            Forecast horizon selector
          </p>
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Current Price" value="₹2,600" hint="+8.3% vs last month" icon={<ArrowUp className="h-5 w-5" />} />
        <StatCard label="Predicted (1M)" value="₹2,900" hint="Potential upside" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Volatility" value="Low" hint="Stable movement expected" icon={<Info className="h-5 w-5" />} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard className="xl:col-span-2" title="Trend and projection" description={`${selectedCrop} • ${selectedRegion}`}>
          <ResponsiveContainer width="100%" height={330}>
            <AreaChart data={priceData}>
              <defs>
                <linearGradient id="currentFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d6d9f" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2d6d9f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predFill" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="current" stroke="#2d6d9f" fill="url(#currentFill)" strokeWidth={2} />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#3f7f4c"
                fill="url(#predFill)"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <Line type="monotone" dataKey="lastYear" stroke="#728170" strokeDasharray="3 3" dot={false} />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-muted">
            <span className="inline-flex items-center gap-2 font-semibold text-[var(--info)]">
              <Info className="h-4 w-4" />
              AI recommendation
            </span>
            <p className="mt-1">{recommendation}</p>
          </div>
        </SectionCard>

        <SectionCard title="Weather impact" description="Expected influence for next 7 days">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--text-soft)" />
              <YAxis stroke="var(--text-soft)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  color: "var(--text)",
                }}
              />
              <Bar dataKey="temp" fill="#cb8e2c" radius={[8, 8, 0, 0]} />
              <Bar dataKey="rainfall" fill="#2d6d9f" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2 text-sm">
            <WeatherRow icon={<Sun className="h-4 w-4" />} label="Temperature" value="Avg 29°C" />
            <WeatherRow icon={<Droplets className="h-4 w-4" />} label="Rainfall" value="85mm expected" />
            <WeatherRow icon={<Wind className="h-4 w-4" />} label="Wind" value="12 km/h" />
          </div>
        </SectionCard>
      </section>
    </PageShell>
  );
};

const WeatherRow = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
    <div className="flex items-center gap-2">
      <span className="text-soft">{icon}</span>
      <span className="font-semibold">{label}</span>
    </div>
    <span className="text-muted">{value}</span>
  </div>
);
