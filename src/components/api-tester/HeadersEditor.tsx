// src/components/api-tester/HeadersEditor.tsx

"use client";

import React from 'react';
import { Plus, Minus, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Header } from '@/types/api-tester';

interface HeadersEditorProps {
  headers: Header[];
  onChange: (headers: Header[]) => void;
}

const COMMON_HEADERS = {
  'Authorization': 'Bearer ',
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Api-Key': '',
};

export const HeadersEditor = ({ headers, onChange }: HeadersEditorProps) => {
  const handleHeaderChange = (index: number, field: keyof Header, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    onChange(newHeaders);
  };

  const addHeader = () => {
    onChange([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    onChange(headers.filter((_, i) => i !== index));
  };

  const addCommonHeader = (key: string, value: string) => {
    onChange([...headers, { key, value }]);
  };

  return (
    <Accordion type="single" collapsible defaultValue="headers" className="w-full">
      <AccordionItem value="headers">
        <AccordionTrigger className="text-lg font-semibold">
          Headers ({headers.filter(h => h.key && h.value).length})
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {/* Quick add common headers */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(COMMON_HEADERS).map(([key, value]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => addCommonHeader(key, value)}
                  className="text-xs"
                >
                  + {key}
                </Button>
              ))}
            </div>

            {/* Headers list */}
            <div className="space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex space-x-2 items-center">
                  <Input
                    placeholder="Header name"
                    value={header.key}
                    onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${header.key}: ${header.value}`);
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHeader(index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={addHeader} variant="outline" size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Header
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};