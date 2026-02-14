"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download, RotateCcw } from "lucide-react";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCompress() {
  const [original, setOriginal] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressed, setCompressed] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [progress, setProgress] = useState(0);
  const [compressing, setCompressing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) loadFile(file);
  }, []);

  const loadFile = (file: File) => {
    setOriginal(file);
    setCompressed(null);
    setCompressedUrl(null);
    setProgress(0);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleCompress = async () => {
    if (!original) return;
    setCompressing(true);
    setProgress(0);
    try {
      const { default: imageCompression } = await import("browser-image-compression");
      const result = await imageCompression(original, {
        maxSizeMB: 10,
        maxWidthOrHeight: maxWidth,
        initialQuality: quality / 100,
        useWebWorker: true,
        onProgress: (p) => setProgress(p),
      });
      setCompressed(result);
      setCompressedUrl(URL.createObjectURL(result));
    } finally {
      setCompressing(false);
      setProgress(100);
    }
  };

  const handleDownload = () => {
    if (!compressed || !compressedUrl) return;
    const ext = compressed.type.split("/")[1] || "jpg";
    const name = original?.name.replace(/\.[^.]+$/, "") ?? "image";
    const a = document.createElement("a");
    a.href = compressedUrl;
    a.download = `${name}_compressed.${ext}`;
    a.click();
  };

  const reset = () => {
    setOriginal(null);
    setPreview(null);
    setCompressed(null);
    setCompressedUrl(null);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  const ratio =
    original && compressed
      ? ((1 - compressed.size / original.size) * 100).toFixed(1)
      : null;

  return (
    <ToolLayout
      title="이미지 압축"
      description="이미지 용량을 줄입니다. 브라우저에서 처리되어 서버로 전송되지 않습니다"
    >
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
        />

        {!original ? (
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`w-full py-12 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center gap-2 text-muted-foreground ${
              dragging ? "border-primary bg-primary/5" : "hover:bg-accent"
            }`}
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">
              이미지를 선택하거나 드래그하여 놓으세요
            </span>
          </button>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium shrink-0">품질</label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-28"
                />
                <span className="text-sm font-mono w-10 text-right">
                  {quality}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium shrink-0">최대 폭</label>
                <select
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  className="px-2 py-1.5 text-sm border rounded-md bg-transparent"
                >
                  <option value={640}>640px</option>
                  <option value={1024}>1024px</option>
                  <option value={1280}>1280px</option>
                  <option value={1920}>1920px</option>
                  <option value={2560}>2560px</option>
                  <option value={3840}>3840px</option>
                  <option value={99999}>원본 유지</option>
                </select>
              </div>
              <Button
                size="sm"
                onClick={handleCompress}
                disabled={compressing}
              >
                {compressing ? `압축 중… ${progress}%` : "압축하기"}
              </Button>
              {compressed && (
                <Button size="sm" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5 mr-1" />
                  다운로드
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                초기화
              </Button>
            </div>

            {/* Progress bar */}
            {compressing && (
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Size comparison */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">원본: </span>
                <span className="font-medium">
                  {formatSize(original.size)}
                </span>
              </div>
              {compressed && (
                <>
                  <div>
                    <span className="text-muted-foreground">압축: </span>
                    <span className="font-medium">
                      {formatSize(compressed.size)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">절감: </span>
                    <span
                      className={`font-medium ${
                        Number(ratio) > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500"
                      }`}
                    >
                      {Number(ratio) > 0 ? `-${ratio}%` : `+${Math.abs(Number(ratio))}%`}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">원본</p>
                <div className="border rounded-lg overflow-hidden bg-muted/30">
                  <img
                    src={preview!}
                    alt="원본"
                    className="max-w-full max-h-[300px] object-contain mx-auto"
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {compressed ? "압축 결과" : "압축 전"}
                </p>
                <div className="border rounded-lg overflow-hidden bg-muted/30">
                  {compressedUrl ? (
                    <img
                      src={compressedUrl}
                      alt="압축 결과"
                      className="max-w-full max-h-[300px] object-contain mx-auto"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                      압축하기를 눌러주세요
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </ToolLayout>
  );
}
