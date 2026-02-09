"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, ArrowRight } from "lucide-react";

import { AddClientDialog } from "@/components/domain/clients/add-client-dialog";

export default function ClientsPage() {
  const { companies, selectCompany, loading } = useAuth();
  const router = useRouter();

  const handleSelect = (id: string) => {
    selectCompany(id);
    router.push("/home");
    // router.refresh(); // Not strictly needed if state is global, but harmless
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // EMPTY STATE / NEW USER LOBBY
  if (companies.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="max-w-md space-y-8">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome to SocialFlow
            </h2>
            <p className="mt-2 text-muted-foreground">
              You don&apos;t have any clients or workspaces yet. Create your
              first one to get started.
            </p>
          </div>
          <div className="flex justify-center">
            <AddClientDialog />
          </div>
        </div>
      </div>
    );
  }

  // SELECTION GRID LOBBY
  return (
    <div className="container max-w-5xl mx-auto py-12 px-4 space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Select Workspace
          </h1>
          <p className="text-muted-foreground">
            Choose a client or company to manage.
          </p>
        </div>
        <AddClientDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card
            key={company.id}
            className="group cursor-pointer hover:shadow-lg transition-all border-dashed hover:border-solid hover:border-primary/50 relative overflow-hidden"
            onClick={() => handleSelect(company.id)}
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">{company.name}</CardTitle>
              <CardDescription className="line-clamp-1">
                Folder ID: {company.drive_folder_id}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Enter Workspace
                <ArrowRight className="ml-1 h-4 w-4" />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Created {new Date(company.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Quick Add Card */}
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 hover:bg-muted/50 transition-colors">
          <p className="font-medium text-muted-foreground mb-4">New Client?</p>
          <AddClientDialog />
        </div>
      </div>
    </div>
  );
}
