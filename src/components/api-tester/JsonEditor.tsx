// src/components/api-tester/JsonEditor.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Check } from 'lucide-react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const JsonEditor = ({ value, onChange, placeholder }: JsonEditorProps) => {
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      if (value) {
        JSON.parse(value);
        setError(null);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }, [value]);

  const formatJson = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(value), null, 2);
      onChange(formatted);
    } catch (e) {
      // If can't parse, leave as is
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={8}
          className={`w-full rounded-md font-mono text-sm p-4 border-2 ${
            error ? 'border-red-300' : 'border-gray-200'
          }`}
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={formatJson}
            className="text-xs"
          >
            Format
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};