// src/components/api-tester/index.tsx

"use client";

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MethodSelector } from './MethodSelector';
import { HeadersEditor } from './HeadersEditor';
import { ResponseViewer } from './ResponseViewer';
import { RequestHistory } from './RequestHistory';
import { SavedTemplates } from './SavedTemplates';
import { EnvironmentSelector } from './EnvironmentSelector';
import { EnvironmentModal } from './EnvironmentModal';
import type { 
  Header, 
  APIResponse, 
  Environment, 
  RequestTemplate, 
  RequestHistoryItem 
} from '@/types/api-tester';
import { RequestBody } from './RequestBody';

const DEFAULT_ENVIRONMENTS: Environment[] = [
  {
    id: 'default',
    name: 'Default',
    variables: [
      { key: 'BASE_URL', value: 'http://localhost:3001' }
    ]
  }
];

export const APITester = () => {
  // Basic request state
  const [method, setMethod] = useState<string>('GET');
  const [url, setUrl] = useState<string>('');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState<string>('');
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Environment state
  const [environments, setEnvironments] = useLocalStorage<Environment[]>(
    'api_environments',
    DEFAULT_ENVIRONMENTS
  );
  const [selectedEnvId, setSelectedEnvId] = useState<string>('default');
  const [showEnvModal, setShowEnvModal] = useState(false);

  // Templates and History state
  const [templates, setTemplates] = useLocalStorage<RequestTemplate[]>('api_templates', []);
  const [history, setHistory] = useLocalStorage<RequestHistoryItem[]>('api_history', []);

  // View state
  const [rightPanel, setRightPanel] = useState<'history' | 'templates'>('history');

  const replaceEnvironmentVariables = (input: string): string => {
    const env = environments.find(e => e.id === selectedEnvId);
    if (!env) return input;

    let result = input;
    env.variables.forEach(({ key, value }) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const startTime = performance.now();
      const headerObj: Record<string, string> = {};
      headers.forEach(({ key, value }) => {
        if (key && value) {
          headerObj[replaceEnvironmentVariables(key)] = replaceEnvironmentVariables(value);
        }
      });

      const processedUrl = replaceEnvironmentVariables(url);
      const options: RequestInit = {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...headerObj,
        },
        mode: 'cors',
        credentials: 'include',
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        try {
          const processedBody = replaceEnvironmentVariables(body);
          const parsedBody = JSON.parse(processedBody);
          options.body = JSON.stringify(parsedBody);
        } catch (e) {
          throw new Error('Invalid JSON in request body');
        }
      }

      const res = await fetch(processedUrl, options);
      const contentType = res.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      const responseObj: APIResponse = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries([...res.headers]),
        data,
        duration
      };

      setResponse(responseObj);
      addToHistory(responseObj);
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (responseObj: APIResponse) => {
    const historyItem: RequestHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      method,
      url,
      headers,
      body,
      response: responseObj,
      duration: responseObj.duration
    };
    setHistory([historyItem, ...history.slice(0, 49)]);
  };

  const loadFromHistory = (item: RequestHistoryItem) => {
    setMethod(item.method);
    setUrl(item.url);
    setHeaders(item.headers);
    setBody(item.body || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveTemplate = (name: string) => {
    const template: RequestTemplate = {
      id: Date.now().toString(),
      name,
      method,
      url,
      headers,
      body
    };
    setTemplates([template, ...templates]);
  };

  const loadTemplate = (template: RequestTemplate) => {
    setMethod(template.method);
    setUrl(template.url);
    setHeaders(template.headers);
    setBody(template.body || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Panel */}
          <div className="flex-1 space-y-6">
            {/* Environment Bar */}
            <div className="flex items-center justify-between">
              <EnvironmentSelector
                environments={environments}
                selectedEnvId={selectedEnvId}
                onSelect={setSelectedEnvId}
                onManageClick={() => setShowEnvModal(true)}
              />
            </div>

            {/* Request Builder */}
            <div className="space-y-4">
              {/* URL Bar */}
              <div className="flex space-x-2">
                <MethodSelector value={method} onChange={setMethod} />
                <Input
                  placeholder="Enter request URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSubmit}
                  disabled={!url || loading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>

              {/* Headers */}
              <HeadersEditor
                headers={headers}
                onChange={setHeaders}
              />

              {/* Request Body */}
              {['POST', 'PUT', 'PATCH'].includes(method) && (
                <RequestBody
                  value={body}
                  onChange={setBody}
                />
              )}

              {/* Response/Error */}
              {error ? (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
                  {error}
                </div>
              ) : response && (
                <ResponseViewer response={response} />
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-80 xl:w-96 space-y-4">
            <div className="flex space-x-2">
              <Button
                variant={rightPanel === 'history' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setRightPanel('history')}
              >
                History
              </Button>
              <Button
                variant={rightPanel === 'templates' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setRightPanel('templates')}
              >
                Templates
              </Button>
            </div>

            {rightPanel === 'history' ? (
              <RequestHistory
                history={history}
                onSelect={loadFromHistory}
                onClear={() => setHistory([])}
              />
            ) : (
              <SavedTemplates
                templates={templates}
                onSelect={loadTemplate}
                onDelete={deleteTemplate}
                onEdit={loadTemplate}
                currentRequest={{
                  method,
                  url,
                  headers,
                  body
                }}
                onSaveCurrent={saveTemplate}
              />
            )}
          </div>
        </div>
      </div>

      <EnvironmentModal
        open={showEnvModal}
        onOpenChange={setShowEnvModal}
        environments={environments}
        onEnvironmentsChange={setEnvironments}
      />
    </div>
  );
};