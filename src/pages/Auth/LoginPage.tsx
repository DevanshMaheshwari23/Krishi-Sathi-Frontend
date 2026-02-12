import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, TrendingUp, Wheat, ShieldCheck } from "lucide-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const loadingToast = toast.loading("Signing you in...");

    try {
      const response = await api.post("/auth/login", data);
      login(response.data.user, response.data.token);
      toast.success("Welcome back", { id: loadingToast });
      const redirectPath = (location.state as { from?: string } | undefined)?.from ?? "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const requestError = error as AxiosError<{ message: string }>;
      toast.error(requestError.response?.data?.message || "Login failed", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2">
        <section className="hero-panel relative overflow-hidden px-8 py-10">
          <div className="grid-overlay absolute inset-0" />
          <div className="relative z-10">
            <div className="pill bg-white/20 text-white border-white/30">Krishi Sathi Access</div>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white md:text-5xl">
              Welcome back to a smarter farming workflow
            </h1>
            <p className="mt-4 max-w-xl text-white/90">
              Track market movement, create crop listings, and receive practical AI guidance from one place.
            </p>

            <div className="mt-10 space-y-4 text-white/95">
              <Feature icon={<TrendingUp className="h-5 w-5" />} title="Data-led decisions" text="Read trend signals before pricing your crops." />
              <Feature icon={<Wheat className="h-5 w-5" />} title="Farmer-first marketplace" text="Connect directly with buyers and reduce middlemen friction." />
              <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Secure account handling" text="Session and auth persistence with protected routes." />
            </div>
          </div>
        </section>

        <section className="surface-card p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-soft">Account sign in</p>
            <h2 className="mt-2 text-3xl font-bold">Sign in</h2>
            <p className="mt-1 text-muted">Use your account credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-10 h-4 w-4 text-soft" />
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                className="pl-10"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-10 h-4 w-4 text-soft" />
              <Input
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="••••••••"
                className="pl-10 pr-10"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-10 text-soft hover:text-[var(--text)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                className="font-semibold text-[var(--primary)] hover:underline"
                onClick={() => toast("Password reset flow will be added soon", { icon: "ℹ️" })}
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" loading={loading} fullWidth>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted">
            New to Krishi Sathi?{" "}
            <Link to="/register" className="font-semibold text-[var(--primary)] hover:underline">
              Create account
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

const Feature = ({ icon, title, text }: { icon: ReactNode; title: string; text: string }) => {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-md)] bg-white/10 p-3 backdrop-blur-sm">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-white/85">{text}</p>
      </div>
    </div>
  );
};
