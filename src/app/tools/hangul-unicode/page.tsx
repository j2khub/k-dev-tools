"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

function textToUnicode(text: string): string {
  return Array.from(text)
    .map((char) => {
      const code = char.codePointAt(0)!;
      return code > 127 ? `U+${code.toString(16).toUpperCase().padStart(4, "0")}` : char;
    })
    .join(" ");
}

function unicodeToText(unicode: string): string {
  return unicode.replace(/U\+([0-9A-Fa-f]{4,6})/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16))
  );
}

function textToEscape(text: string): string {
  return Array.from(text)
    .map((char) => {
      const code = char.codePointAt(0)!;
      if (code > 127) {
        return code > 0xffff
          ? `\\u{${code.toString(16).toUpperCase()}}`
          : `\\u${code.toString(16).toUpperCase().padStart(4, "0")}`;
      }
      return char;
    })
    .join("");
}

export default function HangulUnicode() {
  const [textInput, setTextInput] = useState("");
  const [unicodeInput, setUnicodeInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [unicodeOutput, setUnicodeOutput] = useState("");
  const [escapeOutput, setEscapeOutput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const handleTextToUnicode = (value: string) => {
    setTextInput(value);
    setUnicodeOutput(textToUnicode(value));
    setEscapeOutput(textToEscape(value));
  };

  const handleUnicodeToText = (value: string) => {
    setUnicodeInput(value);
    setTextOutput(unicodeToText(value));
  };

  return (
    <ToolLayout
      title="한글 ↔ 유니코드"
      description="한글 텍스트와 유니코드 코드포인트를 상호 변환합니다"
    >
      <Card className="p-4">
        <Tabs defaultValue="to-unicode">
          <TabsList className="mb-4">
            <TabsTrigger value="to-unicode">한글 → 유니코드</TabsTrigger>
            <TabsTrigger value="to-text">유니코드 → 한글</TabsTrigger>
          </TabsList>

          <TabsContent value="to-unicode" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">한글 입력</label>
              <Textarea
                placeholder="안녕하세요"
                className="font-mono text-sm min-h-[100px] resize-none"
                value={textInput}
                onChange={(e) => handleTextToUnicode(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">유니코드 (U+ 형식)</label>
                <Button size="sm" variant="outline" onClick={() => copy(unicodeOutput)} disabled={!unicodeOutput}>
                  {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copied ? "복사됨" : "복사"}
                </Button>
              </div>
              <Textarea className="font-mono text-sm min-h-[80px] resize-none" value={unicodeOutput} readOnly />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">JavaScript 이스케이프</label>
              <Textarea className="font-mono text-sm min-h-[80px] resize-none" value={escapeOutput} readOnly />
            </div>
          </TabsContent>

          <TabsContent value="to-text" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">유니코드 입력</label>
              <Textarea
                placeholder="U+D55C U+AE00"
                className="font-mono text-sm min-h-[100px] resize-none"
                value={unicodeInput}
                onChange={(e) => handleUnicodeToText(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">변환 결과</label>
                <Button size="sm" variant="outline" onClick={() => copy(textOutput)} disabled={!textOutput}>
                  {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copied ? "복사됨" : "복사"}
                </Button>
              </div>
              <Textarea className="font-mono text-sm min-h-[80px] resize-none" value={textOutput} readOnly />
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </ToolLayout>
  );
}
