"use client";

import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const defaultMarkdown = `# Hello World

This is **bold** and *italic* text.

- Item 1
- Item 2

\`\`\`js
console.log("hello");
\`\`\`
`;

export default function MarkdownToHtmlPage() {
  const [input, setInput] = useState(defaultMarkdown);
  const [html, setHtml] = useState("");
  const { copy, copied } = useCopyToClipboard();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { marked } = await import("marked");
        const result = await marked(input);
        if (!cancelled) setHtml(result as string);
      } catch {
        if (!cancelled) setHtml("변환 오류");
      }
    })();
    return () => { cancelled = true; };
  }, [input]);

  return (
    <ToolLayout title="마크다운 → HTML" description="마크다운 텍스트를 HTML 코드로 변환합니다">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between h-9 mb-2">
            <Label className="text-sm font-medium">마크다운 입력</Label>
            <Button variant="ghost" size="sm" onClick={() => setInput("")} className="h-7 px-2 text-xs text-muted-foreground">
              삭제
            </Button>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono text-sm flex-1 min-h-[300px] resize-none"
            placeholder="마크다운을 입력하세요..."
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between h-9 mb-2">
            <Label className="text-sm font-medium">HTML 결과</Label>
            <Button variant="outline" size="sm" onClick={() => copy(html)}>
              {copied ? "복사됨!" : "복사"}
            </Button>
          </div>
          <Textarea
            value={html}
            readOnly
            className="font-mono text-sm flex-1 min-h-[300px] resize-none bg-muted/50"
          />
        </div>
      </div>
    </ToolLayout>
  );
}
