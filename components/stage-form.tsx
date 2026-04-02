"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[]; // Para select
  defaultValue?: string;
}

interface StageFormProps {
  title: string;
  description: string;
  fields: FormField[];
  onSubmit: (values: Record<string, string>) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export function StageForm({
  title,
  description,
  fields,
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Gerar Documento",
}: StageFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach((field) => {
      initial[field.name] = field.defaultValue || "";
    });
    return initial;
  });

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obrigatórios
    const missingFields = fields
      .filter((f) => f.required && !values[f.name]?.trim())
      .map((f) => f.label);

    if (missingFields.length > 0) {
      alert(`Campos obrigatórios faltando: ${missingFields.join(", ")}`);
      return;
    }

    onSubmit(values);
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#8c7dff]">{title}</h2>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.type === "text" && (
              <Input
                id={field.name}
                name={field.name}
                type="text"
                placeholder={field.placeholder}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
              />
            )}

            {field.type === "textarea" && (
              <Textarea
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                rows={4}
                className="resize-none"
              />
            )}

            {field.type === "select" && field.options && (
              <select
                id={field.name}
                name={field.name}
                value={values[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className="w-full border border-input bg-background px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#8c7dff]"
              >
                <option value="">Selecione...</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gap-2 bg-[#8c7dff] hover:bg-[#7a6de6]"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {submitButtonText}
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
