"use client";

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
  Link as LinkIcon,
  Images,
  Upload,
  FileIcon,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  Check,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TeamMember } from "@/types";
import {
  notifyTeamMember,
  uploadFileAction,
} from "@/actions/integration-actions";
import { publishContent } from "@/actions/social-actions";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

const SocialMediaEmbed = ({ url }: { url?: string }) => {
  if (!url) return null;

  // Instagram
  if (url.includes("instagram.com")) {
    // Extract ID (p/ID or reel/ID)
    const match = url.match(/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
    if (match?.[1]) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden border bg-gray-50 flex justify-center">
          <iframe
            src={`https://www.instagram.com/p/${match[1]}/embed/captioned/`}
            className="w-full max-w-[320px] h-[400px]"
            frameBorder="0"
            scrolling="no"
            allowtransparency="true"
          ></iframe>
        </div>
      );
    }
  }

  // TikTok
  if (url.includes("tiktok.com")) {
    const videoIdMatch = url.match(/video\/(\d+)/);
    if (videoIdMatch?.[1]) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden border bg-black flex justify-center">
          <iframe
            src={`https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`}
            className="w-full max-w-[320px] h-[400px]"
            frameBorder="0"
            allowFullScreen
            scrolling="no"
          ></iframe>
        </div>
      );
    }
  }

  return null;
};

const DrivePreview = ({
  fileId,
  mimeType,
}: {
  fileId?: string | null;
  mimeType?: string;
}) => {
  if (!fileId) return null;

  // Use Google Drive Preview URL
  const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;

  return (
    <div className="w-full h-full bg-zinc-800 rounded-lg overflow-hidden relative group">
      <iframe
        src={previewUrl}
        className="w-full h-full"
        allow="autoplay"
        style={{ border: 0 }}
      ></iframe>
    </div>
  );
};

export function ContentModal({
  content,
  isOpen,
  onClose,
  onSave,
  onDelete,
  team = [],
  companyDriveLink,
}: ContentModalProps & { companyDriveLink?: string }) {
  const { currentCompany } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<ContentPiece>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (content) {
      const data = { ...content };
      if (!data.platforms) {
        // @ts-ignore
        data.platforms = data.platform ? [data.platform] : [];
      }
      setFormData(data);
    } else {
      setFormData({ platforms: ["instagram"] });
    }
  }, [content]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentCompany) return;

    setIsUploading(true);

    const fileArray = Array.from(files);
    const newCarouselFiles = [...(formData.carouselFiles || [])];

    try {
      for (const file of fileArray) {
        const reader = new FileReader();
        const base64Content = await new Promise<string>((resolve) => {
          reader.onload = (e) =>
            resolve((e.target?.result as string).split(",")[1]);
          reader.readAsDataURL(file);
        });

        const result = await uploadFileAction(
          currentCompany.id,
          currentCompany.drive_folder_id,
          file.name,
          base64Content,
          file.type,
          formData.scheduledDate,
          formData.format,
        );

        if (result.success) {
          if (formData.format === "carousel") {
            newCarouselFiles.push({
              drive_file_id: result.fileId,
              drive_link: result.webViewLink,
              mimeType: file.type,
              order: newCarouselFiles.length,
              name: file.name,
            });
          } else {
            setFormData((prev) => ({
              ...prev,
              drive_link: result.webViewLink,
              drive_file_id: result.fileId,
            }));
            toast({ title: "Archivo subido a Drive" });
            break;
          }
        } else {
          toast({
            title: "Error al subir",
            variant: "destructive",
            description: result.error,
          });
        }
      }

      if (formData.format === "carousel") {
        setFormData((prev) => ({ ...prev, carouselFiles: newCarouselFiles }));
        toast({
          title: `Se subieron ${fileArray.length} archivos para el carrusel`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error al procesar archivo", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const removeCarouselItem = (index: number) => {
    const newFiles = [...(formData.carouselFiles || [])];
    newFiles.splice(index, 1);
    newFiles.forEach((f, i) => (f.order = i));
    setFormData({ ...formData, carouselFiles: newFiles });
  };

  const moveCarouselItem = (index: number, direction: "up" | "down") => {
    const newFiles = [...(formData.carouselFiles || [])];
    if (direction === "up" && index > 0) {
      [newFiles[index], newFiles[index - 1]] = [
        newFiles[index - 1],
        newFiles[index],
      ];
    } else if (direction === "down" && index < newFiles.length - 1) {
      [newFiles[index], newFiles[index + 1]] = [
        newFiles[index + 1],
        newFiles[index],
      ];
    }
    newFiles.forEach((f, i) => (f.order = i));
    setFormData({ ...formData, carouselFiles: newFiles });
  };

  const [isPublishing, setIsPublishing] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content?.id || "", formData);

      // Notification Logic
      if (formData.assignedTo && formData.assignedTo !== content?.assignedTo) {
        const assignedMember = team.find((m) => m.id === formData.assignedTo);
        if (assignedMember) {
          await notifyTeamMember(
            assignedMember.id,
            assignedMember.name,
            assignedMember.email,
            formData as ContentPiece,
          );
        }
      }

      onClose();
    } catch (error) {
      console.error("Failed to save content", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!content?.id || !currentCompany) return;

    setIsPublishing(true);
    try {
      // Ensure we save latest changes first if needed, but for now rely on what's in DB or assume user saved.
      // Better UX: Save first?
      // For simplicity of this "Test" button:
      const result = await publishContent(currentCompany.id, content.id);

      if (result.success) {
        toast({ title: "Contenido publicado exitosamente!" });
        onClose();
      } else {
        const details = result.results
          ?.map(
            (r: any) =>
              `${r.platform}: ${r.status} ${r.error ? `(${r.error})` : ""}`,
          )
          .join("\n");
        toast({
          title: "Error al publicar",
          description: result.error || details,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Error crítico",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const statusWorkflow: ContentStatus[] = [
    "idea",
    "scripting",
    "filming",
    "editing",
    "review",
    "approved",
    "scheduled",
    "posted",
  ];

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
        <DialogHeader className="p-6 pb-2 flex flex-row items-center justify-between">
          <DialogTitle>Editor de Contenido</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={() => {
              if (!currentCompany) return;
              const link = `${window.location.origin}/share/${content.id}?c=${currentCompany.id}`;
              navigator.clipboard.writeText(link);
              toast({
                title: "Enlace copiado",
                description: "Enlace público listo para compartir.",
              });
            }}
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Copiar Link Público
          </Button>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
          {/* LEFT COLUMN: MEDIA */}
          <div className="bg-slate-50 p-6 border-r border-slate-100 flex flex-col items-center justify-center overflow-y-auto">
            <div className="w-full max-w-sm">
              {formData.format === "carousel" ? (
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {formData.carouselFiles?.map((file, idx) => (
                      <div
                        key={file.drive_file_id}
                        className="relative group aspect-square bg-gray-900 rounded-lg overflow-hidden shadow-sm"
                      >
                        <DrivePreview fileId={file.drive_file_id} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-6 w-6"
                              onClick={() => moveCarouselItem(idx, "up")}
                              disabled={idx === 0}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-6 w-6"
                              onClick={() => moveCarouselItem(idx, "down")}
                              disabled={
                                idx ===
                                (formData.carouselFiles?.length || 0) - 1
                              }
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-6 w-6"
                            onClick={() => removeCarouselItem(idx)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="absolute top-1 left-2 text-white text-xs font-bold drop-shadow-md bg-black/50 px-1 rounded">
                          {idx + 1}
                        </div>
                      </div>
                    ))}

                    <div className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors relative bg-white aspect-square cursor-pointer min-h-[100px]">
                      {isUploading ? (
                        <div className="animate-pulse flex flex-col items-center">
                          <Upload className="w-6 h-6 text-blue-500 mb-1" />
                          <span className="text-[10px] font-medium">...</span>
                        </div>
                      ) : (
                        <>
                          <Plus className="w-8 h-8 mb-1" />
                          <span className="text-xs">Añadir Slide</span>
                          <Input
                            type="file"
                            multiple
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : formData.drive_file_id ? (
                <div className="relative group rounded-xl overflow-hidden shadow-lg bg-black aspect-[9/16]">
                  <DrivePreview fileId={formData.drive_file_id} />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        drive_link: undefined,
                        drive_file_id: undefined,
                      })
                    }
                  >
                    <span className="text-lg">×</span>
                  </Button>
                </div>
              ) : formData.referenceLink &&
                (formData.referenceLink.includes("instagram") ||
                  formData.referenceLink.includes("tiktok")) ? (
                <SocialMediaEmbed url={formData.referenceLink} />
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors relative bg-white aspect-[4/5]">
                  <Input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="animate-pulse flex flex-col items-center">
                      <Upload className="w-8 h-8 text-blue-500 mb-2" />
                      <span className="text-sm font-medium">Subiendo...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-400 mb-4" />
                      <h3 className="font-semibold text-slate-700">
                        Subir Creativo
                      </h3>
                      <p className="text-xs text-slate-500 mt-2">
                        Arrastra o haz clic para seleccionar
                      </p>
                    </>
                  )}
                </div>
              )}

              {companyDriveLink && (
                <div className="mt-4 text-center">
                  <a
                    href={companyDriveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1"
                  >
                    <Images className="w-3 h-3" /> Ver Carpeta Drive
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: FORM */}
          <div className="p-6 overflow-y-auto custom-scrollbar bg-white">
            <div className="space-y-6">
              {/* Feedback Alert */}
              {formData.status === "rejected" && formData.feedback && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-2 rounded-r-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle
                        className="h-5 w-5 text-red-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Se han solicitado cambios
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{formData.feedback}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Título del post..."
                  className="font-medium text-lg"
                />
              </div>

              {/* Meta Row: Platform & Format */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plataformas</Label>
                  <div className="flex gap-2">
                    {["instagram", "tiktok", "youtube"].map((p) => {
                      const isSelected = formData.platforms?.includes(p as any);
                      return (
                        <div
                          key={p}
                          onClick={() => {
                            const current = formData.platforms || [];
                            const newPlatforms = isSelected
                              ? current.filter((x) => x !== p)
                              : [...current, p];
                            setFormData({
                              ...formData,
                              platforms: newPlatforms as any,
                            });
                          }}
                          className={cn(
                            "cursor-pointer border rounded-md px-3 py-2 flex items-center gap-2 transition-all select-none",
                            isSelected
                              ? "bg-blue-50 border-blue-500 text-blue-700"
                              : "bg-white border-gray-200 hover:bg-gray-50",
                          )}
                        >
                          <span className="capitalize text-sm font-medium">
                            {p}
                          </span>
                          {isSelected && <Check size={14} className="ml-1" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select
                    value={formData.format || "static"}
                    onValueChange={(v: any) =>
                      setFormData({ ...formData, format: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reel">Reel</SelectItem>
                      <SelectItem value="carousel">Carrusel</SelectItem>
                      <SelectItem value="static">Post</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status Bar (Full Width) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Estado</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {formData.status || "idea"}
                    </span>
                    {formData.status === "scheduled" && (
                      <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-1 rounded animate-pulse">
                        Se publicará automáticamente
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 w-full bg-slate-50 p-2 rounded-xl border border-slate-100">
                  {statusWorkflow.map((step) => {
                    const isActive = formData.status === step;
                    const isPast =
                      statusWorkflow.indexOf(formData.status!) >=
                      statusWorkflow.indexOf(step);
                    return (
                      <div
                        key={step}
                        onClick={() =>
                          setFormData({ ...formData, status: step })
                        }
                        className={cn(
                          "h-2 flex-1 rounded-full cursor-pointer transition-all duration-300 hover:scale-105",
                          isActive
                            ? "bg-blue-500 shadow-sm ring-2 ring-blue-100"
                            : isPast
                              ? "bg-blue-200"
                              : "bg-slate-200 hover:bg-slate-300",
                        )}
                        title={step}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Publicación</Label>
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
                    className="text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Grabación</Label>
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
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Assignee */}
              <div className="space-y-2">
                <Label>Responsable</Label>
                <Select
                  value={formData.assignedTo || "unassigned"}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      assignedTo: v === "unassigned" ? undefined : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nadie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Nadie</SelectItem>
                    {team.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Guion / Idea</Label>
                  {[
                    "filming",
                    "editing",
                    "review",
                    "approved",
                    "posted",
                  ].includes(formData.status || "idea") && (
                    <Badge
                      variant="outline"
                      className="text-green-600 bg-green-50 border-green-200"
                    >
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Idea Aprobada
                      </div>
                    </Badge>
                  )}
                </div>
                <Textarea
                  value={formData.script || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, script: e.target.value })
                  }
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Caption</Label>
                <Textarea
                  value={formData.caption || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, caption: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>

              {/* Link */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Referencia</Label>
                  <Input
                    value={formData.referenceLink || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        referenceLink: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>

                {/* Upload Button */}
                <div className="pt-2">
                  <Label
                    htmlFor="file-upload-right"
                    className="cursor-pointer inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Archivo
                    <Input
                      id="file-upload-right"
                      type="file"
                      className="sr-only"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </Label>
                  {isUploading && (
                    <span className="ml-3 text-xs text-muted-foreground animate-pulse">
                      Subiendo...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          {onDelete ? (
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(content.id)}
            >
              Eliminar
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            {content.id && (
              <Button
                variant="secondary"
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
                onClick={handlePublish}
                disabled={isPublishing || isSaving}
              >
                <Send className="w-4 h-4 mr-2" />
                {isPublishing ? "Publicando..." : "Publicar Ahora (Test)"}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
