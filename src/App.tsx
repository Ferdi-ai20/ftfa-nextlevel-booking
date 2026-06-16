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
import PendingApproval from "./pages/PendingApproval.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";
import AdminShell from "./pages/admin/AdminShell.tsx";
import Calendar from "./pages/admin/Calendar.tsx";
import Bookings from "./pages/admin/Bookings.tsx";
import Applications from "./pages/admin/Applications.tsx";
import Players from "./pages/admin/Players.tsx";
import Development from "./pages/admin/Development.tsx";
import Feedback from "./pages/admin/Feedback.tsx";
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
            <Route path="/wachten" element={<PendingApproval />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<Calendar />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="applications" element={<Applications />} />
              <Route path="players" element={<Players />} />
              <Route path="development" element={<Development />} />
              <Route path="feedback" element={<Feedback />} />
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
