"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Upload, Download, RotateCcw, Trash2, Plus } from "lucide-react";

interface BlurRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function ImageBlurPage() {
  const [image, setImage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [blurStrength, setBlurStrength] = useState(5);
  const [rects, setRects] = useState<BlurRect[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState<BlurRect | null>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [magnifier, setMagnifier] = useState<{ x: number; y: number } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const MAGNIFIER_SIZE = 150;
  const MAGNIFIER_ZOOM = 3;

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setImgSize({ w: img.width, h: img.height });
        setImage(src);
        setRects([]);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) loadImage(file);
    },
    [loadImage]
  );

  // canvas에 이미지 + 블러 영역 렌더
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d")!;
    const container = canvas.parentElement!;
    const containerW = container.clientWidth;

    const scale = Math.min(1, containerW / img.width);
    const displayW = Math.round(img.width * scale);
    const displayH = Math.round(img.height * scale);

    canvas.width = displayW;
    canvas.height = displayH;
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;

    ctx.drawImage(img, 0, 0, displayW, displayH);

    const allRects = [...rects, ...(currentRect ? [currentRect] : [])];
    for (const rect of allRects) {
      const rx = rect.x * scale;
      const ry = rect.y * scale;
      const rw = rect.w * scale;
      const rh = rect.h * scale;

      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();

      ctx.filter = `blur(${blurStrength}px)`;
      ctx.drawImage(img, 0, 0, displayW, displayH);
      ctx.filter = "none";
      ctx.restore();

      // 선택 영역 테두리
      ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.setLineDash([]);
    }
  }, [rects, currentRect, blurStrength]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // 돋보기 렌더
  useEffect(() => {
    const magCanvas = magnifierCanvasRef.current;
    const img = imgRef.current;
    if (!magCanvas || !img || !magnifier) return;

    const ctx = magCanvas.getContext("2d")!;
    const size = MAGNIFIER_SIZE;
    magCanvas.width = size;
    magCanvas.height = size;

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    // 원본 이미지에서 확대 영역 계산
    const srcSize = size / MAGNIFIER_ZOOM;
    ctx.drawImage(
      img,
      magnifier.x - srcSize / 2,
      magnifier.y - srcSize / 2,
      srcSize,
      srcSize,
      0,
      0,
      size,
      size
    );

    // 십자선
    ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();

    ctx.restore();

    // 테두리
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [magnifier]);

  // 캔버스 크기 맞춤 (리사이즈) + Ctrl+Z 되돌리기
  useEffect(() => {
    if (!image) return;
    const handleResize = () => renderCanvas();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        setRects((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [image, renderCanvas]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const img = imgRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(1, canvas.parentElement!.clientWidth / img.width);
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const getTouchCoords = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const img = imgRef.current!;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scale = Math.min(1, canvas.parentElement!.clientWidth / img.width);
    return {
      x: (touch.clientX - rect.left) / scale,
      y: (touch.clientY - rect.top) / scale,
    };
  };

  const onPointerDown = (x: number, y: number) => {
    setDrawing(true);
    setCurrentRect({ x, y, w: 0, h: 0 });
  };

  const onPointerMove = (x: number, y: number) => {
    if (!drawing || !currentRect) return;
    setCurrentRect({
      ...currentRect,
      w: x - currentRect.x,
      h: y - currentRect.y,
    });
  };

  const onPointerUp = () => {
    if (!drawing || !currentRect) return;
    setDrawing(false);
    // 너무 작은 영역은 무시 (5px 미만)
    if (Math.abs(currentRect.w) > 5 && Math.abs(currentRect.h) > 5) {
      // 음수 크기 정규화
      const normalized: BlurRect = {
        x: currentRect.w < 0 ? currentRect.x + currentRect.w : currentRect.x,
        y: currentRect.h < 0 ? currentRect.y + currentRect.h : currentRect.y,
        w: Math.abs(currentRect.w),
        h: Math.abs(currentRect.h),
      };
      setRects((prev) => [...prev, normalized]);
    }
    setCurrentRect(null);
  };

  const handleDownload = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(img, 0, 0);

    for (const rect of rects) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();
      ctx.filter = `blur(${blurStrength}px)`;
      ctx.drawImage(img, 0, 0);
      ctx.filter = "none";
      ctx.restore();
    }

    const link = document.createElement("a");
    link.download = "blurred.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const removeLastRect = () => {
    setRects((prev) => prev.slice(0, -1));
  };

  const clearRects = () => {
    setRects([]);
  };

  return (
    <ToolLayout title="이미지 블러" description="이미지의 원하는 영역을 드래그하여 블러(모자이크) 처리합니다">
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) loadImage(file);
          }}
        />

        {!image ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`w-full flex flex-col items-center justify-center gap-3 p-12 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
              dragging ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
            }`}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              이미지를 드래그하거나 클릭하여 업로드
            </p>
          </button>
        ) : (
          <>
            {/* 컨트롤 */}
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                블러 강도
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={1}
                  value={blurStrength}
                  onChange={(e) => setBlurStrength(Number(e.target.value))}
                  className="w-28"
                />
                <span className="text-xs text-muted-foreground tabular-nums w-8">{blurStrength}px</span>
              </label>

              <span className="text-xs text-muted-foreground">
                영역 {rects.length}개
              </span>

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={removeLastRect}
                  disabled={rects.length === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-md hover:bg-accent transition-colors disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> 되돌리기
                </button>
                <button
                  type="button"
                  onClick={clearRects}
                  disabled={rects.length === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-md hover:bg-accent transition-colors disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" /> 초기화
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setRects([]);
                    imgRef.current = null;
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-md hover:bg-accent transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> 새 이미지
                </button>
              </div>
            </div>

            {/* 캔버스 */}
            <div className="relative border rounded-lg overflow-hidden bg-muted/30">
              <canvas
                ref={canvasRef}
                className="block mx-auto cursor-crosshair touch-none"
                onMouseDown={(e) => {
                  const { x, y } = getCanvasCoords(e);
                  onPointerDown(x, y);
                }}
                onMouseMove={(e) => {
                  const { x, y } = getCanvasCoords(e);
                  onPointerMove(x, y);
                  setMagnifier({ x, y });
                }}
                onMouseUp={onPointerUp}
                onMouseLeave={() => {
                  onPointerUp();
                  setMagnifier(null);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const { x, y } = getTouchCoords(e);
                  onPointerDown(x, y);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const { x, y } = getTouchCoords(e);
                  onPointerMove(x, y);
                }}
                onTouchEnd={onPointerUp}
              />
              {magnifier && canvasRef.current && (() => {
                const canvas = canvasRef.current!;
                const img = imgRef.current!;
                const scale = Math.min(1, canvas.parentElement!.clientWidth / img.width);
                const cx = magnifier.x * scale;
                const cy = magnifier.y * scale;
                // 돋보기 위치: 커서 우상단, 캔버스 밖으로 나가면 반대편
                const offset = 20;
                let left = cx + offset;
                let top = cy - MAGNIFIER_SIZE - offset;
                if (left + MAGNIFIER_SIZE > canvas.width) left = cx - MAGNIFIER_SIZE - offset;
                if (top < 0) top = cy + offset;
                return (
                  <canvas
                    ref={magnifierCanvasRef}
                    width={MAGNIFIER_SIZE}
                    height={MAGNIFIER_SIZE}
                    className="absolute pointer-events-none rounded-full shadow-lg"
                    style={{
                      left: `${Math.max(0, left)}px`,
                      top: `${Math.max(0, top)}px`,
                      width: MAGNIFIER_SIZE,
                      height: MAGNIFIER_SIZE,
                    }}
                  />
                );
              })()}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              블러 처리할 영역을 드래그하세요 · {imgSize.w} x {imgSize.h}px
            </p>

            {/* 다운로드 */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={rects.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <Download className="h-4 w-4" /> 블러 적용된 이미지 다운로드
            </button>
          </>
        )}
      </Card>
    </ToolLayout>
  );
}
