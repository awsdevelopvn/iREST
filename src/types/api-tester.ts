// src/types/api-tester.ts

export interface Header {
    key: string;
    value: string;
}

export interface APIResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
    duration: number;
}

export interface RequestTemplate {
    id: string;
    name: string;
    method: string;
    url: string;
    headers: Header[];
    body?: string;
}

export interface Environment {
    id: string;
    name: string;
    variables: { key: string; value: string }[];
}

export interface RequestHistoryItem {
    id: string;
    timestamp: number;
    method: string;
    url: string;
    headers: Header[];
    body?: string;
    response?: APIResponse;
    duration: number;
}