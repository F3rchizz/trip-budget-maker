import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTrips } from "@/contexts/TripContext";
import { formatCurrency, getCategoryInfo } from "@/utils/categories";
import Layout from "@/components/Layout";

const Presupuesto = () => {
  const { trips, movements } = useTrips();
  const currentTrip = trips[trips.length - 1];

  if (!currentTrip) {
    return (
      <Layout>
        <div className="p-6 text-center py-12">
          <p className="text-muted-foreground">Crea un viaje primero para ver el presupuesto</p>
        </div>
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
