"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check, RefreshCw } from "lucide-react";

const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

const SENTENCES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
  "Nulla facilisi morbi tempus iaculis urna id volutpat lacus.",
  "Viverra accumsan in nisl nisi scelerisque eu ultrices vitae auctor.",
  "Eget nulla facilisi etiam dignissim diam quis enim lobortis.",
  "Amet consectetur adipiscing elit pellentesque habitant morbi tristique senectus.",
  "Turpis egestas integer eget aliquet nibh praesent tristique magna.",
  "Pellentesque habitant morbi tristique senectus et netus et malesuada fames.",
  "Amet volutpat consequat mauris nunc congue nisi vitae suscipit tellus.",
];

function generateParagraph(): string {
  const count = 4 + Math.floor(Math.random() * 4);
  const shuffled = [...SENTENCES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).join(" ");
}

export default function LoremIpsum() {
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const generate = useCallback(() => {
    const paragraphs: string[] = [];
    for (let i = 0; i < count; i++) {
      if (i === 0 && startWithLorem) {
        paragraphs.push(LOREM);
      } else {
        paragraphs.push(generateParagraph());
      }
    }
    setOutput(paragraphs.join("\n\n"));
  }, [count, startWithLorem]);

  useState(() => {
    generate();
  });

  return (
    <ToolLayout
      title="Lorem Ipsum 생성기"
      description="더미 텍스트를 원하는 분량만큼 생성합니다"
    >
      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">단락 수</label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) =>
                setCount(Math.min(20, Math.max(1, Number(e.target.value))))
              }
              className="w-20 px-2 py-1.5 text-sm border rounded-md bg-transparent"
            />
          </div>
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="rounded"
            />
            Lorem Ipsum으로 시작
          </label>
          <Button size="sm" onClick={generate}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            생성
          </Button>
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
          className="font-mono text-sm min-h-[300px] resize-none"
          value={output}
          readOnly
        />
      </Card>
    </ToolLayout>
  );
}
