// src/components/api-tester/MethodSelector.tsx

"use client";

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
type HttpMethod = typeof HTTP_METHODS[number];

interface MethodSelectorProps {
  value: HttpMethod;
  onChange: (value: HttpMethod) => void;
}

const methodColors: Record<HttpMethod, string> = {
  GET: 'text-green-600',
  POST: 'text-blue-600',
  PUT: 'text-yellow-600',
  PATCH: 'text-orange-600',
  DELETE: 'text-red-600',
};

export const MethodSelector = ({ value, onChange }: MethodSelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange as any}>
      <SelectTrigger className="w-28">
        <SelectValue>
          <span className={methodColors[value as HttpMethod]}>{value}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {HTTP_METHODS.map((method) => (
          <SelectItem 
            key={method} 
            value={method}
            className={methodColors[method]}
          >
            {method}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export type { HttpMethod };