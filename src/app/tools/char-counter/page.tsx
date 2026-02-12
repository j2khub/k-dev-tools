"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CharCounterPage() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const lines = text === "" ? 0 : text.split("\n").length;
    const paragraphs = text.trim() === "" ? 0 : text.trim().split(/\n\s*\n/).length;
    const bytes = new TextEncoder().encode(text).length;
    return { chars, charsNoSpaces, words, lines, paragraphs, bytes };
  }, [text]);

  const statItems = [
    { label: "글자 수 (공백 포함)", value: stats.chars },
    { label: "글자 수 (공백 제외)", value: stats.charsNoSpaces },
    { label: "단어 수", value: stats.words },
    { label: "줄 수", value: stats.lines },
    { label: "문단 수", value: stats.paragraphs },
    { label: "바이트 (UTF-8)", value: stats.bytes },
  ];

  return (
    <ToolLayout title="글자수/단어수 카운터" description="텍스트의 글자수, 단어수, 줄수 등을 실시간으로 계산합니다">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between h-9 mb-2">
            <Label className="text-sm font-medium">텍스트 입력</Label>
            <Button variant="ghost" size="sm" onClick={() => setText("")} className="h-7 px-2 text-xs text-muted-foreground">
              삭제
            </Button>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-sm min-h-[250px] resize-none"
            placeholder="분석할 텍스트를 입력하세요..."
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {statItems.map((item) => (
            <div key={item.label} className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold font-mono">{item.value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
