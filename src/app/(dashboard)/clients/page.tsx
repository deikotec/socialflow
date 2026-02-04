"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Client {
  id: string;
  name: string;
  email: string;
  drive_folder_id: string;
  createdAt: Date;
}

import { AddClientDialog } from "@/components/domain/clients/add-client-dialog";

export default function ClientsPage() {
  /* 
    Phase 3 Update: 
    'companies' now represents the list of managed entities (previously 'clients').
    We use the data directly from the context.
  */
  const { companies, loading } = useAuth();
  // Map Company to Client interface for display compatibility
  const clients: Client[] = companies.map((c) => ({
    id: c.id,
    name: c.name,
    email: "", // Company interface doesn't have email yet, placeholder
    drive_folder_id: c.drive_folder_id,
    createdAt: c.createdAt,
  }));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your agency&apos;s clients.
          </p>
        </div>
        <AddClientDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>
            A list of all clients currently managed by your agency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Drive Folder</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No clients found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.drive_folder_id}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
