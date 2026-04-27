"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { Menu, Moon, Sun, GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, PenLine, Library, History, Target, Settings } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Log Study", href: "/log", icon: PenLine },
  { name: "Subjects", href: "/subjects", icon: Library },
  { name: "History", href: "/history", icon: History },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Topbar() {
  const { setTheme, theme } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const userInitial = session?.user?.name?.[0]?.toUpperCase() || "S";

  return (
    <header className="h-16 border-b bg-surface-elevated flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger>
              <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </div>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="h-16 flex items-center px-6 border-b">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
                  <GraduationCap className="h-6 w-6" />
                  <span>Reviso</span>
                </Link>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-text-secondary hover:bg-accent-subtle hover:text-primary"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-text-muted")} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Page Title (Optional context) */}
        <h1 className="font-semibold text-lg hidden sm:block capitalize">
          {pathname.split('/')[1] || 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <CustomDropdown
          align="right"
          trigger={
            <div className="relative h-8 w-8 rounded-full overflow-hidden border cursor-pointer">
              <Avatar className="h-full w-full">
                <AvatarImage src={session?.user?.image || ""} alt="User avatar" />
                <AvatarFallback className="bg-accent-subtle text-primary font-medium">{userInitial}</AvatarFallback>
              </Avatar>
            </div>
          }
          items={[
            {
              label: "Settings",
              onClick: () => router.push("/settings")
            },
            {
              label: "Log out",
              variant: "destructive",
              onClick: () => signOut()
            }
          ]}
        />
      </div>
    </header>
  );
}
