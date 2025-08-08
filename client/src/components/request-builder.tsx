import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { HttpRequest, HttpResponse } from "@/pages/api-tester";

interface RequestBuilderProps {
  request: HttpRequest;
  onRequestChange: (request: HttpRequest) => void;
  onResponse: (response: HttpResponse) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

interface ParamRow {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
  description: string;
}

interface HeaderRow {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
  description: string;
}

export function RequestBuilder({
  request,
  onRequestChange,
  onResponse,
  isLoading,
  setIsLoading,
}: RequestBuilderProps) {
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "body" | "auth">("params");
  const [params, setParams] = useState<ParamRow[]>([
    { id: "1", enabled: true, key: "", value: "", description: "" },
  ]);
  const [headers, setHeaders] = useState<HeaderRow[]>([
    { id: "1", enabled: true, key: "", value: "", description: "" },
  ]);

  const { toast } = useToast();

  const sendRequestMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      
      // Build enabled params
      const enabledParams = params
        .filter((param) => param.enabled && param.key && param.value)
        .reduce((acc, param) => ({ ...acc, [param.key]: param.value }), {});

      // Build enabled headers
      const enabledHeaders = headers
        .filter((header) => header.enabled && header.key && header.value)
        .reduce((acc, header) => ({ ...acc, [header.key]: header.value }), {});

      // Build URL with params
      let finalUrl = request.url;
      const paramString = new URLSearchParams(enabledParams).toString();
      if (paramString) {
        finalUrl += (finalUrl.includes("?") ? "&" : "?") + paramString;
      }

      const response = await apiRequest("POST", "/api/proxy", {
        method: request.method,
        url: finalUrl,
        headers: enabledHeaders,
        body: request.body && request.method !== "GET" ? JSON.parse(request.body) : undefined,
      });

      return response.json();
    },
    onSuccess: (data) => {
      onResponse(data);
      setIsLoading(false);
    },
    onError: (error) => {
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  const addParamRow = () => {
    setParams([...params, { id: Date.now().toString(), enabled: true, key: "", value: "", description: "" }]);
  };

  const updateParam = (id: string, field: keyof ParamRow, value: string | boolean) => {
    setParams(params.map((param) => (param.id === id ? { ...param, [field]: value } : param)));
  };

  const removeParam = (id: string) => {
    setParams(params.filter((param) => param.id !== id));
  };

  const addHeaderRow = () => {
    setHeaders([...headers, { id: Date.now().toString(), enabled: true, key: "", value: "", description: "" }]);
  };

  const updateHeader = (id: string, field: keyof HeaderRow, value: string | boolean) => {
    setHeaders(headers.map((header) => (header.id === id ? { ...header, [field]: value } : header)));
  };

  const removeHeader = (id: string) => {
    setHeaders(headers.filter((header) => header.id !== id));
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      {/* Request URL Section */}
      <div className="flex items-center space-x-2 mb-4">
        <Select
          value={request.method}
          onValueChange={(value: "GET" | "POST" | "PUT" | "DELETE") =>
            onRequestChange({ ...request, method: value })
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Enter request URL"
          value={request.url}
          onChange={(e) => onRequestChange({ ...request, url: e.target.value })}
          className="flex-1"
        />
        <Button
          onClick={() => sendRequestMutation.mutate()}
          disabled={isLoading || !request.url}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {["params", "headers", "body", "auth"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "params" && (
          <ParamsTable
            params={params}
            onUpdate={updateParam}
            onRemove={removeParam}
            onAdd={addParamRow}
          />
        )}

        {activeTab === "headers" && (
          <HeadersTable
            headers={headers}
            onUpdate={updateHeader}
            onRemove={removeHeader}
            onAdd={addHeaderRow}
          />
        )}

        {activeTab === "body" && (
          <div className="space-y-4">
            <Textarea
              placeholder="Request body (JSON)"
              value={request.body || ""}
              onChange={(e) => onRequestChange({ ...request, body: e.target.value })}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
        )}

        {activeTab === "auth" && (
          <div className="text-center text-gray-500 py-8">
            Authentication options coming soon
          </div>
        )}
      </div>
    </div>
  );
}

function ParamsTable({
  params,
  onUpdate,
  onRemove,
  onAdd,
}: {
  params: ParamRow[];
  onUpdate: (id: string, field: keyof ParamRow, value: string | boolean) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="w-8"></th>
            <th className="py-2 pr-4">Key</th>
            <th className="py-2 pr-4">Value</th>
            <th className="py-2 pr-4">Description</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {params.map((param) => (
            <tr key={param.id} className="group">
              <td className="py-1">
                <Checkbox
                  checked={param.enabled}
                  onCheckedChange={(checked) => onUpdate(param.id, "enabled", !!checked)}
                />
              </td>
              <td className="py-1 pr-4">
                <Input
                  placeholder="Key"
                  value={param.key}
                  onChange={(e) => onUpdate(param.id, "key", e.target.value)}
                  className="text-sm"
                />
              </td>
              <td className="py-1 pr-4">
                <Input
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => onUpdate(param.id, "value", e.target.value)}
                  className="text-sm"
                />
              </td>
              <td className="py-1 pr-4">
                <Input
                  placeholder="Description"
                  value={param.description}
                  onChange={(e) => onUpdate(param.id, "description", e.target.value)}
                  className="text-sm"
                />
              </td>
              <td className="py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(param.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="outline" onClick={onAdd} className="mt-2">
        Add Parameter
      </Button>
    </div>
  );
}

function HeadersTable({
  headers,
  onUpdate,
  onRemove,
  onAdd,
}: {
  headers: HeaderRow[];
  onUpdate: (id: string, field: keyof HeaderRow, value: string | boolean) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="w-8"></th>
            <th className="py-2 pr-4">Key</th>
            <th className="py-2 pr-4">Value</th>
            <th className="py-2 pr-4">Description</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {headers.map((header) => (
            <tr key={header.id} className="group">
              <td className="py-1">
                <Checkbox
                  checked={header.enabled}
                  onCheckedChange={(checked) => onUpdate(header.id, "enabled", !!checked)}
                />
              </td>
              <td className="py-1 pr-4">
                <Input
                  placeholder="Key"
                  value={header.key}
                  onChange={(e) => onUpdate(header.id, "key", e.target.value)}
                  className="text-sm"
                />
              </td>
              <td className="py-1 pr-4">
                <Input
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) => onUpdate(header.id, "value", e.target.value)}
                  className="text-sm"
                />
              </td>
              <td className="py-1 pr-4">
                <Input
                  placeholder="Description"
                  value={header.description}
                  onChange={(e) => onUpdate(header.id, "description", e.target.value)}
                  className="text-sm"
                />
              </td>
              <td className="py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(header.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="outline" onClick={onAdd} className="mt-2">
        Add Header
      </Button>
    </div>
  );
}
