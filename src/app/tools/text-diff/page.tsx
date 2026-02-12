"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { diffChars, diffWords, diffLines } from "diff";

type DiffMode = "line" | "word" | "char";

export default function TextDiffPage() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [mode, setMode] = useState<DiffMode>("line");

  const diffResult = useMemo(() => {
    if (!original && !modified) return [];

    switch (mode) {
      case "char":
        return diffChars(original, modified);
      case "word":
        return diffWords(original, modified);
      case "line":
        return diffLines(original, modified);
      default:
        return [];
    }
  }, [original, modified, mode]);

  const modeLabels = {
    line: "줄 (Line)",
    word: "단어 (Word)",
    char: "글자 (Character)",
  };

  return (
    <ToolLayout
      title="텍스트 Diff 비교"
      description="두 텍스트의 차이점을 비교하여 강조 표시합니다"
    >
      <div className="space-y-6">
        {/* Mode Selection */}
        <div>
          <Label className="mb-2 block">비교 모드</Label>
          <div className="flex gap-2">
            {(["line", "word", "char"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-sm rounded-md border ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                {modeLabels[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Input Textareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-9 flex items-center justify-between">
              <Label htmlFor="original">원본 (Original)</Label>
              <Button variant="ghost" size="sm" onClick={() => setOriginal("")} className="h-7 px-2 text-xs text-muted-foreground">
                삭제
              </Button>
            </div>
            <Textarea
              id="original"
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="원본 텍스트를 입력하세요..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <div className="h-9 flex items-center justify-between">
              <Label htmlFor="modified">수정본 (Modified)</Label>
              <Button variant="ghost" size="sm" onClick={() => setModified("")} className="h-7 px-2 text-xs text-muted-foreground">
                삭제
              </Button>
            </div>
            <Textarea
              id="modified"
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              placeholder="수정된 텍스트를 입력하세요..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
        </div>

        {/* Diff Results */}
        <div className="space-y-2">
          <Label className="h-9 flex items-center">비교 결과</Label>
          <div className="border rounded-md p-4 bg-muted/30 min-h-[200px]">
            {diffResult.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                텍스트를 입력하면 차이점이 표시됩니다.
              </p>
            ) : mode === "line" ? (
              <pre className="font-mono text-sm whitespace-pre-wrap break-words">
                {diffResult.map((part, index) => {
                  if (part.added) {
                    return (
                      <div
                        key={index}
                        className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                      >
                        {part.value.split("\n").map((line, lineIndex) => {
                          if (
                            lineIndex ===
                              part.value.split("\n").length - 1 &&
                            line === ""
                          ) {
                            return null;
                          }
                          return (
                            <div key={lineIndex}>
                              + {line}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  if (part.removed) {
                    return (
                      <div
                        key={index}
                        className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                      >
                        {part.value.split("\n").map((line, lineIndex) => {
                          if (
                            lineIndex ===
                              part.value.split("\n").length - 1 &&
                            line === ""
                          ) {
                            return null;
                          }
                          return (
                            <div key={lineIndex}>
                              - {line}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return (
                    <div key={index}>
                      {part.value.split("\n").map((line, lineIndex) => {
                        if (
                          lineIndex === part.value.split("\n").length - 1 &&
                          line === ""
                        ) {
                          return null;
                        }
                        return (
                          <div key={lineIndex}>
                            {"  "}
                            {line}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </pre>
            ) : (
              <div className="font-mono text-sm whitespace-pre-wrap break-words">
                {diffResult.map((part, index) => {
                  if (part.added) {
                    return (
                      <span
                        key={index}
                        className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                      >
                        {part.value}
                      </span>
                    );
                  }
                  if (part.removed) {
                    return (
                      <span
                        key={index}
                        className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                      >
                        {part.value}
                      </span>
                    );
                  }
                  return <span key={index}>{part.value}</span>;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
