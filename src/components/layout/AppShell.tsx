import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { CommandPalette } from "../common/CommandPalette";
import { ChatWidget } from "../chat/ChatWidget";

export const AppShell = () => {
  return (
    <div className="app-shell-bg min-h-screen">
      <Navbar />
      <CommandPalette />
      <div className="pb-24">
        <Outlet />
      </div>
      <ChatWidget />
    </div>
  );
};
