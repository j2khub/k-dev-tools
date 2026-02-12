"use client";

import { useState } from "react";
import { marked } from "marked";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const defaultMarkdown = `# 제목 1
## 제목 2
### 제목 3

**굵은 글씨**와 *기울임 글씨*

- 목록 항목 1
- 목록 항목 2
- 목록 항목 3

1. 번호 목록 1
2. 번호 목록 2

> 인용문 블록

\`인라인 코드\`

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

[링크 예시](https://example.com)

| 헤더 1 | 헤더 2 |
|--------|--------|
| 셀 1   | 셀 2   |
| 셀 3   | 셀 4   |
`;

export default function MarkdownPreviewPage() {
  const [input, setInput] = useState(defaultMarkdown);
  const html = marked(input) as string;

  return (
    <ToolLayout title="마크다운 미리보기" description="마크다운 텍스트를 실시간으로 렌더링하여 미리봅니다">
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
            className="font-mono text-sm flex-1 min-h-[400px] resize-none"
            placeholder="마크다운을 입력하세요..."
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center h-9 mb-2">
            <Label className="text-sm font-medium">미리보기</Label>
          </div>
          <div
            className="markdown-body p-4 border rounded-lg min-h-[400px] overflow-auto bg-background [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:mb-3 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:mb-3 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:text-primary [&_a]:underline [&_table]:w-full [&_table]:border-collapse [&_table]:mb-3 [&_th]:border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:bg-muted [&_td]:border [&_td]:px-3 [&_td]:py-2 [&_hr]:my-4 [&_hr]:border-muted-foreground/30 [&_strong]:font-bold [&_em]:italic"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
