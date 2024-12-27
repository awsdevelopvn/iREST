// src/components/api-tester/EnvironmentSelector.tsx

"use client";

import React from 'react';
import { Settings } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Environment } from '@/types/api-tester';

interface EnvironmentSelectorProps {
  environments: Environment[];
  selectedEnvId: string;
  onSelect: (envId: string) => void;
  onManageClick: () => void;
}

export const EnvironmentSelector = ({
  environments,
  selectedEnvId,
  onSelect,
  onManageClick,
}: EnvironmentSelectorProps) => {
  const selectedEnv = environments.find(env => env.id === selectedEnvId);
  
  return (
    <div className="flex items-center space-x-2">
      <Select value={selectedEnvId} onValueChange={onSelect}>
        <SelectTrigger className="w-[200px]">
          <SelectValue>
            {selectedEnv?.name || 'Select Environment'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {environments.map((env) => (
            <SelectItem key={env.id} value={env.id}>
              <div className="flex items-center justify-between w-full">
                <span>{env.name}</span>
                <span className="text-xs text-gray-500">
                  {env.variables.length} vars
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onManageClick}
              className="h-9 w-9"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Manage Environments</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {selectedEnv && (
        <div className="text-sm text-gray-500 hidden md:block">
          Available variables: {selectedEnv.variables.map(v => `{{${v.key}}}`).join(', ')}
        </div>
      )}
    </div>
  );
};