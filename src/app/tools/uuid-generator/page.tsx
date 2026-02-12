"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check, RefreshCw } from "lucide-react";

function generateUUID(): string {
  return crypto.randomUUID();
}

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>(() => [generateUUID()]);
  const [count, setCount] = useState(1);
  const { copied, copy } = useCopyToClipboard();

  const handleGenerate = () => {
    setUuids(Array.from({ length: count }, () => generateUUID()));
  };

  return (
    <ToolLayout
      title="UUID 생성기"
      description="랜덤 UUID v4를 생성합니다"
    >
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">개수</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
            className="w-20 px-2 py-1.5 text-sm border rounded-md bg-transparent"
          />
          <Button size="sm" onClick={handleGenerate}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            생성
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copy(uuids.join("\n"))}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 mr-1" />
            ) : (
              <Copy className="h-3.5 w-3.5 mr-1" />
            )}
            {copied ? "복사됨" : "전체 복사"}
          </Button>
        </div>
        <div className="space-y-1.5">
          {uuids.map((uuid, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 bg-muted rounded-md font-mono text-sm"
            >
              <span>{uuid}</span>
            </div>
          ))}
        </div>
      </Card>
    </ToolLayout>
  );
}
