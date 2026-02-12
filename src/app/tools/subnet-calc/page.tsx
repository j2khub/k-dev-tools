"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

const QUICK_CIDRS = [8, 16, 24, 25, 26, 27, 28, 29, 30];

function isValidIP(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255;
  });
}

function ipToNumber(ip: string): number {
  const parts = ip.split(".").map((p) => parseInt(p, 10));
  return (
    (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
  ) >>> 0;
}

function numberToIP(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".");
}

function calculateSubnet(ip: string, prefix: number) {
  if (!isValidIP(ip) || prefix < 0 || prefix > 32) {
    return null;
  }

  const ipNum = ipToNumber(ip);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcard = ~mask >>> 0;
  const network = (ipNum & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix === 31 ? 2 : prefix === 32 ? 1 : totalHosts - 2;
  const firstUsable = prefix === 31 || prefix === 32 ? network : network + 1;
  const lastUsable =
    prefix === 31 || prefix === 32 ? broadcast : broadcast - 1;

  return {
    network: numberToIP(network),
    broadcast: numberToIP(broadcast),
    subnetMask: numberToIP(mask),
    wildcardMask: numberToIP(wildcard),
    firstUsable: numberToIP(firstUsable),
    lastUsable: numberToIP(lastUsable),
    totalHosts: totalHosts.toLocaleString("ko-KR"),
    usableHosts: usableHosts.toLocaleString("ko-KR"),
  };
}

export default function SubnetCalculator() {
  const [ip, setIp] = useState("192.168.1.0");
  const [prefix, setPrefix] = useState("24");
  const { copy, copied } = useCopyToClipboard();

  const result = useMemo(() => {
    const prefixNum = parseInt(prefix, 10);
    if (!isValidIP(ip) || isNaN(prefixNum)) return null;
    return calculateSubnet(ip, prefixNum);
  }, [ip, prefix]);

  const handleQuickCIDR = (cidr: number) => {
    setPrefix(cidr.toString());
  };

  const handleCopy = (text: string) => {
    copy(text);
  };

  const isValid = result !== null;

  return (
    <ToolLayout
      title="서브넷 계산기"
      description="IP 주소와 CIDR 표기법으로 서브넷 정보를 계산합니다"
    >
      <Card className="p-4 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="ip-input">IP 주소</Label>
            <Input
              id="ip-input"
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.1.0"
              className="font-mono mt-1"
              aria-invalid={!isValidIP(ip)}
            />
            {ip && !isValidIP(ip) && (
              <p className="text-xs text-destructive mt-1">
                올바른 IP 주소 형식이 아닙니다
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="prefix-input">CIDR 프리픽스</Label>
            <div className="flex gap-2 mt-1">
              <span className="flex items-center text-muted-foreground">/</span>
              <Input
                id="prefix-input"
                type="number"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="24"
                className="font-mono"
                min="0"
                max="32"
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">빠른 선택</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_CIDRS.map((cidr) => (
                <Button
                  key={cidr}
                  variant={prefix === cidr.toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickCIDR(cidr)}
                >
                  /{cidr}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {isValid && result && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-sm text-muted-foreground">
              계산 결과
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">
                    네트워크 주소
                  </div>
                  <div className="font-mono text-sm font-semibold">
                    {result.network}/{prefix}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCopy(`${result.network}/${prefix}`)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">
                    브로드캐스트 주소
                  </div>
                  <div className="font-mono text-sm font-semibold">
                    {result.broadcast}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCopy(result.broadcast)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">
                    서브넷 마스크
                  </div>
                  <div className="font-mono text-sm font-semibold">
                    {result.subnetMask}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCopy(result.subnetMask)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground">
                    와일드카드 마스크
                  </div>
                  <div className="font-mono text-sm font-semibold">
                    {result.wildcardMask}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCopy(result.wildcardMask)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  사용 가능한 IP 범위
                </div>
                <div className="font-mono text-sm font-semibold">
                  {result.firstUsable} ~ {result.lastUsable}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground">
                    총 호스트 수
                  </div>
                  <div className="text-lg font-bold">{result.totalHosts}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground">
                    사용 가능 호스트
                  </div>
                  <div className="text-lg font-bold">{result.usableHosts}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isValid && ip && prefix && (
          <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
            올바른 IP 주소와 CIDR 프리픽스를 입력해주세요.
          </div>
        )}
      </Card>
    </ToolLayout>
  );
}
