"use client";

import { useState } from "react";
import { Company, ProductService } from "@/types";
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
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, ShoppingBag } from "lucide-react";
import { updateCompany } from "@/actions/company-actions";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";

interface ProductsFormProps {
  company: Company;
}

export function ProductsForm({ company }: ProductsFormProps) {
  const { refreshCompanies } = useAuth();
  const [products, setProducts] = useState<ProductService[]>(
    company.products || [],
  );

  // New Product State
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<ProductService["type"]>("service");

  const { toast } = useToast();

  const handleAdd = () => {
    if (!newName || !newPrice) return;

    const newProduct: ProductService = {
      id: crypto.randomUUID(),
      name: newName,
      price: newPrice,
      description: newDesc,
      type: newType,
    };

    setProducts([...products, newProduct]);

    // Reset form
    setNewName("");
    setNewPrice("");
    setNewDesc("");
  };

  const handleRemove = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    try {
      await updateCompany(company.id, { products });
      await refreshCompanies();
      toast({
        title: "Productos actualizados",
        description: "Lista de productos y servicios guardada.",
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
    <div className="space-y-8">
      {/* Add New Product Form */}
      <div className="p-4 bg-gray-50 rounded-lg space-y-4 border">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500">
          Añadir Nuevo Producto / Servicio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-2">
            <Label>Nombre</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Consultoría 1h"
            />
          </div>
          <div className="md:col-span-1 space-y-2">
            <Label>Precio / Valor</Label>
            <Input
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Ej. 100€ / Gratis"
            />
          </div>
          <div className="md:col-span-1 space-y-2">
            <Label>Tipo</Label>
            <Select value={newType} onValueChange={(v) => setNewType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">Servicio</SelectItem>
                <SelectItem value="product">Producto</SelectItem>
                <SelectItem value="info">Infoproducto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1 flex items-end">
            <Button onClick={handleAdd} disabled={!newName} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Añadir
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Descripción Breve</Label>
          <Input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Breve descripción de lo que incluye..."
          />
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="relative group hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4 flex gap-4">
              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold truncate">{product.name}</h4>
                  <span className="text-sm font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                    {product.price}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground uppercase mt-1 mb-2">
                  {product.type}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleRemove(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length > 0 && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} size="lg">
            Guardar Catálogo
          </Button>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No hay productos o servicios añadidos aún.</p>
        </div>
      )}
    </div>
  );
}
