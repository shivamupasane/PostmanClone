import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Collection, RequestItem, HistoryItem, HttpResponse } from '../models/http-models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  // Collections
  getCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.baseUrl}/collections`);
  }

  createCollection(collection: Omit<Collection, 'id' | 'createdAt'>): Observable<Collection> {
    return this.http.post<Collection>(`${this.baseUrl}/collections`, collection);
  }

  deleteCollection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/collections/${id}`);
  }

  // Requests
  getRequestsByCollection(collectionId: string): Observable<RequestItem[]> {
    return this.http.get<RequestItem[]>(`${this.baseUrl}/collections/${collectionId}/requests`);
  }

  createRequest(request: Omit<RequestItem, 'id' | 'createdAt'>): Observable<RequestItem> {
    return this.http.post<RequestItem>(`${this.baseUrl}/requests`, request);
  }

  updateRequest(id: string, request: Partial<RequestItem>): Observable<RequestItem> {
    return this.http.put<RequestItem>(`${this.baseUrl}/requests/${id}`, request);
  }

  deleteRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/requests/${id}`);
  }

  // History
  getHistory(): Observable<HistoryItem[]> {
    return this.http.get<HistoryItem[]>(`${this.baseUrl}/history`);
  }

  addToHistory(history: Omit<HistoryItem, 'id' | 'createdAt'>): Observable<HistoryItem> {
    return this.http.post<HistoryItem>(`${this.baseUrl}/history`, history);
  }

  clearHistory(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/history`);
  }

  // HTTP Proxy
  sendRequest(requestData: {
    method: string;
    url: string;
    headers?: any;
    body?: any;
  }): Observable<HttpResponse> {
    return this.http.post<HttpResponse>(`${this.baseUrl}/proxy`, requestData);
  }
}