"use client";

import { useState } from "react";
import { Company, TeamMember } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Trash2, User } from "lucide-react";
import { updateCompany } from "@/actions/company-actions"; // Need to create/update this action
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

interface TeamFormProps {
  company: Company;
}

export function TeamForm({ company }: TeamFormProps) {
  const { refreshCompanies } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>(company.team || []);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const { toast } = useToast();

  const handleAdd = () => {
    if (!newName || !newRole) return;
    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name: newName,
      role: newRole,
      email: newEmail,
      phone: newPhone,
    };
    setTeam([...team, newMember]);
    setNewName("");
    setNewRole("");
    setNewEmail("");
    setNewPhone("");
  };

  const handleRemove = (id: string) => {
    setTeam(team.filter((m) => m.id !== id));
  };

  const handleSave = async () => {
    try {
      await updateCompany(company.id, { team });
      await refreshCompanies();
      toast({
        title: "Equipo actualizado",
        description: "Los cambios se han guardado.",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          <Label>Nombre</Label>
          <Input
            placeholder="Ej. Carlos Perez"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Rol</Label>
          <Input
            placeholder="Ej. Agente Inmobiliario"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Email (Para notificaciones)</Label>
          <Input
            placeholder="carlos@empresa.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Teléfono / WhatsApp</Label>
          <Input
            placeholder="+569..."
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button onClick={handleAdd} disabled={!newName || !newRole}>
            <Plus className="mr-2 h-4 w-4" /> Añadir Miembro
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => (
          <Card key={member.id} className="relative group">
            <CardContent className="p-4 flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-xs text-muted-foreground uppercase">
                  {member.role}
                </p>
                {member.email && (
                  <p className="text-xs text-gray-500 mt-1">
                    📧 {member.email}
                  </p>
                )}
                {member.phone && (
                  <p className="text-xs text-gray-500">📱 {member.phone}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleRemove(member.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {team.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      )}
    </div>
  );
}
