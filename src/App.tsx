import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/auth/Login.tsx";
import Register from "./pages/auth/Register.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminDrivers from "./pages/admin/AdminDrivers.tsx";
import AdminPassengers from "./pages/admin/AdminPassengers.tsx";
import AdminZones from "./pages/admin/AdminZones.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import OperatorDashboard from "./pages/operator/OperatorDashboard.tsx";
import DriverDashboard from "./pages/driver/DriverDashboard.tsx";
import PassengerHome from "./pages/passenger/PassengerHome.tsx";
import PassengerTrack from "./pages/passenger/PassengerTrack.tsx";
import PassengerHistory from "./pages/passenger/PassengerHistory.tsx";
import PassengerBonus from "./pages/passenger/PassengerBonus.tsx";
import PassengerProfile from "./pages/passenger/PassengerProfile.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/drivers" element={<AdminDrivers />} />
          <Route path="/admin/passengers" element={<AdminPassengers />} />
          <Route path="/admin/zones" element={<AdminZones />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          {/* Operator */}
          <Route path="/operator" element={<OperatorDashboard />} />
          
          {/* Driver - single page */}
          <Route path="/driver" element={<DriverDashboard />} />
          
          {/* Passenger */}
          <Route path="/passenger" element={<PassengerHome />} />
          <Route path="/passenger/track" element={<PassengerTrack />} />
          <Route path="/passenger/history" element={<PassengerHistory />} />
          <Route path="/passenger/bonus" element={<PassengerBonus />} />
          <Route path="/passenger/profile" element={<PassengerProfile />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
