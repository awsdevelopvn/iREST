// src/components/api-tester/ResponseViewer.tsx

"use client";

import React from 'react';
import { Clock, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import type { APIResponse } from '@/types/api-tester';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ResponseViewerProps {
  response: APIResponse;
}

const statusColors: Record<string, string> = {
  '2': 'text-green-600',
  '3': 'text-blue-600',
  '4': 'text-yellow-600',
  '5': 'text-red-600',
};

const getStatusColor = (status: number) => {
  const firstDigit = status.toString()[0];
  return statusColors[firstDigit] || 'text-gray-600';
};

const formatValue = (value: any): string => {
  try {
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  } catch (e) {
    return String(value);
  }
};

export const ResponseViewer = ({ response }: ResponseViewerProps) => {
  const [copiedTab, setCopiedTab] = React.useState<string | null>(null);

  const copyContent = async (content: any, tab: string) => {
    await navigator.clipboard.writeText(
      typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    );
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Status and Time */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">Status:</span>
          <span className={getStatusColor(response.status)}>
            {response.status} {response.statusText}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{response.duration.toFixed(0)}ms</span>
        </div>
      </div>

      {/* Response Content */}
      <Tabs defaultValue="body" className="w-full">
        <TabsList>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="relative">
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">
            {formatValue(response.data)}
          </pre>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => copyContent(response.data, 'body')}
          >
            {copiedTab === 'body' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </TabsContent>

        <TabsContent value="headers">
          <div className="bg-gray-50 p-4 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left font-medium text-gray-500">Header</th>
                  <th className="text-left font-medium text-gray-500">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(response.headers).map(([key, value]) => (
                  <tr key={key} className="border-t border-gray-200">
                    <td className="py-2 font-mono">{key}</td>
                    <td className="py-2 font-mono">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};