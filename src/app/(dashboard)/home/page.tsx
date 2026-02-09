"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { StrategyCards } from "@/components/domain/dashboard/strategy-cards";
import { TeamSidebar } from "@/components/domain/dashboard/team-sidebar";
import { getContent } from "@/actions/content-actions";
import { CalendarView } from "@/components/domain/dashboard/calendar/calendar-view";
import { StrategyBlock, ContentPiece } from "@/types";
import { useEffect, useState } from "react";
import { BarChart3, Users } from "lucide-react";

export default function HomePage() {
  const { currentCompany, loading } = useAuth();
  const [content, setContent] = useState<ContentPiece[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshContent = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchContent = async () => {
      if (currentCompany?.id) {
        try {
          const data = await getContent(currentCompany.id);
          setContent(data);
        } catch (e) {
          console.error("Failed to fetch content", e);
        }
      }
    };
    fetchContent();
  }, [currentCompany?.id, refreshTrigger]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!currentCompany) {
    return <div className="p-8">Please select a company.</div>;
  }

  // Use real data or fallbacks
  const strategies = currentCompany.strategy?.length
    ? currentCompany.strategy
    : ([
        { title: "Valor", percentage: 70, type: "Valor", keywords: [] },
        { title: "Viral", percentage: 20, type: "Viral", keywords: [] },
        { title: "Venta", percentage: 10, type: "Venta", keywords: [] },
      ] as StrategyBlock[]);

  const team = currentCompany.team || [];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)] bg-slate-50 overflow-hidden">
      {/* Main Content: Calendar (Priority) */}
      <main className="flex-1 overflow-hidden h-full relative flex flex-col">
        <CalendarView content={content} onContentUpdate={refreshContent} />
      </main>

      {/* Right Sidebar: Context & Widgets */}
      <aside className="w-full lg:w-80 bg-white border-l shadow-[shadow-sm] overflow-y-auto p-5 flex flex-col gap-8 shrink-0 z-20 h-full scrollbar-thin scrollbar-thumb-slate-200">
        {/* Strategy Section */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Estrategia
          </h3>
          {/* Force single column layout for sidebar */}
          <div className="[&>div>div]:grid-cols-1 [&>div>div]:gap-3 [&>div>h2]:hidden">
            <StrategyCards
              strategies={strategies}
              weeklyPostCount={currentCompany.settings?.weeklyPostCount}
            />
          </div>
        </div>

        {/* Team Section */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4" />
            Equipo
          </h3>
          <TeamSidebar team={team} companyName={currentCompany.name} />
        </div>
      </aside>
    </div>
  );
}
