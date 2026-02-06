"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target, // Funnel/Embudo
  Sparkles, // Creation/Creation
  BarChart3, // Stats/Estadísticas
  Settings,
  LucideIcon,
  Home,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  { name: "Inicio", href: "/home", icon: Home },
  { name: "Embudo", href: "/funnel", icon: Target },
  { name: "Creación", href: "/creation", icon: Sparkles },
  { name: "Estadísticas", href: "/stats", icon: BarChart3 },
  { name: "Configuración", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/clients"
          className="flex items-center gap-2 font-bold text-xl"
        >
          <LayoutDashboard className="h-6 w-6" />
          <span>SocialFlow</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4">{/* Footer content if needed */}</div>
    </div>
  );
}
