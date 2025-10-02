import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { categories, formatCurrency } from "@/utils/categories";
import { CategoryType } from "@/types";

interface CategoryWithSpent {
  category: CategoryType;
  amount: number;
  spent: number;
}

const Home = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [tripName, setTripName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { trips, addTrip } = useTrips();
  const navigate = useNavigate();
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<CategoryWithSpent[]>([]);
  const [recentMovements, setRecentMovements] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    loadTripData();
  }, []);

  const loadTripData = async () => {
    const { data: tripsData } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (tripsData) {
      setCurrentTrip(tripsData);

      const { data: categoriesData } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("trip_id", tripsData.id);

      const { data: movementsData } = await supabase
        .from("movements")
        .select("*")
        .eq("trip_id", tripsData.id)
        .order("date", { ascending: false })
        .limit(3);

      if (categoriesData) {
        const categoriesWithSpent = await Promise.all(
          categoriesData.map(async (cat) => {
            const { data: catMovements } = await supabase
              .from("movements")
              .select("amount")
              .eq("trip_id", tripsData.id)
              .eq("category", cat.category);

            const spent = catMovements?.reduce((sum, m) => sum + Number(m.amount), 0) || 0;
            return {
              category: cat.category as CategoryType,
              amount: Number(cat.amount),
              spent,
            };
          })
        );
        setCategoryData(categoriesWithSpent);
        
        const total = categoriesWithSpent.reduce((sum, cat) => sum + cat.spent, 0);
        setTotalSpent(total);
      }

      if (movementsData) {
        setRecentMovements(movementsData);
      }
    }
  };

  const handleCreateTrip = async () => {
    if (tripName && dateRange?.from && dateRange?.to) {
      const { data, error } = await supabase
        .from("trips")
        .insert({
          name: tripName,
          start_date: dateRange.from.toISOString(),
          end_date: dateRange.to.toISOString(),
          total_budget: 0,
          status: "pendiente",
        })
        .select()
        .single();

      if (data && !error) {
        setOpenDialog(false);
        setTripName("");
        setDateRange(undefined);
        navigate("/create-budget");
      }
    }
  };

  const getDayProgress = () => {
    if (!currentTrip) return { current: 0, total: 0 };
    const start = new Date(currentTrip.start_date);
    const end = new Date(currentTrip.end_date);
    const today = new Date();
    const totalDays = differenceInDays(end, start) + 1;
    const currentDay = Math.min(differenceInDays(today, start) + 1, totalDays);
    return { current: Math.max(0, currentDay), total: totalDays };
  };

  const getSpentPercentage = () => {
    if (!currentTrip || currentTrip.total_budget === 0) return 0;
    return Math.round((totalSpent / Number(currentTrip.total_budget)) * 100);
  };

  const dayProgress = getDayProgress();
  const spentPercentage = getSpentPercentage();

  return (
    <Layout>
      <div className="p-6">
        {!currentTrip ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-muted rounded-3xl p-12 max-w-sm w-full space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center">
                  <TentTree className="h-10 w-10 text-secondary" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-center text-secondary leading-tight">
                Tu próximo viaje
                <br />
                empieza con un buen plan
              </h2>
              <p className="text-muted-foreground text-center">
                Arma tu presupuesto en minutos
              </p>
              <Button
                onClick={() => setOpenDialog(true)}
                size="lg"
                className="w-full rounded-xl font-bold text-base"
              >
                Planear viaje
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Trip Header */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold">{currentTrip.name}</h1>
              <p className="text-muted-foreground text-sm">
                Día {dayProgress.current} / {dayProgress.total}
              </p>
            </div>

            {/* Circular Progress */}
            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="hsl(var(--muted))"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="hsl(var(--primary))"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - spentPercentage / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-primary">{spentPercentage}%</div>
                  <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                  <div className="text-xs text-muted-foreground">Presupuesto gastado</div>
                </div>
              </div>
            </div>

            {/* Budget Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Presupuesto por categoría</h2>
                <Button
                  variant="ghost"
                  className="text-secondary font-semibold text-sm h-auto p-0"
                  onClick={() => navigate("/presupuesto")}
                >
                  Ver todo
                </Button>
              </div>

              <div className="space-y-3">
                {categoryData.slice(0, 2).map((cat) => {
                  const categoryInfo = categories.find((c) => c.id === cat.category);
                  const Icon = categoryInfo?.icon;
                  const percentage = cat.amount > 0 ? Math.round((cat.spent / cat.amount) * 100) : 0;

                  return (
                    <div key={cat.category} className="bg-card rounded-2xl p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                            {Icon && <Icon className="w-5 h-5 text-secondary" />}
                          </div>
                          <div>
                            <div className="font-semibold">{categoryInfo?.name}</div>
                            <div className="text-sm text-muted-foreground">{percentage}% Gastado</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-primary font-semibold text-sm h-auto p-0"
                        >
                          Editar
                        </Button>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{formatCurrency(cat.spent)}</span>
                        <span className="font-bold">{formatCurrency(cat.amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Movements */}
            {recentMovements.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Últimos movimientos</h2>
                  <Button
                    variant="ghost"
                    className="text-secondary font-semibold text-sm h-auto p-0"
                    onClick={() => navigate("/movimientos")}
                  >
                    Ver todos
                  </Button>
                </div>

                <div className="space-y-3">
                  {recentMovements.map((movement) => {
                    const categoryInfo = categories.find((c) => c.id === movement.category);
                    const Icon = categoryInfo?.icon;

                    return (
                      <div key={movement.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                          {Icon && <Icon className="w-5 h-5 text-secondary" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{movement.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(movement.date), "d MMM yyyy, h:mm a", { locale: es })}
                          </div>
                        </div>
                        <div className="font-bold">{formatCurrency(Number(movement.amount))}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
