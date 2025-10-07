import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, ChevronRight, TentTree, CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTrips } from "@/contexts/TripContext";
import { formatCurrency, getCategoryInfo } from "@/utils/categories";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import Layout from "@/components/Layout";

const Movimientos = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [tripName, setTripName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { trips, movements, addTrip } = useTrips();
  const [selectedTrip, setSelectedTrip] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();

  const filteredMovements = movements.filter((movement) => {
    if (selectedTrip !== "all" && movement.tripId !== selectedTrip) return false;
    if (selectedCategory !== "all" && movement.category !== selectedCategory) return false;
    return true;
  });

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
              <h1 className="text-2xl font-bold">Movimientos</h1>
              <Button variant="ghost" className="text-primary font-semibold">
                Registrar +
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Viaje a San Andrés" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los viajes</SelectItem>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="alojamiento">Alojamiento</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="comida">Comida</SelectItem>
                  <SelectItem value="entretenimiento">Entretenimiento</SelectItem>
                  <SelectItem value="seguros">Seguros</SelectItem>
                  <SelectItem value="libre">Libre</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredMovements.length > 0 ? (
              <div className="space-y-3">
                {filteredMovements.map((movement) => {
                  const categoryInfo = getCategoryInfo(movement.category);
                  const CategoryIcon = categoryInfo?.icon || Receipt;
                  return (
                    <button
                      key={movement.id}
                      className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:bg-muted transition-colors"
                    >
                      <div className="bg-muted p-3 rounded-lg">
                        <CategoryIcon className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold">{movement.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(movement.date), "dd MMM yyyy, h:mm a", { locale: es })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-category-{movement.category} bg-category-{movement.category}/10 px-3 py-1 rounded-full mb-1">
                          {categoryInfo?.name}
                        </p>
                        <p className="font-bold">{formatCurrency(movement.amount)}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-muted rounded-2xl p-8 inline-block mb-4">
                  <Receipt className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No hay movimientos registrados</p>
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

export default Movimientos;
