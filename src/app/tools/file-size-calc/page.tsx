"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Unit = "B" | "KB" | "MB" | "GB" | "TB";
type ImageResolution = "1080p" | "4K" | "8K" | "12MP" | "24MP" | "48MP";
type VideoResolution = "480p" | "720p" | "1080p" | "4K" | "8K";

const IMAGE_SIZES: Record<ImageResolution, number> = {
  "1080p": 3, // MB per image
  "4K": 8,
  "8K": 30,
  "12MP": 4,
  "24MP": 8,
  "48MP": 15,
};

const VIDEO_BITRATES: Record<VideoResolution, number> = {
  "480p": 2.5, // Mbps
  "720p": 5,
  "1080p": 8,
  "4K": 45,
  "8K": 100,
};

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1000;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (i >= units.length) {
    return `${(bytes / Math.pow(k, units.length - 1)).toFixed(2)} TB`;
  }

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

function toBytes(value: number, unit: Unit): number {
  const multipliers: Record<Unit, number> = {
    B: 1,
    KB: 1000,
    MB: 1000 * 1000,
    GB: 1000 * 1000 * 1000,
    TB: 1000 * 1000 * 1000 * 1000,
  };
  return value * multipliers[unit];
}

export default function FileSizeCalculator() {
  const [fileSize, setFileSize] = useState("10");
  const [fileSizeUnit, setFileSizeUnit] = useState<Unit>("MB");
  const [fileCount, setFileCount] = useState("100");

  const [imageResolution, setImageResolution] =
    useState<ImageResolution>("4K");
  const [imageCount, setImageCount] = useState("1000");

  const [videoResolution, setVideoResolution] =
    useState<VideoResolution>("1080p");
  const [videoDuration, setVideoDuration] = useState("60");

  const totalSize = useMemo(() => {
    const size = parseFloat(fileSize);
    const count = parseInt(fileCount, 10);

    if (isNaN(size) || isNaN(count) || count < 0) return null;

    const bytes = toBytes(size, fileSizeUnit) * count;
    return {
      bytes,
      formatted: formatSize(bytes),
    };
  }, [fileSize, fileSizeUnit, fileCount]);

  const imageTotalSize = useMemo(() => {
    const count = parseInt(imageCount, 10);
    if (isNaN(count) || count < 0) return null;

    const sizePerImage = IMAGE_SIZES[imageResolution];
    const totalMB = sizePerImage * count;
    const bytes = totalMB * 1000 * 1000;

    return {
      bytes,
      formatted: formatSize(bytes),
      perImage: `${sizePerImage} MB`,
    };
  }, [imageResolution, imageCount]);

  const videoTotalSize = useMemo(() => {
    const duration = parseFloat(videoDuration);
    if (isNaN(duration) || duration < 0) return null;

    const bitrate = VIDEO_BITRATES[videoResolution];
    const totalMbits = bitrate * duration * 60; // duration in minutes
    const bytes = (totalMbits / 8) * 1000 * 1000;

    return {
      bytes,
      formatted: formatSize(bytes),
      bitrate: `${bitrate} Mbps`,
    };
  }, [videoResolution, videoDuration]);

  return (
    <ToolLayout
      title="파일 크기 계산기"
      description="총 파일 용량 및 이미지/동영상 저장 공간을 계산합니다"
    >
      <div className="space-y-6">
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">일반 파일 계산</h3>

          <div>
            <Label htmlFor="file-size">파일 하나의 크기</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="file-size"
                type="number"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="10"
                className="font-mono"
                step="any"
                min="0"
              />
              <select
                value={fileSizeUnit}
                onChange={(e) => setFileSizeUnit(e.target.value as Unit)}
                className="px-3 py-2 text-sm border rounded-md bg-transparent min-w-[100px]"
              >
                <option value="B">B</option>
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="file-count">파일 개수</Label>
            <Input
              id="file-count"
              type="number"
              value={fileCount}
              onChange={(e) => setFileCount(e.target.value)}
              placeholder="100"
              className="font-mono mt-1"
              min="0"
              step="1"
            />
          </div>

          {totalSize && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">총 용량</div>
              <div className="text-3xl font-bold">{totalSize.formatted}</div>
              <div className="text-xs text-muted-foreground mt-2">
                {fileSize} {fileSizeUnit} × {fileCount}개
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">사진 저장 공간 예측</h3>

          <div>
            <Label htmlFor="image-resolution">해상도</Label>
            <select
              id="image-resolution"
              value={imageResolution}
              onChange={(e) =>
                setImageResolution(e.target.value as ImageResolution)
              }
              className="w-full px-3 py-2 text-sm border rounded-md bg-transparent mt-1"
            >
              <option value="1080p">1080p (Full HD)</option>
              <option value="4K">4K (UHD)</option>
              <option value="8K">8K</option>
              <option value="12MP">12 메가픽셀</option>
              <option value="24MP">24 메가픽셀</option>
              <option value="48MP">48 메가픽셀</option>
            </select>
          </div>

          <div>
            <Label htmlFor="image-count">사진 매수</Label>
            <Input
              id="image-count"
              type="number"
              value={imageCount}
              onChange={(e) => setImageCount(e.target.value)}
              placeholder="1000"
              className="font-mono mt-1"
              min="0"
              step="1"
            />
          </div>

          {imageTotalSize && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                예상 총 용량
              </div>
              <div className="text-3xl font-bold">
                {imageTotalSize.formatted}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                사진 1장당 약 {imageTotalSize.perImage} × {imageCount}장
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            * 실제 파일 크기는 압축률, 품질 설정에 따라 달라질 수 있습니다
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">동영상 저장 공간 예측</h3>

          <div>
            <Label htmlFor="video-resolution">해상도</Label>
            <select
              id="video-resolution"
              value={videoResolution}
              onChange={(e) =>
                setVideoResolution(e.target.value as VideoResolution)
              }
              className="w-full px-3 py-2 text-sm border rounded-md bg-transparent mt-1"
            >
              <option value="480p">480p (SD)</option>
              <option value="720p">720p (HD)</option>
              <option value="1080p">1080p (Full HD)</option>
              <option value="4K">4K (UHD)</option>
              <option value="8K">8K</option>
            </select>
          </div>

          <div>
            <Label htmlFor="video-duration">재생 시간 (분)</Label>
            <Input
              id="video-duration"
              type="number"
              value={videoDuration}
              onChange={(e) => setVideoDuration(e.target.value)}
              placeholder="60"
              className="font-mono mt-1"
              min="0"
              step="any"
            />
          </div>

          {videoTotalSize && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                예상 파일 크기
              </div>
              <div className="text-3xl font-bold">
                {videoTotalSize.formatted}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                비트레이트: {videoTotalSize.bitrate} × {videoDuration}분
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            * 예상치는 평균 비트레이트 기준이며, 코덱과 인코딩 설정에 따라 크게
            달라질 수 있습니다
          </div>
        </Card>

        {totalSize && imageTotalSize && videoTotalSize && (
          <Card className="p-4 bg-muted/50">
            <h3 className="font-semibold mb-3">모든 항목 합계</h3>
            <div className="text-2xl font-bold">
              {formatSize(
                totalSize.bytes + imageTotalSize.bytes + videoTotalSize.bytes
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div>일반 파일: {totalSize.formatted}</div>
              <div>사진: {imageTotalSize.formatted}</div>
              <div>동영상: {videoTotalSize.formatted}</div>
            </div>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
