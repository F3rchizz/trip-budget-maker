import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, TentTree, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTrips } from "@/contexts/TripContext";
import { formatCurrency } from "@/utils/categories";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import Layout from "@/components/Layout";

const Viajes = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [tripName, setTripName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { trips, addTrip } = useTrips();
  const navigate = useNavigate();

  const upcomingTrips = trips.filter((trip) => trip.status === "pendiente");

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
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Mis Viajes</h1>
              <Button
                onClick={() => setOpenDialog(true)}
                variant="ghost"
                className="text-primary font-semibold"
              >
                Planear viaje +
              </Button>
            </div>

            {upcomingTrips.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-semibold text-lg">Próximos</h2>
                </div>

                <div className="space-y-4">
                  {upcomingTrips.map((trip) => (
                    <div key={trip.id} className="bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-bold text-lg">{trip.name}</h3>
                        <Badge className="bg-status-pendiente/10 text-status-pendiente hover:bg-status-pendiente/20 border-0">
                          Pendiente
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fecha</span>
                          <span className="font-medium">
                            {format(new Date(trip.startDate), "dd", { locale: es })} al{" "}
                            {format(new Date(trip.endDate), "dd MMM, yyyy", { locale: es })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Presupuesto</span>
                          <span className="font-bold text-lg">
                            {formatCurrency(trip.totalBudget)}
                          </span>
                        </div>
                      </div>

                      <Button className="w-full rounded-lg font-semibold text-lg text-black bg-primary-500 hover:bg-primary-600">
                        Registrar Gasto
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
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
                  <CalendarComponent
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

export default Viajes;
