import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Plane, Receipt, PiggyBank, Plus, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RegisterExpenseModal from "./RegisterExpenseModal";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-muted">U</AvatarFallback>
          </Avatar>
          
          <div className="flex items-center gap-2">
            <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">tripflow</span>
          </div>

          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="max-w-md mx-auto flex items-center justify-around py-2">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>

          <Link
            to="/viajes"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive("/viajes") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plane className="h-5 w-5" />
            <span className="text-xs font-medium">Viajes</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center -mt-6"
          >
            <div className="bg-primary h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
              <Plus className="h-7 w-7 text-primary-foreground" />
            </div>
          </button>

          <Link
            to="/movimientos"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive("/movimientos") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="h-5 w-5" />
            <span className="text-xs font-medium">Movimientos</span>
          </Link>

          <Link
            to="/presupuesto"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive("/presupuesto") ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PiggyBank className="h-5 w-5" />
            <span className="text-xs font-medium">Presupuesto</span>
          </Link>
        </div>
      </nav>

      <RegisterExpenseModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
};

export default Layout;
