// src/components/APITester.tsx

"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Minus, Send, Save, Clock, Settings, History } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Header, APIResponse, RequestTemplate, Environment, RequestHistoryItem } from '@/types/api-tester';

const APITester = () => {
  // Basic request state
  const [method, setMethod] = useState<string>('GET');
  const [url, setUrl] = useState<string>('');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState<string>('');
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Enhanced features state
  const [environments, setEnvironments] = useLocalStorage<Environment[]>('api_environments', [
    {
      id: '1',
      name: 'Development',
      variables: [{ key: 'BASE_URL', value: 'http://localhost:3001' }]
    }
  ]);

  const [selectedEnv, setSelectedEnv] = useState<string>('1');
  const [templates, setTemplates] = useLocalStorage<RequestTemplate[]>('api_templates', []);
  const [history, setHistory] = useLocalStorage<RequestHistoryItem[]>('api_history', []);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showEnvironments, setShowEnvironments] = useState<boolean>(false);

  // Environment variable replacement
  const replaceEnvironmentVariables = (input: string): string => {
    const env = environments.find(e => e.id === selectedEnv);
    if (!env) return input;

    let result = input;
    env.variables.forEach(({ key, value }) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  };

  // Template handling
  const saveAsTemplate = () => {
    const template: RequestTemplate = {
      id: Date.now().toString(),
      name: `${method} ${url}`,
      method,
      url,
      headers,
      body
    };
    setTemplates([...templates, template]);
  };

  const loadTemplate = (template: RequestTemplate) => {
    setMethod(template.method);
    setUrl(template.url);
    setHeaders(template.headers);
    setBody(template.body || '');
  };

  // History handling
  const addToHistory = (response: APIResponse) => {
    const historyItem: RequestHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      method,
      url,
      headers,
      body,
      response,
      duration: response.duration
    };
    setHistory([historyItem, ...history.slice(0, 49)]); // Keep last 50 items
  };

  const loadFromHistory = (item: RequestHistoryItem) => {
    setMethod(item.method);
    setUrl(item.url);
    setHeaders(item.headers);
    setBody(item.body || '');
  };

  // Request handling
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    const startTime = performance.now();

    try {
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

      console.info('Request options:', {
        processedUrl,
        ...options,
      });

      const res = await fetch(processedUrl, options);
      const contentType = res.headers.get('content-type');
      let data;
      
      if (contentType?.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      const responseObj = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries([...res.headers]),
        data,
        duration
      };

      console.info('Response:', responseObj);

      setResponse(responseObj);
      addToHistory(responseObj);
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Header handling
  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  // Rendering helper
  const formatResponse = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return data;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">API Tester</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowEnvironments(!showEnvironments)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Environments
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="bg-background rounded-lg border shadow-sm p-6 space-y-4">
            {/* Environment Selector */}
            <div className="flex space-x-2">
              <select
                value={selectedEnv}
                onChange={(e) => setSelectedEnv(e.target.value)}
                className="rounded-md border px-3 py-2"
              >
                {environments.map((env) => (
                  <option key={env.id} value={env.id}>{env.name}</option>
                ))}
              </select>
            </div>

            {/* Method and URL */}
            <div className="flex space-x-2">
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-32 rounded-md border px-3 py-2"
              >
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input 
                type="text"
                placeholder="Enter URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 rounded-md border px-3 py-2"
              />
              <Button 
                onClick={handleSubmit}
                disabled={!url || loading}
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
              <Button
                variant="outline"
                onClick={saveAsTemplate}
                disabled={!url}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>

            {/* Headers */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Headers</h3>
                <Button onClick={addHeader} variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {headers.map((header, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    placeholder="Key"
                    value={header.key}
                    onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                    className="flex-1 rounded-md border px-3 py-2"
                  />
                  <input
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                    className="flex-1 rounded-md border px-3 py-2"
                  />
                  <Button 
                    onClick={() => removeHeader(index)}
                    variant="outline"
                    size="sm"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Request Body */}
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Request Body</h3>
                <textarea
                  placeholder="Enter request body (JSON)"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  className="w-full rounded-md border px-3 py-2 font-mono text-sm"
                />
              </div>
            )}

            {/* Response */}
            {(response || error) && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Response</h3>
                {error ? (
                  <div className="p-4 bg-red-50 text-red-500 rounded">
                    {error}
                  </div>
                ) : response && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <span className="font-semibold">Status:</span>
                        <span>{response.status} {response.statusText}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{response.duration.toFixed(0)}ms</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="font-semibold">Headers:</span>
                      <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto max-h-40">
                        {formatResponse(response.headers)}
                      </pre>
                    </div>
                    <div className="space-y-1">
                      <span className="font-semibold">Body:</span>
                      <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto max-h-96">
                        {formatResponse(response.data)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar for History and Templates */}
        <div className="lg:col-span-1 space-y-4">
          {/* Templates Section */}
          <div className="bg-background rounded-lg border shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-3">Templates</h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-2 hover:bg-gray-50 rounded cursor-pointer border"
                  onClick={() => loadTemplate(template)}
                >
                  <div className="text-sm font-medium">{template.name}</div>
                  <div className="text-xs text-gray-500">
                    {template.method} {template.url}
                  </div>
                </div>
              ))}
              {templates.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-2">
                  No saved templates
                </div>
              )}
            </div>
          </div>

          {/* History Section */}
          <div className="bg-background rounded-lg border shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-3">History</h3>
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-2 hover:bg-gray-50 rounded cursor-pointer border"
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium">
                      {item.method} {item.url}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-xs text-gray-500">
                      Status: {item.response?.status}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.duration.toFixed(0)}ms
                    </div>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-2">
                  No request history
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Environment Settings Modal */}
      {showEnvironments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Environment Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEnvironments(false)}
              >
                ✕
              </Button>
            </div>
            
            {environments.map((env, envIndex) => (
              <div key={env.id} className="mb-6 border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <input
                    className="text-lg font-semibold bg-transparent border-b"
                    value={env.name}
                    onChange={(e) => {
                      const newEnvs = [...environments];
                      newEnvs[envIndex].name = e.target.value;
                      setEnvironments(newEnvs);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEnvs = environments.filter((_, i) => i !== envIndex);
                      setEnvironments(newEnvs);
                    }}
                  >
                    Delete
                  </Button>
                </div>
                <div className="space-y-2">
                  {env.variables.map((variable, varIndex) => (
                    <div key={varIndex} className="flex space-x-2">
                      <input
                        placeholder="Variable name"
                        className="flex-1 rounded-md border px-3 py-2"
                        value={variable.key}
                        onChange={(e) => {
                          const newEnvs = [...environments];
                          newEnvs[envIndex].variables[varIndex].key = e.target.value;
                          setEnvironments(newEnvs);
                        }}
                      />
                      <input
                        placeholder="Value"
                        className="flex-1 rounded-md border px-3 py-2"
                        value={variable.value}
                        onChange={(e) => {
                          const newEnvs = [...environments];
                          newEnvs[envIndex].variables[varIndex].value = e.target.value;
                          setEnvironments(newEnvs);
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newEnvs = [...environments];
                          newEnvs[envIndex].variables = env.variables.filter(
                            (_, i) => i !== varIndex
                          );
                          setEnvironments(newEnvs);
                        }}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEnvs = [...environments];
                      newEnvs[envIndex].variables.push({ key: '', value: '' });
                      setEnvironments(newEnvs);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
              </div>
            ))}
            
            <Button
              onClick={() => {
                setEnvironments([
                  ...environments,
                  {
                    id: Date.now().toString(),
                    name: 'New Environment',
                    variables: []
                  }
                ]);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Environment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default APITester;