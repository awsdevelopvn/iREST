// src/components/api-tester/RequestHistory.tsx

"use client";

import React, { useState, useMemo } from 'react';
import { Search, Clock, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RequestHistoryItem, APIResponse } from '@/types/api-tester';

interface RequestHistoryProps {
  history: RequestHistoryItem[];
  onSelect: (item: RequestHistoryItem) => void;
  onClear: () => void;
}

const STATUS_FILTERS = {
  'all': 'All',
  'success': 'Success (2xx)',
  'redirect': 'Redirect (3xx)',
  'client-error': 'Client Error (4xx)',
  'server-error': 'Server Error (5xx)',
};

export const RequestHistory = ({
  history,
  onSelect,
  onClear,
}: RequestHistoryProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<keyof typeof STATUS_FILTERS>('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      // Search filter
      const searchLower = search.toLowerCase();
      if (searchLower && !item.url.toLowerCase().includes(searchLower)) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && item.response) {
        const status = item.response.status;
        switch (statusFilter) {
          case 'success':
            if (status < 200 || status >= 300) return false;
            break;
          case 'redirect':
            if (status < 300 || status >= 400) return false;
            break;
          case 'client-error':
            if (status < 400 || status >= 500) return false;
            break;
          case 'server-error':
            if (status < 500 || status >= 600) return false;
            break;
        }
      }

      // Method filter
      if (methodFilter !== 'all' && item.method !== methodFilter) {
        return false;
      }

      return true;
    });
  }, [history, search, statusFilter, methodFilter]);

  const uniqueMethods = [...new Set(history.map(item => item.method))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Request History</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      <div className="space-y-2">
        {/* Search and filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_FILTERS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueMethods.map(method => (
                <SelectItem key={method} value={method}>{method}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* History list */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelect(item)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getMethodColor(item.method)}`}>
                      {item.method}
                    </span>
                    <span className="text-sm truncate max-w-[300px]">{item.url}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(item.timestamp)}</span>
                    {item.response && (
                      <span className={getStatusColor(item.response.status)}>
                        {item.response.status} {item.response.statusText}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item);
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {filteredHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No requests found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Utility functions
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

const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return 'text-green-600';
  if (status >= 300 && status < 400) return 'text-blue-600';
  if (status >= 400 && status < 500) return 'text-yellow-600';
  if (status >= 500) return 'text-red-600';
  return 'text-gray-600';
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};
