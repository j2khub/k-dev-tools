"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FLAGS = [
  { key: "g", label: "global" },
  { key: "i", label: "대소문자 무시" },
  { key: "m", label: "멀티라인" },
  { key: "s", label: "dotAll" },
];

const PRESETS = [
  { label: "이메일", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
  { label: "URL", pattern: "https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\w\\-.,@?^=%&:/~+#]*" },
  { label: "전화번호", pattern: "01[016789]-?\\d{3,4}-?\\d{4}" },
  { label: "IPv4", pattern: "\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b" },
  { label: "HEX 색상", pattern: "#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b" },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");

  const toggleFlag = (flag: string) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.replace(flag, "") : prev + flag
    );
  };

  const matches = useMemo(() => {
    if (!pattern || !testString) return [];
    try {
      const regex = new RegExp(pattern, flags);
      const results: { start: number; end: number; match: string }[] = [];
      let m;
      if (flags.includes("g")) {
        while ((m = regex.exec(testString)) !== null) {
          results.push({ start: m.index, end: m.index + m[0].length, match: m[0] });
          if (!m[0]) break;
        }
      } else {
        m = regex.exec(testString);
        if (m) results.push({ start: m.index, end: m.index + m[0].length, match: m[0] });
      }
      return results;
    } catch {
      return [];
    }
  }, [pattern, flags, testString]);

  const error = useMemo(() => {
    if (!pattern) return "";
    try {
      new RegExp(pattern, flags);
      return "";
    } catch (e) {
      return e instanceof Error ? e.message : "유효하지 않은 정규식입니다";
    }
  }, [pattern, flags]);

  const highlightedText = useMemo(() => {
    if (!testString || matches.length === 0) return null;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    matches.forEach((m, i) => {
      if (m.start > lastIndex) {
        parts.push(testString.slice(lastIndex, m.start));
      }
      parts.push(
        <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">
          {m.match}
        </mark>
      );
      lastIndex = m.end;
    });
    if (lastIndex < testString.length) {
      parts.push(testString.slice(lastIndex));
    }
    return parts;
  }, [testString, matches]);

  return (
    <ToolLayout
      title="Regex 테스터"
      description="정규식을 실시간으로 테스트하고 매칭 결과를 확인합니다"
    >
      <Card className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">정규식 패턴</label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center border rounded-md px-3 bg-transparent">
              <span className="text-muted-foreground">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="패턴 입력..."
                className="flex-1 py-1.5 px-1 text-sm font-mono bg-transparent outline-none"
              />
              <span className="text-muted-foreground">/{flags}</span>
            </div>
          </div>
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {FLAGS.map((f) => (
            <button
              key={f.key}
              onClick={() => toggleFlag(f.key)}
              className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                flags.includes(f.key)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {f.key} - {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">프리셋:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPattern(p.pattern)}
              className="text-xs px-2 py-0.5 rounded border hover:bg-accent transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between h-9 mb-2">
            <label className="text-sm font-medium">테스트 문자열</label>
            <Button variant="ghost" size="sm" onClick={() => setTestString("")} className="h-7 px-2 text-xs text-muted-foreground">
              삭제
            </Button>
          </div>
          <Textarea
            placeholder="정규식을 테스트할 문자열을 입력하세요"
            className="font-mono text-sm min-h-[150px] resize-none"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
          />
        </div>

        {matches.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium">매칭 결과</label>
              <Badge variant="secondary">{matches.length}개 매칭</Badge>
            </div>
            <div className="px-3 py-3 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap">
              {highlightedText}
            </div>
          </div>
        )}
      </Card>
    </ToolLayout>
  );
}
