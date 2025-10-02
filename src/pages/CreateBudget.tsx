import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plane, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTrips } from "@/contexts/TripContext";
import { categories, formatCurrency } from "@/utils/categories";
import { CategoryType } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const CreateBudget = () => {
  const navigate = useNavigate();
  const { trips, updateTrip } = useTrips();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [amount, setAmount] = useState("");
  const [currency] = useState("COP");

  // Get the latest trip (for demo purposes)
  const currentTrip = trips[trips.length - 1];

  if (!currentTrip) {
    return null;
  }

  const totalBudget = currentTrip.categories.reduce((sum, cat) => sum + cat.amount, 0);

  const handleAddBudget = () => {
    if (selectedCategory && amount) {
      const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
      const updatedCategories = [...currentTrip.categories];
      const existingIndex = updatedCategories.findIndex(
        (cat) => cat.category === selectedCategory
      );

      if (existingIndex >= 0) {
        updatedCategories[existingIndex].amount = numAmount;
      } else {
        updatedCategories.push({
          category: selectedCategory,
          amount: numAmount,
        });
      }

      updateTrip(currentTrip.id, {
        categories: updatedCategories,
        totalBudget: updatedCategories.reduce((sum, cat) => sum + cat.amount, 0),
      });

      setOpenDialog(false);
      setSelectedCategory(null);
      setAmount("");
    }
  };

  const handleOpenDialog = (category: CategoryType) => {
    setSelectedCategory(category);
    const existing = currentTrip.categories.find((cat) => cat.category === category);
    if (existing) {
      setAmount(existing.amount.toString());
    }
    setOpenDialog(true);
  };

  const getCategoryAmount = (categoryId: CategoryType) => {
    const cat = currentTrip.categories.find((c) => c.category === categoryId);
    return cat ? cat.amount : 0;
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
          onClick={() => navigate("/viajes")}
          className="w-full rounded-lg font-semibold text-lg text-black bg-primary-500 hover:bg-primary-600"
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
