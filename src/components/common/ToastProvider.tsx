import { Toaster } from "react-hot-toast";

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3600,
        style: {
          background: "var(--surface)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          boxShadow: "var(--shadow-card)",
        },
        success: {
          iconTheme: {
            primary: "#2c8a54",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#b03d35",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
};
