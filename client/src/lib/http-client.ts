export interface HttpRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface HttpResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  time: string;
  size: string;
}

export async function makeHttpRequest(options: HttpRequestOptions): Promise<HttpResponseData> {
  const { method, url, headers = {}, params = {}, body, timeout = 30000 } = options;

  // Build URL with query parameters
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      urlObj.searchParams.set(key, value);
    }
  });

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(urlObj.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body && method !== "GET" ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = `${endTime - startTime}ms`;

    let responseBody;
    const responseText = await response.text();
    
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }

    const responseSize = `${new Blob([responseText]).size} bytes`;

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
      time: responseTime,
      size: responseSize,
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = `${endTime - startTime}ms`;

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }

    throw error;
  }
}
