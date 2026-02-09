import {
  getPublicContent,
  approveContent,
  rejectContent,
} from "@/actions/portal-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  X,
  MessageSquare,
  Download,
  Play,
  FileText,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// --- INLINE COMPONENTS (Refactor later) ---
const SocialMediaEmbed = ({ url }: { url?: string }) => {
  if (!url) return null;
  if (url.includes("instagram.com")) {
    const match = url.match(/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
    if (match?.[1]) {
      return (
        <div className="rounded-lg overflow-hidden border bg-gray-50 flex justify-center w-full">
          <iframe
            src={`https://www.instagram.com/p/${match[1]}/embed/captioned/`}
            className="w-full max-w-[400px] h-[500px]"
            frameBorder="0"
            scrolling="no"
            allow="transparency"
          ></iframe>
        </div>
      );
    }
  }
  if (url.includes("tiktok.com")) {
    const videoIdMatch = url.match(/video\/(\d+)/);
    if (videoIdMatch?.[1]) {
      return (
        <div className="rounded-lg overflow-hidden border bg-black flex justify-center w-full">
          <iframe
            src={`https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`}
            className="w-full max-w-[325px] h-[575px]"
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

const DrivePreview = ({ fileId }: { fileId?: string | null }) => {
  if (!fileId) return null;
  const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden aspect-9/16 relative shadow-2xl">
      <iframe
        src={previewUrl}
        className="w-full h-full"
        allow="autoplay"
        style={{ border: 0 }}
      ></iframe>
    </div>
  );
};

export default async function PublicSharePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  // Await params and searchParams
  const { id } = await params;
  const { c: companyId } = await searchParams;

  if (!companyId) {
    return (
      <div className="p-8 text-center text-red-500">
        Enlace incompleto (Falta ID de empresa)
      </div>
    );
  }

  const content = await getPublicContent(companyId, id);

  if (!content) {
    return notFound();
  }

  // Phase Logic Determination (Moved outside render for cleaner logic, but inside component to access content)
  const isContentPhase = !!content.drive_file_id;
  const isIdeaApproved = [
    "filming",
    "editing",
    "review",
    "approved",
    "posted",
  ].includes(content.status);
  const isContentApproved = ["approved", "posted"].includes(content.status);

  const showApproveButton = isContentPhase
    ? !isContentApproved
    : !isIdeaApproved;
  const successMessage = isContentPhase
    ? "¡Creativo Aprobado!"
    : "¡Idea Aprobada!";

  // Actions
  async function handleApprove() {
    "use server";
    if (!companyId) return;

    // Recalculate phase logic inside action for safety (or pass as hidden field, but recalcu is safer)
    // We need to fetch content again or trust the client state?
    // Trusted internal logic:
    // If drive_file_id exists -> Approved. Else -> Filming.
    // Content object is not available here unless we fetch it again.
    // For efficiency, we can pass a hidden input, or just fetch lightweight.
    // Let's rely on the fact that if this action is called, we want to advance the status.

    // Actually, we can just fetch the current content to know what to do.
    const currentContent = await getPublicContent(companyId!, id);
    if (!currentContent) return;

    const isNowContentPhase = !!currentContent.drive_file_id;
    const targetStatus = isNowContentPhase ? "approved" : "filming";
    const feedbackMsg = isNowContentPhase
      ? "Creative Approved"
      : "Idea Approved";

    await approveContent(companyId!, id, feedbackMsg, targetStatus);
    revalidatePath(`/share/${id}`);
    redirect(`/share/${id}?c=${companyId}&success=approved`);
  }

  async function handleReject(formData: FormData) {
    "use server";
    const feedback = formData.get("feedback") as string;
    if (!companyId) return;
    await rejectContent(companyId, id, feedback);
    revalidatePath(`/share/${id}`);
    redirect(`/share/${id}?c=${companyId}&success=rejected`);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: MEDIA */}
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 sticky top-8">
            <h3 className="font-semibold text-slate-500 mb-4 flex items-center gap-2">
              <Play className="w-4 h-4" /> Previsualización
            </h3>
            {content.drive_file_id ? (
              <DrivePreview fileId={content.drive_file_id} />
            ) : content.referenceLink ? (
              <SocialMediaEmbed url={content.referenceLink} />
            ) : (
              <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                Sin contenido visual
              </div>
            )}

            {content.drive_link && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" asChild>
                  <a href={content.drive_link} target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4 mr-2" /> Descargar Original
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: DETAILS & ACTIONS */}
        <div className="flex flex-col gap-6 order-1 lg:order-2">
          {/* Header Card */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {(
                        content.platforms ||
                        (content.platform ? [content.platform] : [])
                      ).map((p: string) => (
                        <Badge key={p} variant="outline" className="uppercase">
                          {p}
                        </Badge>
                      ))}
                    </div>
                    <Badge
                      className={
                        content.status === "approved"
                          ? "bg-green-500 hover:bg-green-600"
                          : content.status === "rejected"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-blue-500 hover:bg-blue-600"
                      }
                    >
                      {content.status === "approved"
                        ? "Aprobado"
                        : content.status === "rejected"
                          ? "Cambios Solicitados"
                          : "En Revisión"}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{content.title}</CardTitle>
                  <CardDescription>
                    Fecha Publicación:{" "}
                    {content.scheduledDate
                      ? new Date(content.scheduledDate).toLocaleDateString()
                      : "Sin fecha"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content Details */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4" /> Copy / Caption
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-slate-600">
              <p className="whitespace-pre-wrap">
                {content.caption || "Sin caption..."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Guion / Idea
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">
                {content.script || "Sin guion..."}
              </p>
            </CardContent>
          </Card>

          {/* ACTIONS */}
          {content.status !== "posted" && (
            <Card className="border-blue-100 bg-blue-50/30 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">
                  {isContentPhase ? "Aprobar Creativo" : "Aprobar Idea"}
                </CardTitle>
                <CardDescription>
                  {isContentPhase
                    ? "Revisa el video/imagen final."
                    : "Revisa el guion y concepto."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {!showApproveButton ? (
                  <div className="p-4 bg-green-100 text-green-700 rounded-lg text-center font-medium">
                    {successMessage}
                  </div>
                ) : (
                  <>
                    <form action={handleApprove} className="w-full">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg h-12 text-lg">
                        <Check className="mr-2 w-5 h-5" />
                        {isContentPhase ? "Aprobar Creativo" : "Aprobar Idea"}
                      </Button>
                    </form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-blue-200"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#f0f9ff00] px-2 text-blue-400">
                          O solicitar cambios
                        </span>
                      </div>
                    </div>

                    <form action={handleReject} className="space-y-3">
                      <Textarea
                        name="feedback"
                        placeholder="Describe los cambios necesarios..."
                        className="bg-white border-blue-200"
                        required
                      />
                      <Button
                        variant="destructive"
                        className="w-full bg-white text-red-500 border border-red-200 hover:bg-red-50"
                      >
                        <X className="mr-2 w-4 h-4" /> Solicitar Cambios
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
