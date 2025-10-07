import { useState, useMemo } from "react";
import { TentTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useTrips } from "@/contexts/TripContext";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { DateRange } from "react-day-picker";
import { categories, formatCurrency } from "@/utils/categories";
import { CategoryType } from "@/types";

const Home = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [tripName, setTripName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { trips, addTrip, movements } = useTrips();
  const navigate = useNavigate();

  // Get the most recent trip (assuming it's the active one)
  const activeTrip = trips.length > 0 ? trips[trips.length - 1] : null;

  // Calculate current day of trip
  const currentDay = useMemo(() => {
    if (!activeTrip) return 0;
    const startDate = new Date(activeTrip.startDate);
    const today = new Date();
    const daysDiff = differenceInDays(today, startDate) + 1;
    return Math.max(1, daysDiff);
  }, [activeTrip]);

  // Calculate total days of trip
  const totalDays = useMemo(() => {
    if (!activeTrip) return 0;
    const startDate = new Date(activeTrip.startDate);
    const endDate = new Date(activeTrip.endDate);
    return differenceInDays(endDate, startDate) + 1;
  }, [activeTrip]);

  // Calculate spent amounts
  const totalSpent = useMemo(() => {
    if (!activeTrip) return 0;
    return movements
      .filter((m) => m.tripId === activeTrip.id)
      .reduce((sum, m) => sum + m.amount, 0);
  }, [activeTrip, movements]);

  const spentByCategory = useMemo(() => {
    if (!activeTrip) return {};
    const spent: Record<CategoryType, number> = {} as Record<CategoryType, number>;
    movements
      .filter((m) => m.tripId === activeTrip.id)
      .forEach((m) => {
        spent[m.category] = (spent[m.category] || 0) + m.amount;
      });
    return spent;
  }, [activeTrip, movements]);

  const spentPercentage = activeTrip
    ? Math.min(100, (totalSpent / activeTrip.totalBudget) * 100)
    : 0;

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
            {/* Trip Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">{activeTrip?.name}</h1>
              <p className="text-muted-foreground">
                Día {currentDay} / {totalDays}
              </p>
            </div>

            {/* Circular Budget Progress */}
            <div className="flex justify-center py-6">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="hsl(var(--primary))"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - spentPercentage / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-sm text-primary font-semibold">
                    {spentPercentage.toFixed(0)}%
                  </p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(totalSpent)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Presupuesto gastado
                  </p>
                </div>
              </div>
            </div>

            {/* Budget by Category */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Presupuesto por categoría</h2>
                <Button
                  variant="ghost"
                  className="text-primary text-sm font-semibold"
                  onClick={() => navigate("/presupuesto")}
                >
                  Ver todo
                </Button>
              </div>

              <div className="space-y-3">
                {activeTrip?.categories.map((budgetCat) => {
                  const categoryInfo = categories.find((c) => c.id === budgetCat.category);
                  const spent = spentByCategory[budgetCat.category] || 0;
                  const percentage = budgetCat.amount > 0 ? (spent / budgetCat.amount) * 100 : 0;
                  const Icon = categoryInfo?.icon;
                  
                  const progressVariant = 
                    percentage >= 90 ? "high" :
                    percentage >= 60 ? "medium" :
                    "low";

                  return (
                    <div
                      key={budgetCat.category}
                      className="bg-card border border-border rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {Icon && (
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                              <Icon className="w-5 h-5 text-secondary" />
                            </div>
                          )}
                          <span className="font-semibold">{categoryInfo?.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-primary text-sm font-semibold"
                          onClick={() => navigate("/presupuesto")}
                        >
                          Editar
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {percentage.toFixed(0)}% Gastado
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(spent)} {formatCurrency(budgetCat.amount)}
                          </span>
                        </div>
                        <Progress value={Math.min(100, percentage)} variant={progressVariant} />
                      </div>
                    </div>
                  );
                })}
              </div>
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
