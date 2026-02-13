import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/common/ToastProvider";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Skeleton } from "./components/ui/Skeleton";


const LoginPage = lazy(() => import("./pages/Auth/LoginPage").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("./pages/Auth/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const DashboardPage = lazy(() => import("./pages/Dashboard/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const MarketplacePage = lazy(() => import("./pages/Marketplace/MarketplacePage").then((module) => ({ default: module.MarketplacePage })));
const CreateListingPage = lazy(() => import("./pages/Marketplace/CreateListingPage").then((module) => ({ default: module.CreateListingPage })));
const ForecastPage = lazy(() => import("./pages/Forecast/ForecastPage").then((module) => ({ default: module.ForecastPage })));
const SathiPage = lazy(() => import("./pages/Sathi/SathiPage").then((module) => ({ default: module.SathiPage })));
const ProfilePage = lazy(() => import("./pages/Profile/ProfilePage").then((module) => ({ default: module.ProfilePage })));

const PageFallback = () => (
  <div className="page-shell space-y-4">
    <Skeleton className="h-52 w-full" />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-60 w-full" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/marketplace/create" element={<CreateListingPage />} />
              <Route path="/forecast" element={<ForecastPage />} />
              <Route path="/sathi" element={<SathiPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
