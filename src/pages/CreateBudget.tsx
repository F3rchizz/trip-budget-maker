import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plane, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories, formatCurrency } from "@/utils/categories";
import { CategoryType } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CreateBudget = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [amount, setAmount] = useState("");
  const [currency] = useState("COP");
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<{ category: CategoryType; amount: number; id?: string }[]>([]);

  useEffect(() => {
    loadTripData();
  }, []);

  const loadTripData = async () => {
    const { data: tripsData } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tripsData) {
      setCurrentTrip(tripsData);

      const { data: categoriesData } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("trip_id", tripsData.id);

      if (categoriesData) {
        setCategoryBudgets(
          categoriesData.map((cat) => ({
            category: cat.category as CategoryType,
            amount: Number(cat.amount),
            id: cat.id,
          }))
        );
      }
    }
  };

  if (!currentTrip) {
    return null;
  }

  const totalBudget = categoryBudgets.reduce((sum, cat) => sum + cat.amount, 0);

  const handleAddBudget = async () => {
    if (selectedCategory && amount) {
      const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
      const existing = categoryBudgets.find((cat) => cat.category === selectedCategory);

      if (existing?.id) {
        // Update existing category
        const { error } = await supabase
          .from("budget_categories")
          .update({ amount: numAmount })
          .eq("id", existing.id);

        if (error) {
          toast.error("Error al actualizar la categoría");
          return;
        }
      } else {
        // Insert new category
        const { error } = await supabase
          .from("budget_categories")
          .insert({
            trip_id: currentTrip.id,
            category: selectedCategory,
            amount: numAmount,
          });

        if (error) {
          toast.error("Error al agregar la categoría");
          return;
        }
      }

      // Reload data
      await loadTripData();

      setOpenDialog(false);
      setSelectedCategory(null);
      setAmount("");
      toast.success("Presupuesto actualizado");
    }
  };

  const handleOpenDialog = (category: CategoryType) => {
    setSelectedCategory(category);
    const existing = categoryBudgets.find((cat) => cat.category === category);
    if (existing) {
      setAmount(existing.amount.toString());
    } else {
      setAmount("");
    }
    setOpenDialog(true);
  };

  const getCategoryAmount = (categoryId: CategoryType) => {
    const cat = categoryBudgets.find((c) => c.category === categoryId);
    return cat ? cat.amount : 0;
  };

  const handleConfirmBudget = async () => {
    if (totalBudget === 0) {
      toast.error("Debes agregar al menos una categoría");
      return;
    }

    const { error } = await supabase
      .from("trips")
      .update({ total_budget: totalBudget })
      .eq("id", currentTrip.id);

    if (error) {
      toast.error("Error al confirmar el presupuesto");
      return;
    }

    toast.success("Presupuesto confirmado");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Creando Presupuesto</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto p-6 pb-24">
        <div className="bg-muted rounded-3xl p-6 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-5xl font-bold text-secondary mb-2">
              {formatCurrency(totalBudget)}
            </h2>
            <p className="text-sm text-muted-foreground">Presupuesto Total</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Plane className="h-4 w-4" />
              <span>{currentTrip.name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(currentTrip.startDate), "dd", { locale: es })} al{" "}
                {format(new Date(currentTrip.endDate), "dd 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4 text-center">Presupuesto por categoría</h3>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            const amount = getCategoryAmount(category.id);
            return (
              <button
                key={category.id}
                onClick={() => handleOpenDialog(category.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="relative">
                  <div className={`bg-secondary/10 p-3 rounded-lg text-secondary`}>
                    <CategoryIcon className="h-6 w-6" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                    +
                  </div>
                </div>
                <span className="text-xs font-medium text-center">{category.name}</span>
                <span className="text-xs font-bold text-foreground">
                  {amount > 0 ? formatCurrency(amount) : "$0"}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleConfirmBudget}
          className="w-full rounded-lg font-semibold text-lg"
          size="lg"
          disabled={totalBudget === 0}
        >
          Confirmar presupuesto
        </Button>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Agregando presupuesto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input
                value={selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : ""}
                disabled
                className="rounded-lg bg-muted"
              />
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="text"
                    placeholder="1.200.000"
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setAmount(value);
                    }}
                    className="rounded-lg pl-8 text-lg"
                  />
                </div>
                <Select value={currency} disabled>
                  <SelectTrigger className="w-24 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COP">COP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleAddBudget}
              className="w-full rounded-lg font-semibold text-lg text-black bg-primary-500 hover:bg-primary-600"
              size="lg"
            >
              Agregar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateBudget;
