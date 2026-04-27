import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delay={0}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Responsive Topbar */}
          <Topbar />
          
          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
