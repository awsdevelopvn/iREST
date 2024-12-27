// src/components/api-tester/RequestBody.tsx

"use client";

import React from 'react';
import { FileJson } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { JsonEditor } from './JsonEditor';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RequestBodyProps {
  value: string;
  onChange: (value: string) => void;
}

const SAMPLE_BODIES = {
  'Simple JSON': {
    name: "John Doe",
    email: "john@example.com",
    age: 30
  },
  'Array Example': [
    { id: 1, value: "first" },
    { id: 2, value: "second" }
  ],
  'Complex Object': {
    user: {
      id: 1,
      name: "John Doe",
      contacts: {
        email: "john@example.com",
        phone: "+1234567890"
      }
    },
    preferences: {
      theme: "dark",
      notifications: true
    },
    items: [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" }
    ]
  },
  'Login Request': {
    email: "user@example.com",
    password: "your_password",
    rememberMe: true
  },
  'Create User': {
    username: "newuser",
    email: "newuser@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "user",
    settings: {
      language: "en",
      timezone: "UTC",
      notifications: {
        email: true,
        push: false
      }
    }
  }
};

export const RequestBody = ({ value, onChange }: RequestBodyProps) => {
  const loadSample = (sample: any) => {
    onChange(JSON.stringify(sample, null, 2));
  };

  return (
    <Accordion type="single" collapsible defaultValue="body">
      <AccordionItem value="body">
        <AccordionTrigger className="text-lg font-semibold">
          Request Body
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {/* Sample templates */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Sample Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SAMPLE_BODIES).map(([name, sample]) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    onClick={() => loadSample(sample)}
                    className="text-xs"
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    {name}
                  </Button>
                ))}
              </div>
            </div>

            {/* JSON Editor */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                JSON Body
              </label>
              <JsonEditor
                value={value}
                onChange={onChange}
                placeholder="Enter request body as JSON"
                height="240px"
              />
            </div>

            {/* Quick Tips */}
            {!value && (
              <div className="text-sm text-gray-500 space-y-1">
                <p>💡 Quick tips:</p>
                <ul className="list-disc list-inside pl-2">
                  <li>Use the sample templates above to get started quickly</li>
                  <li>The editor will validate your JSON as you type</li>
                  <li>Click "Format" to prettify your JSON</li>
                  <li>All JSON must be valid before sending the request</li>
                </ul>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};