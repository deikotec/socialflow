"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { StrategyCards } from "@/components/domain/dashboard/strategy-cards";
import { TeamSidebar } from "@/components/domain/dashboard/team-sidebar";
import { LeadMagnets } from "@/components/domain/dashboard/lead-magnets";
import { getContent } from "@/actions/content-actions";
import { CalendarView } from "@/components/domain/dashboard/calendar/calendar-view";
import { StrategyBlock, ContentPiece } from "@/types";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { currentCompany, loading } = useAuth();
  const [content, setContent] = useState<ContentPiece[]>([]);

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
  }, [currentCompany?.id]);

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
  const magnets = currentCompany.leadMagnets || [];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Strategy (3 cols width) */}
          <div className="lg:col-span-3 space-y-8">
            <StrategyCards
              strategies={strategies}
              weeklyPostCount={currentCompany.settings?.weeklyPostCount}
            />
            <LeadMagnets magnets={magnets} />
          </div>

          {/* Right Column: Team Sidebar (1 col width) */}
          <div className="lg:col-span-1 border-l pl-8 border-gray-100">
            <TeamSidebar team={team} companyName={currentCompany.name} />
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <CalendarView content={content} />
    </div>
  );
}
