"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { GeneralForm } from "@/components/domain/settings/general-form";
import { StrategyForm } from "@/components/domain/settings/strategy-form";
import { TeamForm } from "@/components/domain/settings/team-form";
import { MagnetForm } from "@/components/domain/settings/magnet-form";
import { ProductsForm } from "@/components/domain/settings/products-form";
import { IntegrationsForm } from "@/components/domain/settings/integrations-form";

export default function SettingsPage() {
  const { currentCompany, loading } = useAuth();

  if (loading) return <div className="p-8">Loading...</div>;
  if (!currentCompany)
    return <div className="p-8">Selecciona una empresa primero.</div>;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          Configuración de la Empresa
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona la identidad visual, estrategia de contenido, equipo y
          recursos de
          <span className="font-semibold text-primary">
            {" "}
            {currentCompany.name}
          </span>
          .
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-8 mb-8">
          <TabsTrigger
            value="general"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary py-3 px-1 text-base"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="strategy"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary py-3 px-1 text-base"
          >
            Estrategia
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary py-3 px-1 text-base"
          >
            Conexiones
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary py-3 px-1 text-base"
          >
            Equipo
          </TabsTrigger>
          <TabsTrigger
            value="magnets"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary py-3 px-1 text-base"
          >
            Lead Magnets
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary py-3 px-1 text-base"
          >
            Productos
          </TabsTrigger>
        </TabsList>

        <div className="space-y-6">
          <TabsContent value="general">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Identidad & Redes</CardTitle>
                <CardDescription>
                  Información básica visible en el dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <GeneralForm company={currentCompany} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategy">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Estrategia de Contenido (70/20/10)</CardTitle>
                <CardDescription>
                  Define cómo se distribuye tu contenido y qué temas abordas en
                  cada pilar.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <StrategyForm company={currentCompany} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Integraciones Sociales</CardTitle>
                <CardDescription>
                  Vincula tus cuentas para habilitar la publicación automática.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <IntegrationsForm company={currentCompany} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Equipo Comercial</CardTitle>
                <CardDescription>
                  Gestiona los miembros que aparecen en el sidebar del
                  dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <TeamForm company={currentCompany} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="magnets">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Lead Magnets & Recursos</CardTitle>
                <CardDescription>
                  Recursos descargables vinculados a palabras clave de ManyChat.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <MagnetForm company={currentCompany} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Catálogo de Ofertas</CardTitle>
                <CardDescription>
                  Tus productos, servicios y ofertas principales para que la AI
                  pueda venderlos.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <ProductsForm company={currentCompany} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
