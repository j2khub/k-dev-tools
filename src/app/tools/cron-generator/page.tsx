"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import cronstrue from "cronstrue/i18n";
import { CronExpressionParser } from "cron-parser";

const presets = [
  { label: "매분", value: "* * * * *" },
  { label: "매시 정각", value: "0 * * * *" },
  { label: "매일 자정", value: "0 0 * * *" },
  { label: "매일 오전 9시", value: "0 9 * * *" },
  { label: "평일 오전 9시", value: "0 9 * * 1-5" },
  { label: "매주 월요일", value: "0 0 * * 1" },
  { label: "매월 1일", value: "0 0 1 * *" },
  { label: "매년 1월 1일", value: "0 0 1 1 *" },
];

export default function CronGeneratorPage() {
  const [expression, setExpression] = useState("0 9 * * 1-5");
  const { copy, copied } = useCopyToClipboard();

  const description = useMemo(() => {
    try {
      return cronstrue.toString(expression, { locale: "ko", use24HourTimeFormat: true });
    } catch {
      // fallback to English if Korean locale fails
      try {
        return cronstrue.toString(expression, { use24HourTimeFormat: true });
      } catch {
        return null;
      }
    }
  }, [expression]);

  const nextRuns = useMemo(() => {
    try {
      const interval = CronExpressionParser.parse(expression);
      const runs: string[] = [];
      for (let i = 0; i < 5; i++) {
        const next = interval.next();
        runs.push(next.toDate().toLocaleString("ko-KR", {
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          hour12: false,
        }));
      }
      return runs;
    } catch {
      return null;
    }
  }, [expression]);

  const fields = expression.split(" ");
  const fieldLabels = ["분 (0-59)", "시 (0-23)", "일 (1-31)", "월 (1-12)", "요일 (0-7)"];

  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    // Ensure we always have 5 fields
    while (newFields.length < 5) newFields.push("*");
    newFields[index] = value;
    setExpression(newFields.slice(0, 5).join(" "));
  };

  return (
    <ToolLayout title="Cron 표현식 생성기" description="Cron 표현식을 생성하고 다음 실행 시간을 확인합니다">
      {/* Cron expression input */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between h-9 mb-2">
            <Label className="text-sm font-medium">Cron 표현식</Label>
            <Button variant="outline" size="sm" onClick={() => copy(expression)}>
              {copied ? "복사됨!" : "복사"}
            </Button>
          </div>
          <Input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="font-mono text-lg"
            placeholder="* * * * *"
          />
        </div>

        {/* Field editors */}
        <div className="grid grid-cols-5 gap-2">
          {fieldLabels.map((fl, i) => (
            <div key={fl}>
              <Label className="text-xs text-muted-foreground">{fl}</Label>
              <Input
                value={fields[i] || "*"}
                onChange={(e) => updateField(i, e.target.value)}
                className="font-mono text-sm mt-1"
              />
            </div>
          ))}
        </div>

        {/* Presets */}
        <div>
          <Label className="text-sm font-medium mb-2 block">빠른 선택</Label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <Button
                key={p.value}
                variant="outline"
                size="sm"
                onClick={() => setExpression(p.value)}
                className={expression === p.value ? "border-primary bg-primary/10" : ""}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Description */}
        {description ? (
          <div className="p-4 rounded-lg border bg-muted/50">
            <Label className="text-sm font-medium mb-1 block">설명</Label>
            <p className="text-base">{description}</p>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
            <p className="text-sm text-destructive">유효하지 않은 Cron 표현식입니다</p>
          </div>
        )}

        {/* Next runs */}
        {nextRuns && (
          <div className="p-4 rounded-lg border bg-muted/50">
            <Label className="text-sm font-medium mb-2 block">다음 실행 시간 (5회)</Label>
            <ul className="space-y-1">
              {nextRuns.map((run, i) => (
                <li key={i} className="text-sm font-mono">{run}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
