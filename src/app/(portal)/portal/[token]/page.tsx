import { notFound } from "next/navigation";
import {
  validatePortalToken,
  getPortalContent,
} from "@/actions/portal-actions";
import { PortalClientView } from "@/components/domain/portal/portal-client-view";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function PortalPage({ params }: PageProps) {
  const { token } = await params;
  if (!token) notFound();

  // 1. Validate Token & Get Company
  const companyAction = await validatePortalToken(token);
  // If company not found or validation fails, return 404
  if (!companyAction) {
    notFound();
  }
  const company = companyAction;

  // 2. Fetch Content
  const content = await getPortalContent(company.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {company.name}
        </h1>
        <p className="text-muted-foreground">
          Please review your upcoming social media content.
        </p>
      </div>

      <PortalClientView initialContent={content} companyId={company.id} />
    </div>
  );
}
