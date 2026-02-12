"use client";

import { useState, useRef, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download } from "lucide-react";

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [keepRatio, setKeepRatio] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }, []);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalSize({ w: img.width, h: img.height });
        setWidth(img.width);
        setHeight(img.height);
        setImage(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (v: string) => {
    const w = parseInt(v) || 0;
    setWidth(w);
    if (keepRatio && originalSize.w > 0) {
      setHeight(Math.round((w / originalSize.w) * originalSize.h));
    }
  };

  const handleHeightChange = (v: string) => {
    const h = parseInt(v) || 0;
    setHeight(h);
    if (keepRatio && originalSize.h > 0) {
      setWidth(Math.round((h / originalSize.h) * originalSize.w));
    }
  };

  const handleDownload = () => {
    if (!image) return;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      const link = document.createElement("a");
      link.download = `resized_${width}x${height}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = image;
  };

  return (
    <ToolLayout
      title="이미지 리사이즈"
      description="이미지 크기를 원하는 비율이나 픽셀로 조절합니다"
    >
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {!image ? (
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`w-full py-12 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center gap-2 text-muted-foreground ${dragging ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">이미지를 선택하거나 드래그하여 놓으세요</span>
          </button>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">너비</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-24 px-2 py-1.5 text-sm border rounded-md bg-transparent font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">높이</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-24 px-2 py-1.5 text-sm border rounded-md bg-transparent font-mono"
                />
              </div>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={keepRatio}
                  onChange={(e) => setKeepRatio(e.target.checked)}
                  className="rounded"
                />
                비율 유지
              </label>
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5 mr-1" />
                다운로드
              </Button>
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                다른 이미지
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              원본: {originalSize.w} × {originalSize.h}px → 변경: {width} × {height}px
            </div>
            <div className="border rounded-lg overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=')]">
              <img
                src={image}
                alt="미리보기"
                className="max-w-full max-h-[400px] object-contain mx-auto"
              />
            </div>
          </>
        )}
      </Card>
    </ToolLayout>
  );
}
