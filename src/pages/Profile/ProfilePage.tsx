import { useState } from "react";
import type { ReactNode } from "react";
import {
  Award,
  Edit3,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Save,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { PageHeader, PageShell, SectionCard, StatCard } from "../../components/layout/PageShell";

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+91 98765 43210",
    location: "Raebareli, Uttar Pradesh",
  });

  const save = async () => {
    const loadingToast = toast.loading("Updating profile...");
    await new Promise((resolve) => setTimeout(resolve, 900));
    toast.success("Profile updated", { id: loadingToast });
    setEditing(false);
  };

  return (
    <PageShell>
      <PageHeader
        badge={<Badge className="bg-white/20 text-white border-white/35">Member profile</Badge>}
        title={user?.name || "Your profile"}
        description={`${user?.role === "farmer" ? "Farmer" : "Buyer"} account overview with activity and profile settings.`}
      />

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Listings" value="12" hint="3 new this month" icon={<Package className="h-5 w-5" />} />
        <StatCard label="Total Sales" value="₹45,000" hint="+15% monthly" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Messages" value="28" hint="5 unread" icon={<MessageSquare className="h-5 w-5" />} />
        <StatCard label="Rating" value="4.8 / 5" hint="From 24 reviews" icon={<Award className="h-5 w-5" />} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard
          className="xl:col-span-2"
          title="Profile information"
          description="Manage personal and contact details"
          actions={
            editing ? (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={() => void save()}>
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                <Edit3 className="h-4 w-4" />
                Edit
              </Button>
            )
          }
        >
          <div className="space-y-4">
            <ProfileField
              label="Full Name"
              icon={<User className="h-4 w-4 text-soft" />}
              editing={editing}
              value={formData.name}
              onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
            />

            <div>
              <p className="field-label">Email</p>
              <div className="surface-subtle flex items-center justify-between p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-soft" />
                  <span>{formData.email}</span>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>
            </div>

            <ProfileField
              label="Phone"
              icon={<Phone className="h-4 w-4 text-soft" />}
              editing={editing}
              value={formData.phone}
              onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
            />

            <ProfileField
              label="Location"
              icon={<MapPin className="h-4 w-4 text-soft" />}
              editing={editing}
              value={formData.location}
              onChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
            />
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Recent activity" description="Latest account actions">
            <div className="space-y-3">
              {[
                { title: "Listed wheat inventory", time: "2 hours ago", icon: Package },
                { title: "Received buyer message", time: "5 hours ago", icon: MessageSquare },
                { title: "Updated profile details", time: "1 day ago", icon: User },
              ].map((item) => (
                <div key={item.title} className="surface-subtle flex items-center gap-3 p-3">
                  <item.icon className="h-4 w-4 text-[var(--primary)]" />
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-soft">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Achievements" description="Milestones unlocked">
            <div className="space-y-2">
              {[
                { icon: "🎉", name: "First Listing" },
                { icon: "🏆", name: "10 Successful Sales" },
                { icon: "✅", name: "Verified Seller" },
              ].map((achievement) => (
                <div key={achievement.name} className="surface-subtle flex items-center gap-2 px-3 py-2 text-sm font-semibold">
                  <span>{achievement.icon}</span>
                  <span>{achievement.name}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>
    </PageShell>
  );
};

const ProfileField = ({
  label,
  icon,
  value,
  editing,
  onChange,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  editing: boolean;
  onChange: (nextValue: string) => void;
}) => {
  if (editing) {
    return <Input label={label} value={value} onChange={(event) => onChange(event.target.value)} />;
  }

  return (
    <div>
      <p className="field-label">{label}</p>
      <div className="surface-subtle flex items-center gap-2 p-3 text-sm">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
};
