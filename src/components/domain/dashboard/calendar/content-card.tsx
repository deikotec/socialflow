"use client";

import { ContentPiece, ContentStatus } from "@/types";
import { cn } from "@/lib/utils";
import {
  Instagram,
  Video,
  Youtube,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ContentCardProps {
  content: ContentPiece;
  onClick: (e: React.MouseEvent) => void;
  isCompact?: boolean; // For Month view
}

const statusConfig: Record<
  ContentStatus,
  { color: string; bg: string; icon: any }
> = {
  idea: { color: "text-slate-500", bg: "bg-slate-100", icon: FileText },
  scripting: { color: "text-indigo-500", bg: "bg-indigo-50", icon: FileText },
  filming: { color: "text-orange-500", bg: "bg-orange-50", icon: Video },
  editing: { color: "text-purple-500", bg: "bg-purple-50", icon: Video },
  review: { color: "text-yellow-600", bg: "bg-yellow-50", icon: AlertCircle },
  approved: { color: "text-blue-600", bg: "bg-blue-50", icon: CheckCircle2 },
  scheduled: { color: "text-cyan-600", bg: "bg-cyan-50", icon: Clock },
  posted: { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
  rejected: { color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case "instagram":
      return <Instagram className="w-3 h-3" />;
    case "tiktok":
      return (
        <span className="text-[9px] font-bold w-3 h-3 flex items-center justify-center">
          Tk
        </span>
      );
    case "youtube":
      return <Youtube className="w-3 h-3" />;
    default:
      return <div className="w-3 h-3 rounded-full bg-slate-300" />;
  }
};

export function ContentCard({
  content,
  onClick,
  isCompact = true,
}: ContentCardProps) {
  const status = statusConfig[content.status] || statusConfig.idea;
  const StatusIcon = status.icon;

  // Platform Color Strip
  const platformColor = content.platforms?.includes("instagram")
    ? "bg-gradient-to-b from-purple-500 to-orange-500"
    : content.platforms?.includes("tiktok")
      ? "bg-black"
      : content.platforms?.includes("youtube")
        ? "bg-red-600"
        : "bg-slate-300";

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-md border shadow-sm cursor-pointer hover:shadow-md transition-all group overflow-hidden bg-white",
        "flex flex-col",
        isCompact ? "min-h-[60px]" : "min-h-[100px]",
      )}
    >
      {/* Left Color Strip */}
      <div
        className={cn("absolute left-0 top-0 bottom-0 w-1", platformColor)}
      />

      <div className="p-2 pl-3 flex flex-col gap-1 h-full justify-between">
        {/* Header: Platform & Time (if set) */}
        <div className="flex justify-between items-center text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            {content.platforms?.map((p) => (
              <PlatformIcon key={p} platform={p} />
            ))}
          </div>
          {content.scheduledDate && (
            <span>{format(new Date(content.scheduledDate), "HH:mm")}</span>
          )}
        </div>

        {/* Title */}
        <div className="font-medium text-xs text-slate-800 line-clamp-2 leading-tight">
          {content.title || content.topic || "Sin título"}
        </div>

        {/* Footer: Status Badge */}
        <div className="flex items-center justify-between mt-1">
          <div
            className={cn(
              "flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium",
              status.bg,
              status.color,
            )}
          >
            <StatusIcon className="w-2.5 h-2.5" />
            <span className="capitalize">
              {content.status === "scheduled" ? "Prog." : content.status}
            </span>
          </div>

          {/* Thumbnail Preview (Placeholder if link exists) */}
          {content.drive_link && (
            <div className="h-4 w-4 rounded bg-slate-100 border flex items-center justify-center text-[8px] text-slate-400">
              img
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
