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
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Video,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ContentPiece } from "@/types";
import { ContentModal } from "./content-modal";
import { updateContent, createContent } from "@/actions/content-actions"; // Assuming createContent is exported there
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

interface CalendarViewProps {
  content: ContentPiece[];
}

export function CalendarView({ content }: CalendarViewProps) {
  const { currentCompany } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

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
      // Check scheduled date
      const isScheduled =
        item.scheduledDate && isSameDay(new Date(item.scheduledDate), date);
      // Check recording date
      const isRecording =
        item.recordingDate && isSameDay(new Date(item.recordingDate), date);

      return isScheduled || isRecording;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idea":
        return "bg-gray-100 text-gray-600";
      case "posted":
        return "bg-green-100 text-green-700";
      case "filming":
        return "bg-red-50 text-red-600";
      default:
        return "bg-blue-50 text-blue-600";
    }
  };

  // Interactions
  const handleDayClick = (date: Date) => {
    // Create a temporary "new" content piece
    const newPiece: Partial<ContentPiece> = {
      scheduledDate: date,
      platform: "instagram",
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
      window.location.reload();
    } catch (e) {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const getAssignedUserName = (id?: string) => {
    if (!id || !currentCompany?.team) return null;
    return currentCompany.team.find((m) => m.id === id)?.name?.split(" ")[0];
  };

  return (
    <>
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-4">
            <CardTitle className="capitalize text-xl">
              {format(
                currentDate,
                view === "month" ? "MMMM yyyy" : "'Semana de' MMM d",
                { locale: es },
              )}
            </CardTitle>
            <div className="flex items-center rounded-md border bg-white shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={prev}
                className="h-8 w-8 rounded-none border-r"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="h-8 rounded-none px-3 font-normal"
              >
                Hoy
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={next}
                className="h-8 w-8 rounded-none border-l"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs
            value={view}
            onValueChange={(v) => setView(v as "month" | "week")}
            className="w-[200px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="month">Mes</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b bg-gray-50/50">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div
                key={day}
                className="py-2 text-center text-sm font-medium text-muted-foreground uppercase tracking-wide"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div
            className={cn(
              "grid grid-cols-7",
              view === "month"
                ? "auto-rows-[120px]"
                : "auto-rows-fr min-h-[400px]",
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
                    "border-b border-r p-2 transition-colors hover:bg-gray-50/50 flex flex-col gap-1 relative group cursor-pointer",
                    !isCurrentMonth &&
                      view === "month" &&
                      "bg-gray-50/30 text-muted-foreground",
                    isTodayDate && "bg-blue-50/20",
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={cn(
                        "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                        isTodayDate
                          ? "bg-blue-600 text-white"
                          : "text-gray-700",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDayClick(day);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Content List */}
                  <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-full no-scrollbar">
                    {dayContent.map((piece) => {
                      const isRecording =
                        piece.recordingDate &&
                        isSameDay(new Date(piece.recordingDate), day);
                      const assignedName = getAssignedUserName(
                        piece.assignedTo,
                      );

                      return (
                        <div
                          key={piece.id + (isRecording ? "-rec" : "")}
                          onClick={(e) => handleContentClick(e, piece)}
                          className={cn(
                            "text-[10px] p-1.5 rounded border border-l-2 truncate cursor-pointer hover:opacity-80 transition-opacity hover:shadow-md flex flex-col",
                            view === "week" ? "p-3 mb-2 shadow-sm" : "",
                            isRecording
                              ? "bg-amber-50 border-amber-300 text-amber-800"
                              : getStatusColor(piece.status),
                          )}
                          style={{
                            borderLeftColor: isRecording
                              ? "#F59E0B"
                              : piece.platform === "instagram"
                                ? "#E1306C"
                                : "#FF0000",
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {isRecording && (
                              <Video className="h-3 w-3 mr-0.5" />
                            )}
                            {view === "week" && !isRecording && (
                              <Video className="h-3 w-3" />
                            )}
                            <span
                              className={cn(
                                "font-medium",
                                isRecording && "font-bold",
                              )}
                            >
                              {isRecording ? "Grabar: " : ""}{" "}
                              {piece.title || piece.topic || "Sin título"}
                            </span>
                          </div>

                          {isRecording && assignedName && (
                            <div className="text-[9px] opacity-80 mt-0.5 font-medium">
                              👤 {assignedName}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
        team={currentCompany?.team || []}
      />
    </>
  );
}
