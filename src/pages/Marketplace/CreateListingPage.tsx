import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  IndianRupee,
  MapPin,
  Package,
  Sprout,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { Badge } from "../../components/ui/Badge";
import { PageShell } from "../../components/layout/PageShell";
import { ImageUpload } from "../../components/marketplace/ImageUpload";
import { cn } from "../../lib/cn";

const schema = z.object({
  cropName: z.string().min(2, "Crop name required"),
  quantity: z.number().min(1, "Quantity must be positive"),
  unit: z.enum(["kg", "quintal", "ton"]),
  pricePerUnit: z.number().min(1, "Price must be positive"),
  state: z.string().min(2, "State required"),
  district: z.string().min(2, "District required"),
  pincode: z.string().regex(/^\d{6}$/, "Valid 6-digit pincode required"),
  harvestDate: z.string().min(1, "Harvest date required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const commonCrops = [
  { name: "Wheat", emoji: "🌾" },
  { name: "Rice", emoji: "🌾" },
  { name: "Corn", emoji: "🌽" },
  { name: "Cotton", emoji: "☁️" },
  { name: "Sugarcane", emoji: "🎋" },
  { name: "Potato", emoji: "🥔" },
  { name: "Tomato", emoji: "🍅" },
  { name: "Onion", emoji: "🧅" },
];

const indianStates = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Gujarat",
  "Haryana",
  "Karnataka",
  "Madhya Pradesh",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
];

const steps = [
  { number: 1, title: "Crop details", icon: Sprout },
  { number: 2, title: "Location", icon: MapPin },
  { number: 3, title: "Images & review", icon: Upload },
] as const;

export const CreateListingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [step, setStep] = useState<(typeof steps)[number]["number"]>(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      unit: "kg",
    },
  });

  const values = watch();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const loadingToast = toast.loading("Publishing listing...");

    try {
      await api.post("/listings", {
        type: "sell",
        cropName: data.cropName,
        quantity: data.quantity,
        unit: data.unit,
        pricePerUnit: data.pricePerUnit,
        location: {
          state: data.state,
          district: data.district,
          pincode: data.pincode,
        },
        harvestDate: data.harvestDate,
        description: data.description,
        images: [],
      });

      toast.success("Listing created successfully", { id: loadingToast });
      navigate("/marketplace");
    } catch (error) {
      const requestError = error as AxiosError<{ message: string }>;
      toast.error(requestError.response?.data?.message || "Failed to create listing", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(
    () => ({
      cropName: values.cropName || "Not specified",
      quantity: `${values.quantity || 0} ${values.unit || "kg"}`,
      price: `₹${values.pricePerUnit || 0} / ${values.unit || "kg"}`,
      location: [values.district, values.state].filter(Boolean).join(", ") || "Not specified",
    }),
    [values]
  );

  const nextStep = async () => {
    const fieldsByStep: Record<number, (keyof FormData)[]> = {
      1: ["cropName", "quantity", "unit", "pricePerUnit", "harvestDate", "description"],
      2: ["state", "district", "pincode"],
      3: [],
    };

    const valid = await trigger(fieldsByStep[step]);
    if (!valid) return;

    setStep((current) => Math.min(3, current + 1) as (typeof steps)[number]["number"]);
  };

  return (
    <PageShell>
      <button
        type="button"
        onClick={() => navigate("/marketplace")}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-[var(--text)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to marketplace
      </button>

      <Card>
        <div className="mb-6">
          <Badge variant="info">Create listing</Badge>
          <h1 className="mt-3 text-3xl font-bold">List your crop inventory</h1>
          <p className="mt-1 text-muted">Complete the 3-step flow to publish your listing.</p>
        </div>

        <div className="mb-7 grid grid-cols-3 gap-3">
          {steps.map((item) => {
            const Icon = item.icon;
            const active = step === item.number;
            const done = step > item.number;
            return (
              <div
                key={item.number}
                className={cn(
                  "rounded-[var(--radius-md)] border p-3",
                  active || done ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] bg-[var(--surface-muted)]"
                )}
              >
                <div className="flex items-center gap-2">
                  {done ? <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" /> : <Icon className="h-4 w-4 text-soft" />}
                  <p className="text-sm font-semibold">{item.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <label className="field-label">Quick crop select</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {commonCrops.map((crop) => (
                    <button
                      key={crop.name}
                      type="button"
                      onClick={() => setValue("cropName", crop.name)}
                      className={cn(
                        "rounded-[var(--radius-md)] border p-3 text-sm font-semibold transition",
                        values.cropName === crop.name
                          ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--surface-muted)]"
                      )}
                    >
                      <div className="text-lg">{crop.emoji}</div>
                      <div>{crop.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Input label="Crop Name" placeholder="e.g., Organic Turmeric" error={errors.cropName?.message} {...register("cropName")} />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  type="number"
                  label="Quantity"
                  error={errors.quantity?.message}
                  {...register("quantity", { valueAsNumber: true })}
                />
                <Select label="Unit" error={errors.unit?.message} {...register("unit")}>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="quintal">Quintal</option>
                  <option value="ton">Ton</option>
                </Select>
              </div>

              <div className="relative">
                <IndianRupee className="pointer-events-none absolute left-3 top-10 h-4 w-4 text-soft" />
                <Input
                  type="number"
                  label="Price per unit"
                  className="pl-10"
                  error={errors.pricePerUnit?.message}
                  {...register("pricePerUnit", { valueAsNumber: true })}
                />
              </div>

              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-10 h-4 w-4 text-soft" />
                <Input
                  type="date"
                  label="Harvest date"
                  className="pl-10"
                  error={errors.harvestDate?.message}
                  {...register("harvestDate")}
                />
              </div>

              <Textarea label="Description (optional)" rows={4} {...register("description")} />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <Select label="State" error={errors.state?.message} {...register("state")}>
                <option value="">Select State</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>

              <Input label="District" placeholder="e.g., Raebareli" error={errors.district?.message} {...register("district")} />

              <Input
                label="Pincode"
                maxLength={6}
                placeholder="229001"
                error={errors.pincode?.message}
                {...register("pincode")}
              />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold text-muted">Upload crop images (optional)</p>
                <ImageUpload onImagesChange={setImages} />
                <p className="mt-2 text-xs text-soft">{images.length} file(s) selected</p>
              </div>

              <Card className="bg-[var(--surface-muted)]">
                <h2 className="text-lg font-bold">Review summary</h2>
                <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SummaryItem label="Crop" value={summary.cropName} />
                  <SummaryItem label="Quantity" value={summary.quantity} />
                  <SummaryItem label="Price" value={summary.price} />
                  <SummaryItem label="Location" value={summary.location} />
                </dl>
              </Card>
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
            <Button type="button" variant="secondary" onClick={() => (step === 1 ? navigate("/marketplace") : setStep((current) => (current - 1) as typeof step))}>
              {step === 1 ? "Cancel" : "Previous"}
            </Button>

            {step < 3 ? (
              <Button type="button" onClick={() => void nextStep()}>
                Next step
              </Button>
            ) : (
              <Button type="submit" loading={loading}>
                <Package className="h-4 w-4" />
                Publish listing
              </Button>
            )}
          </div>
        </form>
      </Card>
    </PageShell>
  );
};

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3">
    <dt className="text-xs font-semibold uppercase tracking-wide text-soft">{label}</dt>
    <dd className="mt-1 text-sm font-semibold text-[var(--text)]">{value}</dd>
  </div>
);
