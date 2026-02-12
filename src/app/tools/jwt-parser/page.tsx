"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

function decodeJwtPart(part: string): string {
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return decodeURIComponent(
    Array.from(atob(padded))
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

interface JwtData {
  header: string;
  payload: string;
  signature: string;
}

export default function JwtParser() {
  const [input, setInput] = useState("");
  const [jwt, setJwt] = useState<JwtData | null>(null);
  const [error, setError] = useState("");
  const headerCopy = useCopyToClipboard();
  const payloadCopy = useCopyToClipboard();

  const handleParse = (value: string) => {
    setInput(value);
    if (!value.trim()) {
      setJwt(null);
      setError("");
      return;
    }
    try {
      const parts = value.trim().split(".");
      if (parts.length !== 3) {
        setError("JWT는 점(.)으로 구분된 3개의 부분으로 구성되어야 합니다");
        setJwt(null);
        return;
      }
      const header = JSON.stringify(JSON.parse(decodeJwtPart(parts[0])), null, 2);
      const payload = JSON.stringify(JSON.parse(decodeJwtPart(parts[1])), null, 2);
      setJwt({ header, payload, signature: parts[2] });
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "유효하지 않은 JWT입니다");
      setJwt(null);
    }
  };

  return (
    <ToolLayout
      title="JWT 파서"
      description="JSON Web Token을 디코딩하여 헤더와 페이로드를 확인합니다"
    >
      <Card className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">JWT 입력</label>
          <Textarea
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="font-mono text-sm min-h-[100px] resize-none"
            value={input}
            onChange={(e) => handleParse(e.target.value)}
          />
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>

        {jwt && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  헤더 (Header)
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => headerCopy.copy(jwt.header)}
                >
                  {headerCopy.copied ? (
                    <Check className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  {headerCopy.copied ? "복사됨" : "복사"}
                </Button>
              </div>
              <Textarea
                className="font-mono text-sm min-h-[150px] resize-none"
                value={jwt.header}
                readOnly
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-green-600 dark:text-green-400">
                  페이로드 (Payload)
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => payloadCopy.copy(jwt.payload)}
                >
                  {payloadCopy.copied ? (
                    <Check className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  {payloadCopy.copied ? "복사됨" : "복사"}
                </Button>
              </div>
              <Textarea
                className="font-mono text-sm min-h-[150px] resize-none"
                value={jwt.payload}
                readOnly
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 block">
                서명 (Signature)
              </label>
              <div className="p-3 bg-muted rounded-md font-mono text-xs break-all">
                {jwt.signature}
              </div>
            </div>
          </div>
        )}
      </Card>
    </ToolLayout>
  );
}
