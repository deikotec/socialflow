import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentPiece, ContentStatus } from "@/types";
import {
  Video,
  Image as ImageIcon,
  Smartphone,
  Link as LinkIcon,
  Images,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { TeamMember } from "@/types";

interface ContentModalProps {
  content: ContentPiece | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<ContentPiece>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  team?: TeamMember[];
}

export function ContentModal({
  content,
  isOpen,
  onClose,
  onSave,
  onDelete,
  team = [],
}: ContentModalProps) {
  const [formData, setFormData] = useState<Partial<ContentPiece>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (content) {
      setFormData({ ...content });
    } else {
      setFormData({});
    }
  }, [content]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content?.id || "", formData);
      onClose();
    } catch (error) {
      console.error("Failed to save content", error);
    } finally {
      setIsSaving(false);
    }
  };

  const statusWorkflow: ContentStatus[] = [
    "idea",
    "scripting",
    "filming",
    "editing",
    "review",
    "approved",
    "posted",
  ];

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="uppercase text-xs font-bold tracking-wider"
            >
              {formData.format || "Post"} • {formData.topic}
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-serif">
            {formData.title || "Nuevo Contenido"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Status Workflow Stepper */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 no-scrollbar">
            {statusWorkflow.map((step, idx) => {
              const isActive = formData.status === step;
              const isPast = statusWorkflow.indexOf(formData.status!) > idx;

              return (
                <div
                  key={step}
                  onClick={() => setFormData({ ...formData, status: step })}
                  className={cn(
                    "flex flex-col items-center gap-1 cursor-pointer min-w-[60px]",
                    isActive
                      ? "opacity-100 scale-105"
                      : isPast
                        ? "opacity-60"
                        : "opacity-30 hover:opacity-50",
                  )}
                >
                  <div
                    className={cn(
                      "h-2 w-full rounded-full transition-all duration-300",
                      isActive
                        ? "bg-blue-600"
                        : isPast
                          ? "bg-green-500"
                          : "bg-gray-200",
                    )}
                  />
                  <span className="text-[10px] font-bold uppercase">
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Core Info */}
            <div className="space-y-4">
              <div>
                <Label>Titulo / Idea</Label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Título atractivo..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Formato</Label>
                  <Select
                    value={formData.format || "static"}
                    onValueChange={(
                      v: "reel" | "carousel" | "static" | "story",
                    ) => setFormData({ ...formData, format: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reel">
                        <span className="flex items-center">
                          <Video className="w-4 h-4 mr-2" /> Reel
                        </span>
                      </SelectItem>
                      <SelectItem value="carousel">
                        <span className="flex items-center">
                          <Images className="w-4 h-4 mr-2" /> Carrusel
                        </span>
                      </SelectItem>
                      <SelectItem value="static">
                        <span className="flex items-center">
                          <ImageIcon className="w-4 h-4 mr-2" /> Post
                        </span>
                      </SelectItem>
                      <SelectItem value="story">
                        <span className="flex items-center">
                          <Smartphone className="w-4 h-4 mr-2" /> Story
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Plataforma</Label>
                  <Select
                    value={formData.platform || "instagram"}
                    onValueChange={(v: "instagram" | "tiktok" | "youtube") =>
                      setFormData({ ...formData, platform: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Fecha y Hora de Publicación</Label>
                <Input
                  type="datetime-local"
                  value={
                    formData.scheduledDate
                      ? new Date(formData.scheduledDate)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduledDate: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  Fecha de Grabación
                  {formData.recordingDate && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-green-50 text-green-700"
                    >
                      Programado
                    </Badge>
                  )}
                </Label>
                <Input
                  type="datetime-local"
                  value={
                    formData.recordingDate
                      ? new Date(formData.recordingDate)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recordingDate: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Responsable de Grabación</Label>
                <Select
                  value={formData.assignedTo || "unassigned"}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      assignedTo: v === "unassigned" ? undefined : v,
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar miembro..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Sin asignar</SelectItem>
                    {team.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Referencia (Link)</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.referenceLink || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        referenceLink: e.target.value,
                      })
                    }
                    placeholder="https://instagram.com/..."
                  />
                  {formData.referenceLink && (
                    <Button variant="outline" size="icon" asChild>
                      <a
                        href={formData.referenceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Creative Content */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2">
                <Label className="text-gray-600 font-semibold tracking-wide text-xs uppercase">
                  Guion / Hook
                </Label>
                <Textarea
                  value={formData.script || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, script: e.target.value })
                  }
                  className="min-h-[120px] bg-white italic font-serif text-lg leading-relaxed border-gray-200 focus:border-blue-300 transition-colors"
                  placeholder="Escribe el gancho del video o la idea principal aquí..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 font-semibold tracking-wide text-xs uppercase">
                  Caption (Pie de Foto)
                </Label>
                <Textarea
                  value={formData.caption || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, caption: e.target.value })
                  }
                  className="min-h-[100px] text-sm"
                  placeholder="Texto para el post..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center sm:justify-end gap-2 border-t pt-4">
          {onDelete && (
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-700 hover:bg-red-50 mr-auto"
              onClick={() => onDelete(content.id)}
            >
              Eliminar
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
