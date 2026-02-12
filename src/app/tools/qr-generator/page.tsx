"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function QrGeneratorPage() {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim() || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, text, {
      width: size,
      margin: 2,
      errorCorrectionLevel: errorLevel,
      color: { dark: "#000000", light: "#ffffff" },
    }).catch(() => {});
  }, [text, size, errorLevel]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <ToolLayout title="QR 코드 생성기" description="텍스트나 URL을 QR 코드로 생성합니다">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between h-9 mb-2">
              <Label className="text-sm font-medium">텍스트 또는 URL</Label>
              <Button variant="ghost" size="sm" onClick={() => setText("")} className="h-7 px-2 text-xs text-muted-foreground">
                삭제
              </Button>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="font-mono text-sm min-h-[100px] resize-none"
              placeholder="QR 코드로 변환할 내용을 입력하세요..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">크기 (px)</Label>
              <Input
                type="number"
                value={size}
                onChange={(e) => setSize(Number(e.target.value) || 256)}
                min={128}
                max={1024}
                step={64}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">오류 보정 수준</Label>
              <div className="flex gap-1">
                {(["L", "M", "Q", "H"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setErrorLevel(level)}
                    className={`flex-1 px-2 py-2 text-sm rounded-md border ${
                      errorLevel === level
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>L: ~7% 복구 | M: ~15% 복구 | Q: ~25% 복구 | H: ~30% 복구</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 border rounded-lg bg-white">
            <canvas ref={canvasRef} />
          </div>
          <Button onClick={handleDownload} disabled={!text.trim()}>
            PNG 다운로드
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
