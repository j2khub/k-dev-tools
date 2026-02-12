"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function Base64ToImage() {
  const [input, setInput] = useState("");

  const imageSrc = input.trim().startsWith("data:image")
    ? input.trim()
    : input.trim()
      ? `data:image/png;base64,${input.trim()}`
      : "";

  const [valid, setValid] = useState(true);

  const handleChange = (value: string) => {
    setInput(value);
    if (!value.trim()) {
      setValid(true);
      return;
    }
    const img = new Image();
    img.onload = () => setValid(true);
    img.onerror = () => setValid(false);
    const src = value.trim().startsWith("data:image")
      ? value.trim()
      : `data:image/png;base64,${value.trim()}`;
    img.src = src;
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const link = document.createElement("a");
    link.download = "decoded-image.png";
    link.href = imageSrc;
    link.click();
  };

  return (
    <ToolLayout
      title="Base64 → 이미지"
      description="Base64 문자열을 이미지로 변환하여 미리보기합니다"
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">Base64 입력</label>
              <Button variant="ghost" size="sm" onClick={() => setInput("")} className="h-7 px-2 text-xs text-muted-foreground">
                삭제
              </Button>
            </div>
            <Textarea
              placeholder="data:image/png;base64,... 또는 Base64 문자열"
              className="font-mono text-xs flex-1 min-h-[300px] resize-none"
              value={input}
              onChange={(e) => handleChange(e.target.value)}
            />
            {!valid && input && (
              <p className="text-sm text-destructive mt-2">유효하지 않은 Base64 이미지입니다</p>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">미리보기</label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                disabled={!valid || !input.trim()}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                다운로드
              </Button>
            </div>
            <div className="flex-1 min-h-[300px] border rounded-md flex items-center justify-center p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=')]">
              {valid && imageSrc ? (
                <img src={imageSrc} alt="디코딩 결과" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-sm text-muted-foreground">
                  Base64 문자열을 입력하면 이미지가 표시됩니다
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </ToolLayout>
  );
}
