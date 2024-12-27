"use client";

import React, { useState } from 'react';
import { Plus, Minus, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Environment } from '@/types/api-tester';

interface EnvironmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environments: Environment[];
  onEnvironmentsChange: (environments: Environment[]) => void;
}

export const EnvironmentModal = ({
  open,
  onOpenChange,
  environments,
  onEnvironmentsChange,
}: EnvironmentModalProps) => {
  const [activeEnv, setActiveEnv] = useState<string>(environments[0]?.id || '');
  const [copied, setCopied] = useState<string | null>(null);

  const addEnvironment = () => {
    const newEnv: Environment = {
      id: Date.now().toString(),
      name: 'New Environment',
      variables: []
    };
    onEnvironmentsChange([...environments, newEnv]);
    setActiveEnv(newEnv.id);
  };

  const updateEnvironment = (id: string, updates: Partial<Environment>) => {
    onEnvironmentsChange(
      environments.map(env =>
        env.id === id ? { ...env, ...updates } : env
      )
    );
  };

  const deleteEnvironment = (id: string) => {
    onEnvironmentsChange(environments.filter(env => env.id !== id));
    if (activeEnv === id) {
      setActiveEnv(environments[0]?.id || '');
    }
  };

  const addVariable = (envId: string) => {
    const env = environments.find(e => e.id === envId)!;
    updateEnvironment(envId, {
      variables: [...env.variables, { key: '', value: '' }]
    });
  };

  const updateVariable = (envId: string, index: number, key: string, value: string) => {
    const env = environments.find(e => e.id === envId)!;
    const newVars = [...env.variables];
    newVars[index] = { key, value };
    updateEnvironment(envId, { variables: newVars });
  };

  const removeVariable = (envId: string, index: number) => {
    const env = environments.find(e => e.id === envId)!;
    const newVars = env.variables.filter((_, i) => i !== index);
    updateEnvironment(envId, { variables: newVars });
  };

  const copyEnvironment = async (env: Environment) => {
    const text = JSON.stringify({
      name: env.name,
      variables: env.variables
    }, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(env.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] z-[101] !p-0 !max-w-3xl bg-white dark:bg-zinc-900 shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Environment Manager</DialogTitle>
        </DialogHeader>

        <div className="flex h-[32rem] bg-white dark:bg-zinc-900">
          {/* Environment List */}
          <div className="w-1/3 border-r p-4 bg-gray-50 dark:bg-zinc-800 space-y-2 overflow-y-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={addEnvironment}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Environment
            </Button>
            <div className="space-y-1">
              {environments.map((env) => (
                <div
                  key={env.id}
                  className={`p-2 rounded-md cursor-pointer flex justify-between items-center transition-colors ${
                    activeEnv === env.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setActiveEnv(env.id)}
                >
                  <span className="truncate">{env.name}</span>
                  <span className="text-xs opacity-70">{env.variables.length} vars</span>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeEnv && environments.map((env) => (
              env.id === activeEnv && (
                <div key={env.id} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Input
                      value={env.name}
                      onChange={(e) => updateEnvironment(env.id, { name: e.target.value })}
                      className="text-lg font-semibold max-w-sm"
                    />
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyEnvironment(env)}
                      >
                        {copied === env.id ? (
                          <Check className="w-4 h-4 mr-2" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEnvironment(env.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Environment Variables</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addVariable(env.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Variable
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {env.variables.map((variable, index) => (
                        <div key={index} className="flex space-x-2 items-center">
                          <Input
                            placeholder="Variable name"
                            value={variable.key}
                            onChange={(e) => updateVariable(env.id, index, e.target.value, variable.value)}
                            className="font-mono"
                          />
                          <Input
                            placeholder="Value"
                            value={variable.value}
                            onChange={(e) => updateVariable(env.id, index, variable.key, e.target.value)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariable(env.id, index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {env.variables.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No variables added yet
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};