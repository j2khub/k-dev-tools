"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check, RefreshCw } from "lucide-react";

export default function Timestamp() {
  const [timestamp, setTimestamp] = useState(String(Math.floor(Date.now() / 1000)));
  const [dateStr, setDateStr] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const tsNum = Number(timestamp);
  const isMs = timestamp.length > 10;
  const ms = isMs ? tsNum : tsNum * 1000;
  const date = !isNaN(ms) ? new Date(ms) : null;
  const isValid = date && !isNaN(date.getTime());

  const formats = isValid
    ? [
        { label: "ISO 8601", value: date.toISOString() },
        { label: "한국 시간", value: date.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) },
        { label: "UTC", value: date.toUTCString() },
        { label: "타임스탬프 (초)", value: String(Math.floor(date.getTime() / 1000)) },
        { label: "타임스탬프 (밀리초)", value: String(date.getTime()) },
      ]
    : [];

  const handleDateToTimestamp = (value: string) => {
    setDateStr(value);
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      setTimestamp(String(Math.floor(d.getTime() / 1000)));
    }
  };

  const handleNow = () => {
    setTimestamp(String(Math.floor(Date.now() / 1000)));
  };

  return (
    <ToolLayout
      title="타임스탬프 ↔ 날짜"
      description="Unix 타임스탬프와 날짜/시간을 상호 변환합니다"
    >
      <Card className="p-4 space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">타임스탬프 → 날짜</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="1700000000"
              className="flex-1 px-3 py-2 text-sm font-mono border rounded-md bg-transparent"
            />
            <Button size="sm" variant="outline" onClick={handleNow}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              현재
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">날짜 → 타임스탬프</label>
          <input
            type="datetime-local"
            value={dateStr}
            onChange={(e) => handleDateToTimestamp(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-md bg-transparent"
          />
        </div>

        {formats.length > 0 && (
          <div className="space-y-2">
            {formats.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between px-3 py-2 bg-muted rounded-md"
              >
                <div>
                  <span className="text-xs text-muted-foreground mr-2">{f.label}</span>
                  <code className="text-sm font-mono">{f.value}</code>
                </div>
                <Button size="sm" variant="ghost" onClick={() => copy(f.value)}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            ))}
          </div>
        )}

        {!isValid && timestamp && (
          <p className="text-sm text-destructive">유효하지 않은 타임스탬프입니다</p>
        )}
      </Card>
    </ToolLayout>
  );
}
