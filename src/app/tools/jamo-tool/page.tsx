"use client";

import { useState } from "react";
import { disassemble, assemble, getChoseong } from "es-hangul";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

type Mode = "disassemble" | "assemble" | "choseong";

export default function JamoToolPage() {
  const [mode, setMode] = useState<Mode>("disassemble");
  const [input, setInput] = useState("");
  const { copy, copied } = useCopyToClipboard();

  let output = "";
  let error = "";
  try {
    if (input.trim()) {
      switch (mode) {
        case "disassemble":
          output = disassemble(input);
          break;
        case "assemble": {
          // assemble only handles hangul jamo - pass non-jamo chars through as-is
          const chars = [...input];
          const jamo: string[] = [];
          const segments: { type: "jamo" | "other"; value: string }[] = [];
          for (const ch of chars) {
            const isJamo = /[\u1100-\u11FF\u3131-\u3163\uA960-\uA97F\uD7B0-\uD7FF]/.test(ch);
            const last = segments[segments.length - 1];
            if (last && last.type === (isJamo ? "jamo" : "other")) {
              last.value += ch;
            } else {
              segments.push({ type: isJamo ? "jamo" : "other", value: ch });
            }
          }
          output = segments
            .map((s) => (s.type === "jamo" ? assemble([...s.value]) : s.value))
            .join("");
          break;
        }
        case "choseong":
          output = getChoseong(input);
          break;
      }
    }
  } catch (e) {
    error = "변환 중 오류가 발생했습니다";
  }

  const modes = [
    { key: "disassemble" as Mode, label: "자모 분리", placeholder: "한글을 입력하세요 (예: 안녕하세요)", desc: "한글을 자음과 모음으로 분리합니다" },
    { key: "assemble" as Mode, label: "자모 조합", placeholder: "자모를 입력하세요 (예: ㅎㅏㄴㄱㅡㄹ)", desc: "자음과 모음을 한글로 조합합니다" },
    { key: "choseong" as Mode, label: "초성 추출", placeholder: "한글을 입력하세요 (예: 프로그래밍)", desc: "한글에서 초성만 추출합니다" },
  ];

  const currentMode = modes.find((m) => m.key === mode)!;

  return (
    <ToolLayout title="한글 자모 분리/조합기" description="한글의 자음과 모음을 분리하거나 조합합니다">
      <div className="space-y-4">
        {/* Mode selector */}
        <div className="flex gap-2">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setInput(""); }}
              className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                mode === m.key
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">{currentMode.desc}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <Label className="text-sm font-medium">입력</Label>
              <Button variant="ghost" size="sm" onClick={() => setInput("")} className="h-7 px-2 text-xs text-muted-foreground">
                삭제
              </Button>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="font-mono text-sm flex-1 min-h-[200px] resize-none"
              placeholder={currentMode.placeholder}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between h-9 mb-2">
              <Label className="text-sm font-medium">결과</Label>
              <Button variant="outline" size="sm" onClick={() => copy(output)} disabled={!output}>
                {copied ? "복사됨!" : "복사"}
              </Button>
            </div>
            <Textarea
              value={error || output}
              readOnly
              className={`font-mono text-sm flex-1 min-h-[200px] resize-none bg-muted/50 ${error ? "text-destructive" : ""}`}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
