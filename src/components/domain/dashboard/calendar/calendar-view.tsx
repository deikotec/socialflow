"use client";

import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addWeeks,
  subWeeks,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ContentPiece } from "@/types";
import { ContentModal } from "./content-modal";
import {
  updateContent,
  createContent,
  deleteContent,
} from "@/actions/content-actions";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CalendarFilters } from "./calendar-filters";
import { ContentCard } from "./content-card";

interface CalendarViewProps {
  content: ContentPiece[];
  onContentUpdate?: () => void;
}

export function CalendarView({ content, onContentUpdate }: CalendarViewProps) {
  const { currentCompany } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  // Filters State
  const [filters, setFilters] = useState({
    platform: "all",
    status: "all",
    assignedTo: "all",
  });

  // Modal State
  const [selectedContent, setSelectedContent] = useState<ContentPiece | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Navigation Handlers
  const next = () => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const prev = () => {
    if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Filters Handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ platform: "all", status: "all", assignedTo: "all" });
  };

  // Date Calculation
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const daysToRender =
    view === "month"
      ? eachDayOfInterval({ start: calendarStart, end: calendarEnd })
      : eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Content Filtering
  const getContentForDay = (date: Date) => {
    return content.filter((item) => {
      // 1. Date Check
      const isScheduled =
        item.scheduledDate && isSameDay(new Date(item.scheduledDate), date);
      const isRecording =
        item.recordingDate && isSameDay(new Date(item.recordingDate), date);

      if (!isScheduled && !isRecording) return false;

      // 2. Filters
      if (
        filters.platform !== "all" &&
        !item.platforms?.includes(filters.platform as any)
      )
        return false;
      if (filters.status !== "all" && item.status !== filters.status)
        return false;
      if (
        filters.assignedTo !== "all" &&
        item.assignedTo !== filters.assignedTo
      )
        return false;

      return true;
    });
  };

  // Interactions
  const handleDayClick = (date: Date) => {
    // Create a temporary "new" content piece
    const newPiece: Partial<ContentPiece> = {
      scheduledDate: date,
      platforms: ["instagram"],
      status: "idea",
      title: "",
      topic: "",
    };
    setSelectedContent({ ...newPiece, id: "" } as ContentPiece);
    setIsModalOpen(true);
  };

  const handleContentClick = (e: React.MouseEvent, item: ContentPiece) => {
    e.stopPropagation(); // Prevent triggering day click
    setSelectedContent(item);
    setIsModalOpen(true);
  };

  const handleSaveContent = async (id: string, data: Partial<ContentPiece>) => {
    if (!currentCompany) return;

    try {
      if (id) {
        // Update existing
        await updateContent(currentCompany.id, id, data);
        toast({ title: "Contenido actualizado" });
      } else {
        // Create new
        await createContent(currentCompany.id, data);
        toast({ title: "Contenido creado" });
      }
      onContentUpdate?.();
    } catch (e) {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!currentCompany) return;
    if (confirm("¿Estás seguro de eliminar este contenido?")) {
      try {
        await deleteContent(currentCompany.id, id);
        toast({ title: "Contenido eliminado" });
        setIsModalOpen(false);
        onContentUpdate?.();
      } catch (e) {
        toast({ title: "Error al eliminar", variant: "destructive" });
      }
    }
  };

  return (
    <>
      <Card className="border-none shadow-sm bg-white flex flex-col h-full">
        {/* Header Control Panel */}
        <div className="flex flex-col border-b">
          <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b bg-white">
            <div className="flex items-center gap-4">
              <CardTitle className="capitalize text-2xl font-bold text-slate-800">
                {format(
                  currentDate,
                  view === "month" ? "MMMM yyyy" : "'Semana de' MMM d",
                  { locale: es },
                )}
              </CardTitle>
              <div className="flex items-center rounded-lg border bg-slate-50 shadow-sm p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prev}
                  className="h-8 w-8 rounded-md hover:bg-white hover:text-blue-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  className="h-8 px-3 font-medium text-xs hover:bg-white hover:text-blue-600 rounded-md mx-0.5"
                >
                  Hoy
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={next}
                  className="h-8 w-8 rounded-md hover:bg-white hover:text-blue-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs
              value={view}
              onValueChange={(v) => setView(v as "month" | "week")}
              className="w-[180px]"
            >
              <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                <TabsTrigger
                  value="month"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-xs"
                >
                  Mes
                </TabsTrigger>
                <TabsTrigger
                  value="week"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-xs"
                >
                  Semana
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          {/* Filters Bar */}
          <CalendarFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            team={currentCompany?.team || []}
          />
        </div>

        <CardContent className="p-0 flex-1 overflow-auto">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b bg-slate-50 sticky top-0 z-10 shadow-sm">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div
            className={cn(
              "grid grid-cols-7 bg-slate-100 gap-px border-b", // Use gap to create borders
              view === "month"
                ? "auto-rows-[160px]" // Taller rows
                : "auto-rows-fr min-h-[600px]",
            )}
          >
            {daysToRender.map((day, idx) => {
              const dayContent = getContentForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "bg-white p-2 transition-all hover:bg-slate-50 flex flex-col gap-2 relative group cursor-pointer",
                    !isCurrentMonth &&
                      view === "month" &&
                      "bg-slate-50/50 text-slate-400",
                    isTodayDate &&
                      "bg-blue-50/30 ring-inset ring-2 ring-blue-500/20 z-0",
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={cn(
                        "text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-lg",
                        isTodayDate
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "text-slate-700",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-100 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDayClick(day);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Content List */}
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-full no-scrollbar px-0.5 pb-1">
                    {dayContent.map((piece) => (
                      <ContentCard
                        key={piece.id}
                        content={piece}
                        onClick={(e) => handleContentClick(e, piece)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ContentModal
        content={selectedContent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContent}
        onDelete={handleDeleteContent}
        team={currentCompany?.team || []}
        companyDriveLink={currentCompany?.drive_link}
      />
    </>
  );
}
