"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import {
  Upload,
  Crosshair,
  Square,
  Trash2,
  RotateCcw,
  Plus,
  Copy,
  Check,
} from "lucide-react";

type Mode = "point" | "rect";
type CoordUnit = "px" | "%";
type ExportFormat = "json" | "csv" | "css";

interface PointMarker {
  x: number;
  y: number;
  color: string;
}

interface RectMarker {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Marker =
  | { type: "point"; data: PointMarker }
  | { type: "rect"; data: RectMarker };

export default function ImageCoordinatesPage() {
  const [image, setImage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<Mode>("point");
  const [unit, setUnit] = useState<CoordUnit>("px");
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState<RectMarker | null>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [magnifier, setMagnifier] = useState<{
    x: number;
    y: number;
    color: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(
    null
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const MAGNIFIER_SIZE = 150;
  const MAGNIFIER_ZOOM = 4;

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
        setMarkers([]);

        // 원본 캔버스에 이미지 그려두기 (색상 추출용)
        const offscreen = document.createElement("canvas");
        offscreen.width = img.width;
        offscreen.height = img.height;
        const ctx = offscreen.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        originalCanvasRef.current = offscreen;
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

  const getPixelColor = useCallback((x: number, y: number): string => {
    const offscreen = originalCanvasRef.current;
    if (!offscreen) return "#000000";
    const ctx = offscreen.getContext("2d")!;
    const px = Math.round(Math.min(Math.max(x, 0), offscreen.width - 1));
    const py = Math.round(Math.min(Math.max(y, 0), offscreen.height - 1));
    const [r, g, b] = ctx.getImageData(px, py, 1, 1).data;
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }, []);

  const getScale = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return 1;
    return Math.min(1, canvas.parentElement!.clientWidth / img.width);
  }, []);

  // 캔버스 렌더링
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

    // 마커 렌더링
    for (let i = 0; i < markers.length; i++) {
      const m = markers[i];
      if (m.type === "point") {
        const px = m.data.x * scale;
        const py = m.data.y * scale;

        // 십자선
        ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px - 10, py);
        ctx.lineTo(px + 10, py);
        ctx.moveTo(px, py - 10);
        ctx.lineTo(px, py + 10);
        ctx.stroke();

        // 원
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = m.data.color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 번호 라벨
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        const label = `${i + 1}`;
        const tw = ctx.measureText(label).width;
        ctx.fillRect(px + 8, py - 16, tw + 6, 16);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px monospace";
        ctx.fillText(label, px + 11, py - 4);
      } else {
        const rx = m.data.x * scale;
        const ry = m.data.y * scale;
        const rw = m.data.w * scale;
        const rh = m.data.h * scale;

        ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.setLineDash([]);

        // 번호 라벨
        ctx.fillStyle = "rgba(59, 130, 246, 0.85)";
        const label = `${i + 1}`;
        const tw = ctx.measureText(label).width;
        ctx.fillRect(rx, ry - 18, tw + 8, 18);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px monospace";
        ctx.fillText(label, rx + 4, ry - 5);
      }
    }

    // 현재 드래그 중인 영역
    if (currentRect) {
      const rx = currentRect.x * scale;
      const ry = currentRect.y * scale;
      const rw = currentRect.w * scale;
      const rh = currentRect.h * scale;

      ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.setLineDash([]);
    }
  }, [markers, currentRect]);

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

    ctx.imageSmoothingEnabled = false;
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

    // 격자선 (픽셀 단위)
    ctx.strokeStyle = "rgba(128,128,128,0.2)";
    ctx.lineWidth = 0.5;
    const pixelSize = MAGNIFIER_ZOOM;
    for (let i = pixelSize; i < size; i += pixelSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }

    // 중심 십자선
    ctx.strokeStyle = "rgba(239, 68, 68, 0.7)";
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
    ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [magnifier]);

  // 리사이즈 + Ctrl+Z
  useEffect(() => {
    if (!image) return;
    const handleResize = () => renderCanvas();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        setMarkers((prev) => prev.slice(0, -1));
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

  const handleCanvasClick = (x: number, y: number) => {
    if (mode !== "point") return;
    const rx = Math.round(x);
    const ry = Math.round(y);
    const color = getPixelColor(rx, ry);
    setMarkers((prev) => [
      ...prev,
      { type: "point", data: { x: rx, y: ry, color } },
    ]);
  };

  const onPointerDown = (x: number, y: number) => {
    if (mode !== "rect") return;
    setDrawing(true);
    setCurrentRect({ x, y, w: 0, h: 0 });
  };

  const onPointerMove = (x: number, y: number) => {
    if (mode !== "rect" || !drawing || !currentRect) return;
    setCurrentRect({
      ...currentRect,
      w: x - currentRect.x,
      h: y - currentRect.y,
    });
  };

  const onPointerUp = () => {
    if (mode !== "rect" || !drawing || !currentRect) return;
    setDrawing(false);
    if (Math.abs(currentRect.w) > 3 && Math.abs(currentRect.h) > 3) {
      const normalized: RectMarker = {
        x: Math.round(
          currentRect.w < 0 ? currentRect.x + currentRect.w : currentRect.x
        ),
        y: Math.round(
          currentRect.h < 0 ? currentRect.y + currentRect.h : currentRect.y
        ),
        w: Math.round(Math.abs(currentRect.w)),
        h: Math.round(Math.abs(currentRect.h)),
      };
      setMarkers((prev) => [...prev, { type: "rect", data: normalized }]);
    }
    setCurrentRect(null);
  };

  // 좌표 포맷팅
  const fmtVal = (v: number, axis: "x" | "y") => {
    if (unit === "%") {
      const base = axis === "x" ? imgSize.w : imgSize.h;
      return `${((v / base) * 100).toFixed(2)}%`;
    }
    return `${v}px`;
  };

  const fmtPoint = (p: PointMarker) =>
    `(${fmtVal(p.x, "x")}, ${fmtVal(p.y, "y")})`;

  const fmtRect = (r: RectMarker) =>
    `(${fmtVal(r.x, "x")}, ${fmtVal(r.y, "y")}, ${fmtVal(r.w, "x")} × ${fmtVal(r.h, "y")})`;

  // 내보내기 텍스트 생성
  const getExportText = (format: ExportFormat): string => {
    if (markers.length === 0) return "";

    if (format === "json") {
      const data = markers.map((m, i) => {
        if (m.type === "point") {
          const p = m.data;
          return unit === "%"
            ? {
                index: i + 1,
                type: "point",
                x: `${((p.x / imgSize.w) * 100).toFixed(2)}%`,
                y: `${((p.y / imgSize.h) * 100).toFixed(2)}%`,
                color: p.color,
              }
            : { index: i + 1, type: "point", x: p.x, y: p.y, color: p.color };
        } else {
          const r = m.data;
          return unit === "%"
            ? {
                index: i + 1,
                type: "rect",
                x: `${((r.x / imgSize.w) * 100).toFixed(2)}%`,
                y: `${((r.y / imgSize.h) * 100).toFixed(2)}%`,
                w: `${((r.w / imgSize.w) * 100).toFixed(2)}%`,
                h: `${((r.h / imgSize.h) * 100).toFixed(2)}%`,
              }
            : { index: i + 1, type: "rect", x: r.x, y: r.y, w: r.w, h: r.h };
        }
      });
      return JSON.stringify(data, null, 2);
    }

    if (format === "csv") {
      const lines = ["index,type,x,y,w,h,color"];
      markers.forEach((m, i) => {
        if (m.type === "point") {
          const p = m.data;
          const x = unit === "%" ? ((p.x / imgSize.w) * 100).toFixed(2) + "%" : String(p.x);
          const y = unit === "%" ? ((p.y / imgSize.h) * 100).toFixed(2) + "%" : String(p.y);
          lines.push(`${i + 1},point,${x},${y},,,${p.color}`);
        } else {
          const r = m.data;
          const x = unit === "%" ? ((r.x / imgSize.w) * 100).toFixed(2) + "%" : String(r.x);
          const y = unit === "%" ? ((r.y / imgSize.h) * 100).toFixed(2) + "%" : String(r.y);
          const w = unit === "%" ? ((r.w / imgSize.w) * 100).toFixed(2) + "%" : String(r.w);
          const h = unit === "%" ? ((r.h / imgSize.h) * 100).toFixed(2) + "%" : String(r.h);
          lines.push(`${i + 1},rect,${x},${y},${w},${h},`);
        }
      });
      return lines.join("\n");
    }

    // CSS
    const lines: string[] = [];
    markers.forEach((m, i) => {
      if (m.type === "point") {
        const p = m.data;
        const x = unit === "%" ? ((p.x / imgSize.w) * 100).toFixed(2) + "%" : p.x + "px";
        const y = unit === "%" ? ((p.y / imgSize.h) * 100).toFixed(2) + "%" : p.y + "px";
        lines.push(`/* Point ${i + 1} */ background-position: ${x} ${y};`);
      } else {
        const r = m.data;
        const x = unit === "%" ? ((r.x / imgSize.w) * 100).toFixed(2) + "%" : r.x + "px";
        const y = unit === "%" ? ((r.y / imgSize.h) * 100).toFixed(2) + "%" : r.y + "px";
        const w = unit === "%" ? ((r.w / imgSize.w) * 100).toFixed(2) + "%" : r.w + "px";
        const h = unit === "%" ? ((r.h / imgSize.h) * 100).toFixed(2) + "%" : r.h + "px";
        lines.push(
          `/* Rect ${i + 1} */ clip: rect(${y}, calc(${x} + ${w}), calc(${y} + ${h}), ${x});`
        );
      }
    });
    return lines.join("\n");
  };

  const handleCopy = async (format: ExportFormat) => {
    const text = getExportText(format);
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const removeMarker = (index: number) => {
    setMarkers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ToolLayout
      title="이미지 좌표 추출"
      description="이미지에서 클릭 또는 드래그로 좌표를 추출하고 JSON, CSV, CSS 형식으로 내보냅니다"
    >
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
              dragging
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-accent"
            }`}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              이미지를 드래그하거나 클릭하여 업로드
            </p>
          </button>
        ) : (
          <>
            {/* 컨트롤 바 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 모드 토글 */}
              <div className="inline-flex rounded-md border text-sm">
                <button
                  type="button"
                  onClick={() => setMode("point")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-l-md transition-colors ${
                    mode === "point"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  <Crosshair className="h-3.5 w-3.5" /> 포인트
                </button>
                <button
                  type="button"
                  onClick={() => setMode("rect")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-r-md transition-colors ${
                    mode === "rect"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  <Square className="h-3.5 w-3.5" /> 영역
                </button>
              </div>

              {/* 단위 토글 */}
              <div className="inline-flex rounded-md border text-sm">
                <button
                  type="button"
                  onClick={() => setUnit("px")}
                  className={`px-3 py-1.5 rounded-l-md transition-colors ${
                    unit === "px"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  px
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("%")}
                  className={`px-3 py-1.5 rounded-r-md transition-colors ${
                    unit === "%"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  %
                </button>
              </div>

              <span className="text-xs text-muted-foreground">
                {imgSize.w} × {imgSize.h}px · 마커 {markers.length}개
              </span>

              {/* 실시간 좌표 */}
              {hoverCoord && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {fmtVal(Math.round(hoverCoord.x), "x")},{" "}
                  {fmtVal(Math.round(hoverCoord.y), "y")}
                  {magnifier && (
                    <span
                      className="inline-block w-3 h-3 rounded-sm ml-1.5 align-middle border border-border"
                      style={{ backgroundColor: magnifier.color }}
                    />
                  )}
                </span>
              )}

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() =>
                    setMarkers((prev) => prev.slice(0, -1))
                  }
                  disabled={markers.length === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-md hover:bg-accent transition-colors disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> 되돌리기
                </button>
                <button
                  type="button"
                  onClick={() => setMarkers([])}
                  disabled={markers.length === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-md hover:bg-accent transition-colors disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" /> 초기화
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setMarkers([]);
                    imgRef.current = null;
                    originalCanvasRef.current = null;
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
                onClick={(e) => {
                  if (mode === "point") {
                    const { x, y } = getCanvasCoords(e);
                    handleCanvasClick(x, y);
                  }
                }}
                onMouseDown={(e) => {
                  if (mode === "rect") {
                    const { x, y } = getCanvasCoords(e);
                    onPointerDown(x, y);
                  }
                }}
                onMouseMove={(e) => {
                  const { x, y } = getCanvasCoords(e);
                  setHoverCoord({ x, y });
                  if (mode === "rect") onPointerMove(x, y);
                  const color = getPixelColor(Math.round(x), Math.round(y));
                  setMagnifier({ x, y, color });
                }}
                onMouseUp={() => {
                  if (mode === "rect") onPointerUp();
                }}
                onMouseLeave={() => {
                  if (mode === "rect") onPointerUp();
                  setMagnifier(null);
                  setHoverCoord(null);
                }}
                onTouchStart={(e) => {
                  if (mode === "rect") {
                    e.preventDefault();
                    const { x, y } = getTouchCoords(e);
                    onPointerDown(x, y);
                  }
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const { x, y } = getTouchCoords(e);
                  setHoverCoord({ x, y });
                  if (mode === "rect") onPointerMove(x, y);
                }}
                onTouchEnd={() => {
                  if (mode === "rect") onPointerUp();
                  setHoverCoord(null);
                }}
              />
              {magnifier &&
                canvasRef.current &&
                (() => {
                  const canvas = canvasRef.current!;
                  const scale = getScale();
                  const cx = magnifier.x * scale;
                  const cy = magnifier.y * scale;
                  const offset = 20;
                  let left = cx + offset;
                  let top = cy - MAGNIFIER_SIZE - offset;
                  if (left + MAGNIFIER_SIZE > canvas.width)
                    left = cx - MAGNIFIER_SIZE - offset;
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
              {mode === "point"
                ? "클릭하여 좌표를 추출하세요"
                : "드래그하여 영역을 선택하세요"}{" "}
              · Ctrl+Z 되돌리기
            </p>

            {/* 좌표 목록 */}
            {markers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">추출된 좌표</h3>
                  <div className="flex items-center gap-1.5">
                    {(["json", "csv", "css"] as ExportFormat[]).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => handleCopy(fmt)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs border rounded-md hover:bg-accent transition-colors"
                      >
                        {copied ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-md border divide-y">
                  {markers.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-accent/50 group"
                    >
                      <span className="text-muted-foreground tabular-nums w-5">
                        {i + 1}
                      </span>
                      {m.type === "point" ? (
                        <>
                          <span
                            className="w-4 h-4 rounded-sm border border-border shrink-0"
                            style={{ backgroundColor: m.data.color }}
                          />
                          <span className="tabular-nums">
                            {fmtPoint(m.data)}
                          </span>
                          <span className="text-muted-foreground">
                            {m.data.color}
                          </span>
                        </>
                      ) : (
                        <>
                          <Square className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span className="tabular-nums">
                            {fmtRect(m.data)}
                          </span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMarker(i)}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </ToolLayout>
  );
}
