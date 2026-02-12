"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

function inlineCSS(html: string): string {
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const styles: Record<string, Record<string, string>> = {};

  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    const css = match[1];
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let rule;
    while ((rule = ruleRegex.exec(css)) !== null) {
      const selector = rule[1].trim();
      const declarations = rule[2].trim();
      if (!styles[selector]) styles[selector] = {};
      declarations.split(";").forEach((decl) => {
        const [prop, val] = decl.split(":").map((s) => s.trim());
        if (prop && val) styles[selector][prop] = val;
      });
    }
  }

  let result = html.replace(styleRegex, "");

  Object.entries(styles).forEach(([selector, props]) => {
    const styleStr = Object.entries(props)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");

    const tagMatch = selector.match(/^(\w+)$/);
    const classMatch = selector.match(/^\.([a-zA-Z0-9_-]+)$/);
    const idMatch = selector.match(/^#([a-zA-Z0-9_-]+)$/);

    if (tagMatch) {
      const tag = tagMatch[1];
      const re = new RegExp(`<${tag}([^>]*)>`, "gi");
      result = result.replace(re, (m, attrs) => {
        if (attrs.includes("style=")) {
          return m.replace(/style="([^"]*)"/, `style="${styleStr}; $1"`);
        }
        return `<${tag} style="${styleStr}"${attrs}>`;
      });
    } else if (classMatch) {
      const cls = classMatch[1];
      const re = new RegExp(`class="[^"]*\\b${cls}\\b[^"]*"`, "gi");
      result = result.replace(re, (m) => `${m} style="${styleStr}"`);
    } else if (idMatch) {
      const id = idMatch[1];
      const re = new RegExp(`id="${id}"`, "gi");
      result = result.replace(re, (m) => `${m} style="${styleStr}"`);
    }
  });

  return result;
}

export default function CssInliner() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const handleConvert = () => {
    if (!input.trim()) return;
    setOutput(inlineCSS(input));
  };

  return (
    <ToolLayout
      title="CSS 인라이너"
      description="CSS 스타일을 HTML 인라인 스타일로 변환합니다"
    >
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">HTML + CSS 입력</label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setInput("")} className="h-7 px-2 text-xs text-muted-foreground">
                  삭제
                </Button>
                <Button size="sm" onClick={handleConvert}>
                  변환
                </Button>
              </div>
            </div>
            <Textarea
              placeholder={'<style>\n  p { color: red; }\n</style>\n<p>안녕하세요</p>'}
              className="font-mono text-sm flex-1 min-h-[300px] resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <label className="text-sm font-medium">인라인 결과</label>
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
              placeholder="인라인 처리된 HTML이 여기에 표시됩니다"
            />
          </div>
        </div>
      </Card>
    </ToolLayout>
  );
}
