import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import WaitlistPage from "./pages/WaitlistPage.tsx";
import AdminShell from "./pages/admin/AdminShell.tsx";
import SundayPlanning from "./pages/admin/SundayPlanning.tsx";
import Players from "./pages/admin/Players.tsx";
import FixedPlayers from "./pages/admin/FixedPlayers.tsx";
import Waitlist from "./pages/admin/Waitlist.tsx";
import BookingWindows from "./pages/admin/BookingWindows.tsx";
import Settings from "./pages/admin/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<SundayPlanning />} />
              <Route path="players" element={<Players />} />
              <Route path="fixed" element={<FixedPlayers />} />
              <Route path="waitlist" element={<Waitlist />} />
              <Route path="bookings" element={<BookingWindows />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
