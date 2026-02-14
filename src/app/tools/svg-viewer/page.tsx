"use client";

import { useState, useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check, Download } from "lucide-react";

export default function SvgViewer() {
  const [input, setInput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const isSvg = input.trim().startsWith("<svg") || input.trim().startsWith("<?xml");

  const sanitizedSvg = useMemo(() => {
    if (!isSvg) return "";
    return DOMPurify.sanitize(input, { USE_PROFILES: { svg: true, svgFilters: true } });
  }, [input, isSvg]);

  const handleDownload = () => {
    const blob = new Blob([input], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "image.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="SVG 뷰어"
      description="SVG 코드를 붙여넣으면 실시간으로 미리보기합니다"
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">SVG 코드</label>
              <Button variant="ghost" size="sm" onClick={() => setInput("")} className="h-7 px-2 text-xs text-muted-foreground">
                삭제
              </Button>
            </div>
            <Textarea
              placeholder={'<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="50" cy="50" r="40" fill="blue" />\n</svg>'}
              className="font-mono text-sm flex-1 min-h-[300px] resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">미리보기</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!isSvg}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  저장
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copy(input)}
                  disabled={!input}
                >
                  {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copied ? "복사됨" : "복사"}
                </Button>
              </div>
            </div>
            <div className="flex-1 min-h-[300px] border rounded-md flex items-center justify-center p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=')]">
              {isSvg ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizedSvg }} className="max-w-full max-h-full" />
              ) : (
                <span className="text-sm text-muted-foreground">
                  {input ? "유효한 SVG 코드를 입력하세요" : "SVG 코드를 입력하면 미리보기가 표시됩니다"}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </ToolLayout>
  );
}
