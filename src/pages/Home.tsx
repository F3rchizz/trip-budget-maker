import { useState } from "react";
import { TentTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useTrips } from "@/contexts/TripContext";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { DateRange } from "react-day-picker";

const Home = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [tripName, setTripName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { trips, addTrip } = useTrips();
  const navigate = useNavigate();

  const handleCreateTrip = () => {
    if (tripName && dateRange?.from && dateRange?.to) {
      const newTrip = {
        name: tripName,
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        totalBudget: 0,
        categories: [],
        status: "pendiente" as const,
      };
      addTrip(newTrip);
      setOpenDialog(false);
      setTripName("");
      setDateRange(undefined);
      // Navigate to create budget for the new trip
      navigate("/create-budget");
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-muted rounded-2xl p-8 mb-6">
              <TentTree className="h-16 w-16 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center">
              Tu próximo viaje
              <br />
              empieza con un buen plan
            </h2>
            <p className="text-muted-foreground mb-8 text-center">
              Arma tu presupuesto en minutos
            </p>
            <Button
              onClick={() => setOpenDialog(true)}
              size="lg"
              className="w-full max-w-xs rounded-lg font-semibold text-lg text-black bg-primary-500 hover:bg-primary-600"
            >
              Planear viaje
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mis Viajes</h2>
              <Button
                onClick={() => setOpenDialog(true)}
                variant="ghost"
                className="text-primary font-semibold"
              >
                Planear viaje +
              </Button>
            </div>
            {/* Trip list will be shown here */}
            <div className="text-center text-muted-foreground mt-8">
              Próximamente verás tus viajes aquí
            </div>
          </div>
        )}
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Planear Viaje</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input
                placeholder="Viaje a San Andrés"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal rounded-lg"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from && dateRange?.to ? (
                      format(dateRange.from, "dd 'al' dd 'de' MMMM, yyyy", { locale: es })
                    ) : (
                      <span>10 al 17 de Octubre, 2025</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={handleCreateTrip}
              className="w-full max-w-xs rounded-lg font-semibold text-lg text-black bg-primary-500 hover:bg-primary-600"
              size="lg"
            >
              Crear presupuesto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Home;
