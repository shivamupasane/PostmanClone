import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SyntaxHighlighter } from "@/components/syntax-highlighter";
import { Copy, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { HttpResponse } from "@/pages/api-tester";

interface ResponseViewerProps {
  response: HttpResponse | null;
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<"body" | "headers" | "test">("body");
  const [viewMode, setViewMode] = useState<"pretty" | "raw" | "preview">("pretty");
  const { toast } = useToast();

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "status-success";
    if (status >= 400 && status < 500) return "status-error";
    if (status >= 500) return "status-error";
    return "status-warning";
  };

  const copyToClipboard = async () => {
    if (!response) return;
    
    try {
      const text = typeof response.body === "string" 
        ? response.body 
        : JSON.stringify(response.body, null, 2);
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Response copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (!response) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">No Response</div>
          <div className="text-sm">Send a request to see the response here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white overflow-hidden">
      {/* Response Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-800">Response</h3>
            <div className="flex items-center space-x-2">
              <Badge className={`${getStatusColor(response.status)} bg-opacity-10 border-0`}>
                {response.status} {response.statusText}
              </Badge>
              <span className="text-sm text-gray-600">
                Time: <span className="font-medium">{response.time}</span>
              </span>
              <span className="text-sm text-gray-600">
                Size: <span className="font-medium">{response.size}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Response Tabs */}
      <div className="flex border-b border-gray-200 px-4">
        {["body", "headers", "test"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab === "test" ? "Test Results" : tab}
          </button>
        ))}
      </div>

      {/* Response Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "body" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                {["pretty", "raw", "preview"].map((mode) => (
                  <button
                    key={mode}
                    className={`px-3 py-1 text-xs font-medium rounded capitalize ${
                      viewMode === mode
                        ? "bg-gray-100 text-gray-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setViewMode(mode as any)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {typeof response.body === "object" ? "JSON" : "Text"}
              </span>
            </div>

            {viewMode === "pretty" && typeof response.body === "object" ? (
              <SyntaxHighlighter
                code={JSON.stringify(response.body, null, 2)}
                language="json"
              />
            ) : (
              <div className="syntax-highlight overflow-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {typeof response.body === "string"
                    ? response.body
                    : JSON.stringify(response.body, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}

        {activeTab === "headers" && (
          <div className="space-y-2">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex">
                <div className="w-1/3 text-sm font-medium text-gray-600 pr-4">{key}:</div>
                <div className="flex-1 text-sm text-gray-800">{value}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "test" && (
          <div className="text-center text-gray-500 py-8">
            Test results will appear here
          </div>
        )}
      </div>
    </div>
  );
}
