export interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  params: Record<string, string>;
  body?: string;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  time: string;
  size: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  createdAt?: Date;
}

export interface RequestItem {
  id: string;
  collectionId?: string;
  name: string;
  method: string;
  url: string;
  headers: any;
  params: any;
  body?: string;
  createdAt?: Date;
}

export interface HistoryItem {
  id: string;
  method: string;
  url: string;
  headers: any;
  params: any;
  body?: string;
  responseStatus?: string;
  responseTime?: string;
  responseSize?: string;
  responseBody?: string;
  createdAt?: Date;
}

export interface ParamRow {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
  description: string;
}

export interface HeaderRow {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
  description: string;
}