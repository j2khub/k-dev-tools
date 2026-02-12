"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

async function generateHash(
  text: string,
  algorithm: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const algorithms = [
  { label: "SHA-256", value: "SHA-256" },
  { label: "SHA-512", value: "SHA-512" },
  { label: "SHA-1", value: "SHA-1" },
];

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const { copied, copy } = useCopyToClipboard();
  const [copiedAlgo, setCopiedAlgo] = useState("");

  const handleInput = async (value: string) => {
    setInput(value);
    if (!value) {
      setHashes({});
      return;
    }
    const results: Record<string, string> = {};
    for (const algo of algorithms) {
      results[algo.value] = await generateHash(value, algo.value);
    }
    setHashes(results);
  };

  const handleCopy = (algo: string, hash: string) => {
    copy(hash);
    setCopiedAlgo(algo);
    setTimeout(() => setCopiedAlgo(""), 2000);
  };

  return (
    <ToolLayout
      title="해시 생성기"
      description="SHA-256, SHA-512, MD5 해시를 생성합니다"
    >
      <Card className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">텍스트 입력</label>
          <Textarea
            placeholder="해시를 생성할 텍스트를 입력하세요"
            className="font-mono text-sm min-h-[120px] resize-none"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
          />
        </div>
        {Object.keys(hashes).length > 0 && (
          <div className="space-y-3">
            {algorithms.map((algo) => (
              <div key={algo.value}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">{algo.label}</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(algo.value, hashes[algo.value])}
                  >
                    {copiedAlgo === algo.value ? (
                      <Check className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    {copiedAlgo === algo.value ? "복사됨" : "복사"}
                  </Button>
                </div>
                <div className="px-3 py-2 bg-muted rounded-md font-mono text-xs break-all">
                  {hashes[algo.value]}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </ToolLayout>
  );
}
