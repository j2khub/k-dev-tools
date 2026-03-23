"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import {
  Upload,
  Camera,
  CameraOff,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

interface ScanResult {
  data: string;
  isUrl: boolean;
}

export default function QrReaderPage() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const isUrl = (text: string) => {
    try {
      const u = new URL(text);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const decodeFromImageData = useCallback(
    async (imageData: ImageData): Promise<string | null> => {
      const jsQR = (await import("jsqr")).default;
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      return code?.data ?? null;
    },
    []
  );

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;

      const url = URL.createObjectURL(file);
      setImagePreview(url);

      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const data = await decodeFromImageData(imageData);
        if (data) {
          setResult({ data, isUrl: isUrl(data) });
        } else {
          setResult(null);
          alert("QR 코드를 찾을 수 없습니다.");
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    },
    [decodeFromImageData]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // 카메라 스캔 루프
  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const data = await decodeFromImageData(imageData);
    if (data) {
      setResult({ data, isUrl: isUrl(data) });
      stopCamera();
      return;
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [decodeFromImageData]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setResult(null);
    setImagePreview(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch {
      setCameraError("카메라 접근이 거부되었거나 사용할 수 없습니다.");
    }
  }, [scanFrame]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.data);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = () => {
    stopCamera();
    setResult(null);
    setImagePreview(null);
    setCameraError(null);
  };

  return (
    <ToolLayout
      title="QR 코드 리더"
      description="이미지 업로드 또는 카메라로 QR 코드를 스캔합니다"
    >
      <Card className="p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              stopCamera();
              handleFile(file);
            }
          }}
        />

        {/* 입력 영역 */}
        {!cameraActive && !imagePreview && (
          <div className="space-y-3">
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
                QR 코드 이미지를 드래그하거나 클릭하여 업로드
              </p>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">또는</span>
              <div className="flex-1 border-t" />
            </div>

            <button
              type="button"
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm border rounded-lg hover:bg-accent transition-colors"
            >
              <Camera className="h-4 w-4" /> 카메라로 스캔
            </button>

            {cameraError && (
              <p className="text-xs text-destructive text-center">
                {cameraError}
              </p>
            )}
          </div>
        )}

        {/* 카메라 뷰 */}
        {cameraActive && (
          <div className="space-y-3">
            <div className="relative border rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                className="w-full max-h-[400px] object-contain"
                playsInline
                muted
              />
              {/* 스캔 가이드 오버레이 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white/50 rounded-lg" />
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
              >
                <CameraOff className="h-4 w-4" /> 카메라 중지
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
              >
                <Upload className="h-4 w-4" /> 이미지 업로드
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              QR 코드를 카메라에 비추면 자동으로 인식합니다
            </p>
          </div>
        )}

        {/* 이미지 프리뷰 (업로드 후) */}
        {imagePreview && !cameraActive && (
          <div className="space-y-3">
            <div className="border rounded-lg overflow-hidden bg-muted/30 p-4 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Uploaded QR"
                className="max-w-full max-h-[300px] object-contain"
              />
            </div>
            <button
              type="button"
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-accent transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> 다시 스캔
            </button>
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-medium">스캔 결과</h3>
            <div className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30">
              <p className="flex-1 text-sm font-mono break-all select-all">
                {result.data}
              </p>
              <div className="flex items-center gap-1 shrink-0">
                {result.isUrl && (
                  <a
                    href={result.data}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {result.isUrl && (
              <p className="text-xs text-muted-foreground">
                URL이 감지되었습니다. 링크를 클릭하여 열 수 있습니다.
              </p>
            )}
          </div>
        )}
      </Card>
    </ToolLayout>
  );
}
