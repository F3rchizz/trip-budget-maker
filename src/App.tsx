import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TripProvider } from "./contexts/TripContext";
import Home from "./pages/Home";
import CreateBudget from "./pages/CreateBudget";
import Viajes from "./pages/Viajes";
import Movimientos from "./pages/Movimientos";
import Presupuesto from "./pages/Presupuesto";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TripProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-budget" element={<CreateBudget />} />
            <Route path="/viajes" element={<Viajes />} />
            <Route path="/movimientos" element={<Movimientos />} />
            <Route path="/presupuesto" element={<Presupuesto />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TripProvider>
  </QueryClientProvider>
);

export default App;
