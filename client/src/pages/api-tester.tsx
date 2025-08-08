import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { RequestBuilder } from "@/components/request-builder";
import { ResponseViewer } from "@/components/response-viewer";

export interface HttpRequest {
  method: "GET" | "POST" | "PUT" | "DELETE";
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

export default function ApiTester() {
  const [currentRequest, setCurrentRequest] = useState<HttpRequest>({
    method: "GET",
    url: "",
    headers: {},
    params: {},
    body: "",
  });

  const [response, setResponse] = useState<HttpResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <RequestBuilder
          request={currentRequest}
          onRequestChange={setCurrentRequest}
          onResponse={setResponse}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
        <ResponseViewer response={response} />
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-gray-700">Sending request...</span>
          </div>
        </div>
      )}
    </div>
  );
}
