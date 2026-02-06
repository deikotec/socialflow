"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamMember } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface TeamSidebarProps {
  team: TeamMember[];
  companyName: string;
}

export function TeamSidebar({ team, companyName }: TeamSidebarProps) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Equipo Comercial */}
      <div className="space-y-3">
        <h3 className="font-serif font-semibold text-lg text-foreground">
          EQUIPO COMERCIAL
        </h3>
        <div className="flex flex-wrap gap-4">
          {team.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center gap-1 group"
            >
              <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-primary transition-all cursor-pointer">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground font-medium">
                {member.name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Separator / Branding Area */}
      <div className="pt-8 flex flex-col items-center text-center space-y-2">
        <div className="h-24 w-24 rounded-full bg-orange-100 flex items-center justify-center mb-2 border-4 border-white shadow-sm ring-1 ring-gray-100">
          <Building2 className="h-10 w-10 text-orange-600" />
        </div>
        <div>
          <h4 className="font-bold text-lg">{companyName}</h4>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Inmobiliaria e Inversiones
          </p>
        </div>
        <a href="#" className="text-sm text-blue-600 hover:underline">
          linktr.ee/socialflow
        </a>
      </div>
    </div>
  );
}
