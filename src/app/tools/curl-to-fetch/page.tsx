"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

function parseCurl(curl: string): string {
  const trimmed = curl.replace(/\\\n/g, " ").trim();

  const urlMatch = trimmed.match(/curl\s+(?:['"]([^'"]+)['"]|(\S+))/);
  const url = urlMatch?.[1] || urlMatch?.[2] || "";

  const methodMatch = trimmed.match(/-X\s+(\w+)/);
  let method = methodMatch?.[1] || "GET";

  const headers: Record<string, string> = {};
  const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
  let hMatch;
  while ((hMatch = headerRegex.exec(trimmed)) !== null) {
    const [key, ...rest] = hMatch[1].split(":");
    headers[key.trim()] = rest.join(":").trim();
  }

  const dataMatch =
    trimmed.match(/(?:-d|--data|--data-raw|--data-binary)\s+['"]([^'"]+)['"]/) ||
    trimmed.match(/(?:-d|--data|--data-raw|--data-binary)\s+(\S+)/);
  const body = dataMatch?.[1];

  if (body && method === "GET") method = "POST";

  const hasOptions = method !== "GET" || Object.keys(headers).length > 0 || body;

  if (!hasOptions) {
    return `const response = await fetch("${url}");\nconst data = await response.json();`;
  }

  const options: string[] = [];
  if (method !== "GET") options.push(`  method: "${method}",`);

  if (Object.keys(headers).length > 0) {
    options.push("  headers: {");
    Object.entries(headers).forEach(([k, v]) => {
      options.push(`    "${k}": "${v}",`);
    });
    options.push("  },");
  }

  if (body) {
    try {
      JSON.parse(body);
      options.push(`  body: JSON.stringify(${body}),`);
    } catch {
      options.push(`  body: "${body}",`);
    }
  }

  return `const response = await fetch("${url}", {\n${options.join("\n")}\n});\nconst data = await response.json();`;
}

export default function CurlToFetch() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const handleConvert = (value: string) => {
    setInput(value);
    if (!value.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      if (!value.trim().toLowerCase().startsWith("curl")) {
        setError("curl 명령으로 시작해야 합니다");
        setOutput("");
        return;
      }
      setOutput(parseCurl(value));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "변환 중 오류가 발생했습니다");
      setOutput("");
    }
  };

  return (
    <ToolLayout
      title="cURL → fetch 변환"
      description="cURL 명령을 JavaScript fetch 코드로 변환합니다"
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">cURL 명령</label>
            </div>
            <Textarea
              placeholder={'curl "https://api.example.com/data" \\\n  -H "Authorization: Bearer token" \\\n  -H "Content-Type: application/json"'}
              className="font-mono text-sm flex-1 min-h-[300px] resize-none"
              value={input}
              onChange={(e) => handleConvert(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">JavaScript fetch</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copy(output)}
                disabled={!output}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1" />
                )}
                {copied ? "복사됨" : "복사"}
              </Button>
            </div>
            <Textarea
              className="font-mono text-sm flex-1 min-h-[300px] resize-none"
              value={error || output}
              readOnly
              placeholder="변환된 fetch 코드가 여기에 표시됩니다"
            />
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </div>
        </div>
      </Card>
    </ToolLayout>
  );
}
