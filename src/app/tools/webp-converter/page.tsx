"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download } from "lucide-react";

export default function WebpConverter() {
  const [images, setImages] = useState<{ name: string; src: string; webp: string | null }[]>([]);
  const [quality, setQuality] = useState(80);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }, [quality]);

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        convertToWebp(src, quality).then((webp) => {
          setImages((prev) => [...prev, { name: file.name, src, webp }]);
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const convertToWebp = (src: string, q: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/webp", q / 100));
      };
      img.src = src;
    });
  };

  const handleDownload = (webp: string, name: string) => {
    const link = document.createElement("a");
    link.download = name.replace(/\.[^.]+$/, ".webp");
    link.href = webp;
    link.click();
  };

  return (
    <ToolLayout
      title="WebP 변환기"
      description="이미지를 WebP 포맷으로 변환합니다"
    >
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">품질</label>
            <input
              type="range"
              min={1}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm font-mono w-10">{quality}%</span>
          </div>
          <Button size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-3.5 w-3.5 mr-1" />
            이미지 선택
          </Button>
          {images.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setImages([])}>
              초기화
            </Button>
          )}
        </div>

        {images.length === 0 ? (
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`w-full py-12 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center gap-2 text-muted-foreground ${dragging ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">이미지를 선택하거나 드래그하여 놓으세요 (여러 개 가능)</span>
          </button>
        ) : (
          <div className="space-y-2">
            {images.map((img, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 bg-muted rounded-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={img.src}
                    alt={img.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <span className="text-sm truncate">{img.name}</span>
                </div>
                {img.webp && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(img.webp!, img.name)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    WebP
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          모든 변환은 브라우저에서 처리됩니다. 이미지가 서버로 전송되지 않습니다.
        </p>
      </Card>
    </ToolLayout>
  );
}
