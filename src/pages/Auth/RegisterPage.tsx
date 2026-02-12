import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Wheat,
  ShoppingCart,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    role: z.enum(["farmer", "buyer"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormData = z.infer<typeof schema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "farmer",
    },
  });

  const role = watch("role");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const loadingToast = toast.loading("Creating account...");

    try {
      const response = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      login(response.data.user, response.data.token);
      toast.success("Account created", { id: loadingToast });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const requestError = error as AxiosError<{ message: string }>;
      toast.error(requestError.response?.data?.message || "Registration failed", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2">
        <section className="surface-card p-6 sm:p-8 order-2 lg:order-1">
          <div className="mb-6">
            <p className="text-sm font-semibold text-soft">Create account</p>
            <h1 className="mt-2 text-3xl font-bold">Get started</h1>
            <p className="mt-1 text-muted">Set up your role and credentials.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="field-label">I am joining as</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`cursor-pointer rounded-[var(--radius-md)] border p-4 transition ${
                    role === "farmer"
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                      : "border-[var(--border)] bg-[var(--surface-muted)]"
                  }`}
                >
                  <input type="radio" value="farmer" className="sr-only" {...register("role")} />
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Wheat className="h-4 w-4" /> Farmer
                  </div>
                </label>
                <label
                  className={`cursor-pointer rounded-[var(--radius-md)] border p-4 transition ${
                    role === "buyer"
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                      : "border-[var(--border)] bg-[var(--surface-muted)]"
                  }`}
                >
                  <input type="radio" value="buyer" className="sr-only" {...register("role")} />
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ShoppingCart className="h-4 w-4" /> Buyer
                  </div>
                </label>
              </div>
            </div>

            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-10 h-4 w-4 text-soft" />
              <Input
                label="Full Name"
                placeholder="Ravi Kumar"
                className="pl-10"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-10 h-4 w-4 text-soft" />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-10 h-4 w-4 text-soft" />
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-10 text-soft hover:text-[var(--text)]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-10 h-4 w-4 text-soft" />
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                className="pl-10 pr-10"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-10 text-soft hover:text-[var(--text)]"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button type="submit" loading={loading} fullWidth>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[var(--primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </section>

        <section className="hero-panel relative overflow-hidden px-8 py-10 order-1 lg:order-2">
          <div className="grid-overlay absolute inset-0" />
          <div className="relative z-10">
            <div className="pill bg-white/20 text-white border-white/30">Build your digital farm workflow</div>
            <h2 className="mt-5 text-4xl font-extrabold leading-tight text-white md:text-5xl">
              Join the network powering better agricultural outcomes
            </h2>
            <p className="mt-4 max-w-xl text-white/90">
              Create your account to publish listings, receive market intelligence, and use AI guidance for crop operations.
            </p>

            <div className="mt-10 space-y-3">
              {[
                "AI-based market and crop insights",
                "Direct farmer-buyer connection",
                "Step-based listing workflow",
                "Profile and activity tracking",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-[var(--radius-md)] bg-white/10 px-3 py-2 text-sm text-white/95">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
