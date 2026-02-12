"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type FileSizeUnit = "KB" | "MB" | "GB" | "TB";
type SpeedUnit = "Kbps" | "Mbps" | "Gbps";

const PRESET_SPEEDS: { label: string; value: number; unit: SpeedUnit }[] = [
  { label: "10 Mbps", value: 10, unit: "Mbps" },
  { label: "100 Mbps", value: 100, unit: "Mbps" },
  { label: "500 Mbps", value: 500, unit: "Mbps" },
  { label: "1 Gbps", value: 1, unit: "Gbps" },
];

const PRESET_SIZES: { label: string; value: number; unit: FileSizeUnit }[] = [
  { label: "100 MB", value: 100, unit: "MB" },
  { label: "1 GB", value: 1, unit: "GB" },
  { label: "4.7 GB (DVD)", value: 4.7, unit: "GB" },
  { label: "25 GB (BD)", value: 25, unit: "GB" },
  { label: "50 GB", value: 50, unit: "GB" },
];

function formatTime(seconds: number): string {
  if (seconds < 1) {
    return "1초 미만";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0) parts.push(`${minutes}분`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}초`);

  return parts.join(" ");
}

function calculateDownloadTime(
  fileSize: number,
  fileSizeUnit: FileSizeUnit,
  speed: number,
  speedUnit: SpeedUnit
): number | null {
  if (fileSize <= 0 || speed <= 0) return null;

  // Convert file size to bytes
  const fileSizeMultipliers: Record<FileSizeUnit, number> = {
    KB: 1000,
    MB: 1000 * 1000,
    GB: 1000 * 1000 * 1000,
    TB: 1000 * 1000 * 1000 * 1000,
  };
  const bytes = fileSize * fileSizeMultipliers[fileSizeUnit];

  // Convert speed to bits per second
  const speedMultipliers: Record<SpeedUnit, number> = {
    Kbps: 1000,
    Mbps: 1000 * 1000,
    Gbps: 1000 * 1000 * 1000,
  };
  const bitsPerSecond = speed * speedMultipliers[speedUnit];

  // Calculate time in seconds (bytes * 8 bits/byte / bits per second)
  const seconds = (bytes * 8) / bitsPerSecond;
  return seconds;
}

export default function DownloadTimeCalculator() {
  const [fileSize, setFileSize] = useState("1");
  const [fileSizeUnit, setFileSizeUnit] = useState<FileSizeUnit>("GB");
  const [speed, setSpeed] = useState("100");
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>("Mbps");

  const result = useMemo(() => {
    const size = parseFloat(fileSize);
    const spd = parseFloat(speed);

    if (isNaN(size) || isNaN(spd)) return null;

    const seconds = calculateDownloadTime(size, fileSizeUnit, spd, speedUnit);
    if (seconds === null) return null;

    return {
      seconds,
      formatted: formatTime(seconds),
      hours: (seconds / 3600).toFixed(2),
      minutes: (seconds / 60).toFixed(2),
    };
  }, [fileSize, fileSizeUnit, speed, speedUnit]);

  const handlePresetSpeed = (preset: {
    value: number;
    unit: SpeedUnit;
  }) => {
    setSpeed(preset.value.toString());
    setSpeedUnit(preset.unit);
  };

  const handlePresetSize = (preset: { value: number; unit: FileSizeUnit }) => {
    setFileSize(preset.value.toString());
    setFileSizeUnit(preset.unit);
  };

  return (
    <ToolLayout
      title="다운로드 시간 계산기"
      description="파일 크기와 다운로드 속도를 입력하여 예상 다운로드 시간을 계산합니다"
    >
      <Card className="p-4 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-size">파일 크기</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="file-size"
                type="number"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="1"
                className="font-mono"
                step="any"
                min="0"
              />
              <select
                value={fileSizeUnit}
                onChange={(e) => setFileSizeUnit(e.target.value as FileSizeUnit)}
                className="px-3 py-2 text-sm border rounded-md bg-transparent min-w-[100px]"
              >
                <option value="KB">KB</option>
                <option value="MB">MB</option>
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">빠른 선택 (파일 크기)</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_SIZES.map((preset, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSize(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <Label htmlFor="download-speed">다운로드 속도</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="download-speed"
                type="number"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                placeholder="100"
                className="font-mono"
                step="any"
                min="0"
              />
              <select
                value={speedUnit}
                onChange={(e) => setSpeedUnit(e.target.value as SpeedUnit)}
                className="px-3 py-2 text-sm border rounded-md bg-transparent min-w-[100px]"
              >
                <option value="Kbps">Kbps</option>
                <option value="Mbps">Mbps</option>
                <option value="Gbps">Gbps</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">빠른 선택 (속도)</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_SPEEDS.map((preset, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSpeed(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {result && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-sm text-muted-foreground">
              예상 다운로드 시간
            </h3>

            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="text-3xl font-bold text-center">
                {result.formatted}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground">총 시간</div>
                <div className="text-lg font-semibold font-mono">
                  {result.hours} 시간
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground">총 분</div>
                <div className="text-lg font-semibold font-mono">
                  {result.minutes} 분
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
              <div className="font-semibold mb-1">참고</div>
              <ul className="space-y-1 list-disc list-inside">
                <li>실제 다운로드 시간은 네트워크 상태에 따라 달라질 수 있습니다</li>
                <li>계산은 이론적인 최대 속도를 기준으로 합니다</li>
                <li>오버헤드 및 프로토콜 손실은 고려되지 않았습니다</li>
              </ul>
            </div>
          </div>
        )}

        {fileSize && speed && !result && (
          <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
            올바른 값을 입력해주세요.
          </div>
        )}
      </Card>
    </ToolLayout>
  );
}
