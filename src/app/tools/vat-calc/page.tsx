"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

export default function VatCalc() {
  const [mode, setMode] = useState<"included" | "excluded">("included");
  const [includedAmount, setIncludedAmount] = useState("");
  const [excludedAmount, setExcludedAmount] = useState("");
  const { copy, copied } = useCopyToClipboard();

  const includedResult = useMemo(() => {
    const total = parseFloat(includedAmount.replace(/,/g, ""));
    if (isNaN(total) || total <= 0) return null;

    // 공급가액 = 총액 / 1.1
    const supplyPrice = Math.round(total / 1.1);
    // 부가세 = 총액 - 공급가액
    const vat = total - supplyPrice;

    return {
      supplyPrice,
      vat,
      total,
    };
  }, [includedAmount]);

  const excludedResult = useMemo(() => {
    const supply = parseFloat(excludedAmount.replace(/,/g, ""));
    if (isNaN(supply) || supply <= 0) return null;

    // 부가세 = 공급가액 × 0.1
    const vat = Math.round(supply * 0.1);
    // 총액 = 공급가액 + 부가세
    const total = supply + vat;

    return {
      supplyPrice: supply,
      vat,
      total,
    };
  }, [excludedAmount]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("ko-KR");
  };

  const handleCopy = (value: number) => {
    copy(value.toString());
  };

  return (
    <ToolLayout
      title="부가세 계산기"
      description="부가세(VAT) 10%를 포함하거나 분리하여 계산합니다"
    >
      <Card className="p-4 space-y-6">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "included" | "excluded")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="included">부가세 포함 → 분리</TabsTrigger>
            <TabsTrigger value="excluded">부가세 별도 → 합산</TabsTrigger>
          </TabsList>

          <TabsContent value="included" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="included-amount">부가세 포함 금액</Label>
              <Input
                id="included-amount"
                type="text"
                value={includedAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setIncludedAmount(value);
                }}
                placeholder="예: 110000"
                className="font-mono text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                VAT가 포함된 총 금액을 입력하세요
              </p>
            </div>

            {includedResult && (
              <div className="space-y-3">
                <ResultCard
                  label="공급가액"
                  value={includedResult.supplyPrice}
                  highlight
                  onCopy={handleCopy}
                  copied={copied}
                />
                <ResultCard
                  label="부가세 (10%)"
                  value={includedResult.vat}
                  onCopy={handleCopy}
                  copied={copied}
                />
                <ResultCard
                  label="총액"
                  value={includedResult.total}
                  onCopy={handleCopy}
                  copied={copied}
                />

                <div className="p-4 bg-muted rounded-lg text-sm">
                  <div className="font-medium mb-2">계산식</div>
                  <div className="space-y-1 text-xs text-muted-foreground font-mono">
                    <div>공급가액 = {formatCurrency(includedResult.total)} ÷ 1.1 = {formatCurrency(includedResult.supplyPrice)}원</div>
                    <div>부가세 = {formatCurrency(includedResult.total)} - {formatCurrency(includedResult.supplyPrice)} = {formatCurrency(includedResult.vat)}원</div>
                  </div>
                </div>
              </div>
            )}

            {!includedResult && (
              <div className="text-center py-12 text-muted-foreground">
                부가세 포함 금액을 입력하세요
              </div>
            )}
          </TabsContent>

          <TabsContent value="excluded" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="excluded-amount">공급가액 (부가세 별도)</Label>
              <Input
                id="excluded-amount"
                type="text"
                value={excludedAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setExcludedAmount(value);
                }}
                placeholder="예: 100000"
                className="font-mono text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                VAT가 제외된 공급가액을 입력하세요
              </p>
            </div>

            {excludedResult && (
              <div className="space-y-3">
                <ResultCard
                  label="공급가액"
                  value={excludedResult.supplyPrice}
                  onCopy={handleCopy}
                  copied={copied}
                />
                <ResultCard
                  label="부가세 (10%)"
                  value={excludedResult.vat}
                  onCopy={handleCopy}
                  copied={copied}
                />
                <ResultCard
                  label="총액"
                  value={excludedResult.total}
                  highlight
                  onCopy={handleCopy}
                  copied={copied}
                />

                <div className="p-4 bg-muted rounded-lg text-sm">
                  <div className="font-medium mb-2">계산식</div>
                  <div className="space-y-1 text-xs text-muted-foreground font-mono">
                    <div>부가세 = {formatCurrency(excludedResult.supplyPrice)} × 0.1 = {formatCurrency(excludedResult.vat)}원</div>
                    <div>총액 = {formatCurrency(excludedResult.supplyPrice)} + {formatCurrency(excludedResult.vat)} = {formatCurrency(excludedResult.total)}원</div>
                  </div>
                </div>
              </div>
            )}

            {!excludedResult && (
              <div className="text-center py-12 text-muted-foreground">
                공급가액을 입력하세요
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>한국의 부가가치세(VAT) 세율은 10%입니다.</p>
          <p>공급가액은 세금을 제외한 순수 상품/서비스 가격입니다.</p>
        </div>
      </Card>
    </ToolLayout>
  );
}

interface ResultCardProps {
  label: string;
  value: number;
  highlight?: boolean;
  onCopy: (value: number) => void;
  copied: boolean;
}

function ResultCard({ label, value, highlight, onCopy, copied }: ResultCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? "bg-primary/5 border-primary/20" : "bg-muted/50"}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm text-muted-foreground mb-1">{label}</div>
          <div className={`text-3xl font-bold font-mono ${highlight ? "text-primary" : ""}`}>
            {value.toLocaleString("ko-KR")}원
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCopy(value)}
        >
          {copied ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
