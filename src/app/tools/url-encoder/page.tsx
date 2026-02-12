"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

export default function UrlEncoder() {
  const [encodeInput, setEncodeInput] = useState("");
  const [encodeOutput, setEncodeOutput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [decodeOutput, setDecodeOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const handleEncode = (value: string) => {
    setEncodeInput(value);
    if (!value) {
      setEncodeOutput("");
      setError("");
      return;
    }
    try {
      setEncodeOutput(encodeURIComponent(value));
      setError("");
    } catch {
      setError("인코딩 중 오류가 발생했습니다");
    }
  };

  const handleDecode = (value: string) => {
    setDecodeInput(value);
    if (!value) {
      setDecodeOutput("");
      setError("");
      return;
    }
    try {
      setDecodeOutput(decodeURIComponent(value));
      setError("");
    } catch {
      setError("유효하지 않은 URL 인코딩 문자열입니다");
    }
  };

  return (
    <ToolLayout
      title="URL 인코딩/디코딩"
      description="URL을 안전한 형식으로 인코딩하거나 디코딩합니다"
    >
      <Card className="p-4">
        <Tabs defaultValue="encode">
          <TabsList className="mb-4">
            <TabsTrigger value="encode">인코딩</TabsTrigger>
            <TabsTrigger value="decode">디코딩</TabsTrigger>
          </TabsList>

          <TabsContent value="encode">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  텍스트 입력
                </label>
                <Textarea
                  placeholder="인코딩할 URL이나 텍스트를 입력하세요"
                  className="font-mono text-sm min-h-[250px] resize-none"
                  value={encodeInput}
                  onChange={(e) => handleEncode(e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">인코딩 결과</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copy(encodeOutput)}
                    disabled={!encodeOutput}
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
                  className="font-mono text-sm min-h-[250px] resize-none"
                  value={encodeOutput}
                  readOnly
                  placeholder="인코딩된 결과가 여기에 표시됩니다"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="decode">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  인코딩된 URL 입력
                </label>
                <Textarea
                  placeholder="디코딩할 URL 인코딩 문자열을 입력하세요"
                  className="font-mono text-sm min-h-[250px] resize-none"
                  value={decodeInput}
                  onChange={(e) => handleDecode(e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">디코딩 결과</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copy(decodeOutput)}
                    disabled={!decodeOutput}
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
                  className="font-mono text-sm min-h-[250px] resize-none"
                  value={decodeOutput}
                  readOnly
                  placeholder="디코딩된 결과가 여기에 표시됩니다"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </Card>
    </ToolLayout>
  );
}
