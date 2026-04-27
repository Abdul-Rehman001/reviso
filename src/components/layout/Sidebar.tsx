"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PenLine, 
  Library, 
  History, 
  Target, 
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Quote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudyStore } from "@/stores/useStudyStore";
import { Button } from "@/components/ui/button";
import { memo } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Log Study", href: "/log", icon: PenLine },
  { name: "Subjects", href: "/subjects", icon: Library },
  { name: "History", href: "/history", icon: History },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapse } = useStudyStore();

  return (
    <aside className={cn(
      "hidden md:flex flex-col border-r bg-surface h-screen sticky top-0 transition-all duration-300 z-50",
      sidebarCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "h-16 flex items-center border-b px-4 transition-all duration-300",
        sidebarCollapsed ? "justify-center" : "justify-between"
      )}>
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary overflow-hidden">
            <GraduationCap className="h-6 w-6 shrink-0" />
            <span className="truncate">Reviso</span>
          </Link>
        )}
        {sidebarCollapsed && <GraduationCap className="h-6 w-6 text-primary" />}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebarCollapse}
          className={cn("h-8 w-8", sidebarCollapsed ? "absolute -right-4 top-20 z-40 bg-surface border rounded-full shadow-sm hover:bg-accent" : "")}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true} // Explicitly prefetch for faster navigation
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-text-secondary hover:bg-accent-subtle hover:text-primary",
                sidebarCollapsed ? "justify-center px-2" : ""
              )}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary-foreground" : "text-text-muted group-hover:text-primary")} />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        {!sidebarCollapsed ? (
          <div className="p-4 rounded-xl bg-accent-subtle border border-accent-muted text-sm text-text-secondary">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Quote className="h-4 w-4" />
              <p className="font-semibold text-xs uppercase tracking-wider">Daily Spark</p>
            </div>
            <p className="italic text-xs leading-relaxed">
              &quot;Focus on being productive instead of busy.&quot;
            </p>
          </div>
        ) : (
          <div className="flex justify-center p-2 rounded-lg bg-accent-subtle text-primary" title="Daily Motivation">
            <Quote className="h-5 w-5" />
          </div>
        )}
      </div>
    </aside>
  );
});
