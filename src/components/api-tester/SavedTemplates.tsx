// src/components/api-tester/SavedTemplates.tsx
"use client";

import React, { useState } from 'react';
import { Search, Edit2, Trash2, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RequestTemplate } from '@/types/api-tester';

interface SavedTemplatesProps {
  templates: RequestTemplate[];
  onSelect: (template: RequestTemplate) => void;
  onDelete: (templateId: string) => void;
  onEdit: (template: RequestTemplate) => void;
  currentRequest: {
    method: string;
    url: string;
    headers: { key: string; value: string; }[];
    body?: string;
  };
  onSaveCurrent: (name: string) => void;
}

export const SavedTemplates = ({
  templates,
  onSelect,
  onDelete,
  onEdit,
  currentRequest,
  onSaveCurrent,
}: SavedTemplatesProps) => {
  const [search, setSearch] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(search.toLowerCase()) ||
    template.url.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveTemplate = () => {
    onSaveCurrent(newTemplateName);
    setNewTemplateName('');
    setShowSaveDialog(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Templates</h3>
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Current
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Template name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
              <div className="text-sm text-gray-500">
                <div>Method: {currentRequest.method}</div>
                <div className="truncate">URL: {currentRequest.url}</div>
                <div>Headers: {currentRequest.headers.length}</div>
                {currentRequest.body && <div>Has request body</div>}
              </div>
              <Button 
                onClick={handleSaveTemplate}
                disabled={!newTemplateName.trim()}
                className="w-full"
              >
                Save Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredTemplates.map((template) => (
            <div
            key={template.id}
            className="p-3 rounded-lg border hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div 
                className="space-y-1 flex-1 cursor-pointer"
                onClick={() => onSelect(template)}
              >
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${getMethodColor(template.method)}`}>
                    {template.method}
                  </span>
                  <span className="text-sm font-medium">{template.name}</span>
                </div>
                <div className="text-sm text-gray-500 truncate">{template.url}</div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  {template.headers.length > 0 && (
                    <span>{template.headers.length} headers</span>
                  )}
                  {template.body && <span>Has body</span>}
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(template);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(template.id);
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No templates found
          </div>
        )}
      </div>
    </div>
  </div>
);
};

// Utility function for method colors
const getMethodColor = (method: string): string => {
switch (method) {
  case 'GET': return 'text-green-600';
  case 'POST': return 'text-blue-600';
  case 'PUT': return 'text-yellow-600';
  case 'PATCH': return 'text-orange-600';
  case 'DELETE': return 'text-red-600';
  default: return 'text-gray-600';
}
};