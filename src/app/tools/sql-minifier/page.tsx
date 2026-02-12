"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

function minifySQL(sql: string): string {
  return sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([,;()=<>!])\s*/g, "$1")
    .trim();
}

export default function SqlMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const handleConvert = (value: string) => {
    setInput(value);
    if (!value.trim()) {
      setOutput("");
      return;
    }
    setOutput(minifySQL(value));
  };

  return (
    <ToolLayout
      title="SQL 미니파이어"
      description="SQL 쿼리에서 주석과 공백을 제거하여 압축합니다"
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">SQL 입력</label>
              <Button variant="ghost" size="sm" onClick={() => setInput("")} className="h-7 px-2 text-xs text-muted-foreground">
                삭제
              </Button>
            </div>
            <Textarea
              placeholder={"SELECT *\nFROM users\nWHERE age > 20\n-- 주석 예시"}
              className="font-mono text-sm flex-1 min-h-[300px] resize-none"
              value={input}
              onChange={(e) => handleConvert(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">압축 결과</label>
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
              value={output}
              readOnly
              placeholder="압축된 SQL이 여기에 표시됩니다"
            />
          </div>
        </div>
      </Card>
    </ToolLayout>
  );
}
