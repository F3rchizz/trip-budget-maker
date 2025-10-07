import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TentTree, CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

const Presupuesto = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [tripName, setTripName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { trips, movements, addTrip } = useTrips();
  const navigate = useNavigate();
  const currentTrip = trips[trips.length - 1];

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

  if (!currentTrip) {
    return (
      <Layout>
        <div className="p-6">
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
  }

  // Calculate spent amount per category
  const categorySpent = currentTrip.categories.map((cat) => {
    const spent = movements
      .filter((m) => m.tripId === currentTrip.id && m.category === cat.category)
      .reduce((sum, m) => sum + m.amount, 0);
    return {
      ...cat,
      spent,
      percentage: cat.amount > 0 ? (spent / cat.amount) * 100 : 0,
    };
  });

  const totalSpent = categorySpent.reduce((sum, cat) => sum + cat.spent, 0);
  const totalPercentage =
    currentTrip.totalBudget > 0 ? (totalSpent / currentTrip.totalBudget) * 100 : 0;

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Presupuesto</h1>

        <div className="mb-6">
          <Select defaultValue={currentTrip.id}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id}>
                  {trip.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Circular Progress - Simplified */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 mb-6 text-center">
          <div className="mb-2">
            <div className="text-4xl font-bold text-primary mb-1">
              {Math.round(totalPercentage)}%
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-1">{formatCurrency(totalSpent)}</h2>
          <p className="text-sm text-muted-foreground">Presupuesto gastado</p>
        </div>

        <div className="space-y-4">
          {categorySpent.map((cat) => {
            const categoryInfo = getCategoryInfo(cat.category);
            const CategoryIcon = categoryInfo?.icon;
            return (
              <div key={cat.category} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {CategoryIcon && (
                      <div className={`bg-category-${cat.category}/10 p-2 rounded-lg`}>
                        <CategoryIcon className={`h-5 w-5 text-category-${cat.category}`} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{categoryInfo?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(cat.percentage)}% Gastado
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-primary font-semibold text-sm">
                    Editar
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="font-medium">{formatCurrency(cat.spent)}</span>
                  <span className="font-bold">{formatCurrency(cat.amount)}</span>
                </div>
                <Progress
                  value={cat.percentage}
                  className={`h-2 bg-category-${cat.category}/20`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Presupuesto;
