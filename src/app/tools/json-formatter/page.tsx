"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const handleFormat = useCallback((value: string) => {
    setInput(value);
    if (!value.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const parsed = JSON.parse(value);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "유효하지 않은 JSON입니다");
      setOutput("");
    }
  }, []);

  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "유효하지 않은 JSON입니다");
    }
  };

  return (
    <ToolLayout
      title="JSON 포매터"
      description="JSON 데이터를 보기 좋게 정리하고 유효성을 검사합니다"
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">입력</label>
              <Button variant="ghost" size="sm" onClick={() => setInput("")} className="h-7 px-2 text-xs text-muted-foreground">
                삭제
              </Button>
            </div>
            <Textarea
              placeholder='{"key": "value"} 형식의 JSON을 입력하세요'
              className="font-mono text-sm flex-1 min-h-[300px] resize-none"
              value={input}
              onChange={(e) => handleFormat(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">결과</label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleMinify}>
                  압축
                </Button>
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
            </div>
            <Textarea
              className="font-mono text-sm flex-1 min-h-[300px] resize-none"
              value={error || output}
              readOnly
              placeholder="포맷된 JSON이 여기에 표시됩니다"
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
