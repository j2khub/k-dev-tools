"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";
import Papa from "papaparse";

export default function JsonToCsv() {
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
      const parsed = JSON.parse(value);
      const data = Array.isArray(parsed) ? parsed : [parsed];
      const csv = Papa.unparse(data);
      setOutput(csv);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "유효하지 않은 JSON입니다");
      setOutput("");
    }
  };

  return (
    <ToolLayout
      title="JSON → CSV"
      description="JSON 데이터를 CSV 형식으로 변환합니다"
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">JSON 입력</label>
              <Button variant="ghost" size="sm" onClick={() => setInput("")} className="h-7 px-2 text-xs text-muted-foreground">
                삭제
              </Button>
            </div>
            <Textarea
              placeholder={'[{"name":"홍길동","age":30},{"name":"김철수","age":25}]'}
              className="font-mono text-sm flex-1 min-h-[300px] resize-none"
              value={input}
              onChange={(e) => handleConvert(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">CSV 결과</label>
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
              placeholder="변환된 CSV가 여기에 표시됩니다"
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
