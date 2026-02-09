"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import { TeamMember } from "@/types";

interface CalendarFiltersProps {
  filters: {
    platform: string;
    status: string;
    assignedTo: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  team: TeamMember[];
}

export function CalendarFilters({
  filters,
  onFilterChange,
  onClearFilters,
  team,
}: CalendarFiltersProps) {
  const hasActiveFilters =
    filters.platform !== "all" ||
    filters.status !== "all" ||
    filters.assignedTo !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white border-b sticky top-0 z-10">
      <div className="flex items-center text-sm font-medium text-slate-500 mr-2">
        <Filter className="w-4 h-4 mr-2" />
        Filtros:
      </div>

      {/* Platform Filter */}
      <Select
        value={filters.platform}
        onValueChange={(v) => onFilterChange("platform", v)}
      >
        <SelectTrigger className="w-[140px] h-9 text-xs">
          <SelectValue placeholder="Plataforma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="instagram">Instagram</SelectItem>
          <SelectItem value="tiktok">TikTok</SelectItem>
          <SelectItem value="youtube">YouTube</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(v) => onFilterChange("status", v)}
      >
        <SelectTrigger className="w-[140px] h-9 text-xs">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="idea">Idea</SelectItem>
          <SelectItem value="scripting">Guion</SelectItem>
          <SelectItem value="filming">Grabación</SelectItem>
          <SelectItem value="editing">Edición</SelectItem>
          <SelectItem value="review">Revisión</SelectItem>
          <SelectItem value="approved">Aprobado</SelectItem>
          <SelectItem value="scheduled">Programado</SelectItem>
          <SelectItem value="posted">Publicado</SelectItem>
        </SelectContent>
      </Select>

      {/* Team Filter */}
      <Select
        value={filters.assignedTo}
        onValueChange={(v) => onFilterChange("assignedTo", v)}
      >
        <SelectTrigger className="w-[160px] h-9 text-xs">
          <SelectValue placeholder="Responsable" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {team.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {member.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-9 text-xs text-slate-500 hover:text-red-500"
        >
          <X className="w-3 h-3 mr-1" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
