// components/ideas-checkboxes.tsx
"use client";

import * as React from "react";
import CheckboxGroup from "@/components/checkbox-group-1"

export function IdeasCheckboxes() {
  return (
    <div className="mt-4  ">
      {/* Se o seu checkbox-group-1 já renderiza título/descrição,
         pode ajustar os textos abaixo ou até removê-los */}
      <CheckboxGroup >
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 accent-indigo-600" defaultChecked />
          <span>Email notifications</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 accent-indigo-600" />
          <span>Product updates</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 accent-indigo-600" />
          <span>Weekly summary</span>
        </label>
      </CheckboxGroup>
    </div>
  );
}
