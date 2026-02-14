"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

export default function SalaryCalc() {
  const [annualSalary, setAnnualSalary] = useState("");
  const { copy, copied } = useCopyToClipboard();

  const calculations = useMemo(() => {
    const salary = parseFloat(annualSalary.replace(/,/g, ""));

    if (isNaN(salary) || salary <= 0) return null;

    // Convert to annual salary if input is in 만원 (less than 10000)
    const yearlyTotal = salary < 10000 ? salary * 10000 : salary;

    // Monthly gross salary
    const monthlyGross = Math.floor(yearlyTotal / 12);

    // Non-taxable allowance (월 20만원 식대)
    const nonTaxable = 200000;

    // Calculate deductions
    // 국민연금 4.5% (cap at 5,900,000)
    const pensionBase = Math.min(monthlyGross, 5900000);
    const nationalPension = Math.floor(pensionBase * 0.045);

    // 건강보험 3.545%
    const healthInsurance = Math.floor(monthlyGross * 0.03545);

    // 장기요양보험 = 건강보험 × 12.95%
    const longTermCare = Math.floor(healthInsurance * 0.1295);

    // 고용보험 0.9%
    const employmentInsurance = Math.floor(monthlyGross * 0.009);

    // Income tax calculation (simplified progressive tax)
    const taxableIncome = yearlyTotal - (nonTaxable * 12);
    let incomeTax = 0;

    if (taxableIncome <= 12000000) {
      incomeTax = taxableIncome * 0.06;
    } else if (taxableIncome <= 46000000) {
      incomeTax = 720000 + (taxableIncome - 12000000) * 0.15;
    } else if (taxableIncome <= 88000000) {
      incomeTax = 720000 + 5100000 + (taxableIncome - 46000000) * 0.24;
    } else if (taxableIncome <= 150000000) {
      incomeTax = 720000 + 5100000 + 10080000 + (taxableIncome - 88000000) * 0.35;
    } else if (taxableIncome <= 300000000) {
      incomeTax = 720000 + 5100000 + 10080000 + 21700000 + (taxableIncome - 150000000) * 0.38;
    } else if (taxableIncome <= 500000000) {
      incomeTax = 720000 + 5100000 + 10080000 + 21700000 + 57000000 + (taxableIncome - 300000000) * 0.40;
    } else {
      incomeTax = 720000 + 5100000 + 10080000 + 21700000 + 57000000 + 80000000 + (taxableIncome - 500000000) * 0.42;
    }

    const monthlyIncomeTax = Math.floor(incomeTax / 12);

    // 지방소득세 = 소득세 × 10%
    const localIncomeTax = Math.floor(monthlyIncomeTax * 0.1);

    // Total deductions
    const totalDeductions = nationalPension + healthInsurance + longTermCare + employmentInsurance + monthlyIncomeTax + localIncomeTax;

    // Net monthly salary
    const netMonthlySalary = monthlyGross - totalDeductions;

    return {
      yearlyTotal,
      monthlyGross,
      nationalPension,
      healthInsurance,
      longTermCare,
      employmentInsurance,
      monthlyIncomeTax,
      localIncomeTax,
      totalDeductions,
      netMonthlySalary,
    };
  }, [annualSalary]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("ko-KR");
  };

  const handleCopy = (value: number) => {
    copy(value.toString());
  };

  return (
    <ToolLayout
      title="연봉/실수령액 계산기"
      description="연봉을 입력하면 4대보험, 소득세 등을 공제한 월 실수령액을 계산합니다"
    >
      <Card className="p-4 space-y-6">
        <div>
          <Label htmlFor="salary">연봉 (만원 또는 원 단위)</Label>
          <Input
            id="salary"
            type="text"
            value={annualSalary ? Number(annualSalary).toLocaleString("ko-KR") : ""}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              setAnnualSalary(value);
            }}
            placeholder="예: 5000 (만원) 또는 50000000 (원)"
            className="font-mono text-lg"
          />
          <p className="text-xs text-muted-foreground mt-1">
            숫자만 입력하세요. 5000만원 이하는 만원 단위, 그 이상은 원 단위로 자동 인식됩니다.
          </p>
        </div>

        {calculations && (
          <div className="space-y-4">
            <div className="p-6 rounded-lg border bg-primary/5 border-primary/20">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  월 실수령액
                </div>
                <div className="text-4xl md:text-5xl font-bold font-mono text-primary">
                  {formatCurrency(calculations.netMonthlySalary)}원
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  연봉: {formatCurrency(calculations.yearlyTotal)}원
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">월 세전 급여</div>
                <div className="text-2xl font-bold font-mono">
                  {formatCurrency(calculations.monthlyGross)}원
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">월 총 공제액</div>
                <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
                  -{formatCurrency(calculations.totalDeductions)}원
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 font-semibold text-sm">
                월 공제 내역
              </div>
              <div className="divide-y">
                <DeductionRow
                  label="국민연금 (4.5%)"
                  value={calculations.nationalPension}
                  onCopy={handleCopy}
                  copied={copied}
                />
                <DeductionRow
                  label="건강보험 (3.545%)"
                  value={calculations.healthInsurance}
                  onCopy={handleCopy}
                  copied={copied}
                />
                <DeductionRow
                  label="장기요양보험 (건강보험×12.95%)"
                  value={calculations.longTermCare}
                  onCopy={handleCopy}
                  copied={copied}
                />
                <DeductionRow
                  label="고용보험 (0.9%)"
                  value={calculations.employmentInsurance}
                  onCopy={handleCopy}
                  copied={copied}
                />
                <DeductionRow
                  label="소득세 (간이세액)"
                  value={calculations.monthlyIncomeTax}
                  onCopy={handleCopy}
                  copied={copied}
                />
                <DeductionRow
                  label="지방소득세 (소득세×10%)"
                  value={calculations.localIncomeTax}
                  onCopy={handleCopy}
                  copied={copied}
                />
              </div>
            </div>
          </div>
        )}

        {!calculations && (
          <div className="text-center py-12 text-muted-foreground">
            연봉을 입력하면 실수령액을 계산합니다
          </div>
        )}

        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>이 계산은 2025년 기준 요율을 적용한 근사값입니다.</p>
          <p>실제 금액은 부양가족 수, 비과세 항목 등에 따라 달라질 수 있습니다.</p>
          <p>정확한 계산은 급여 담당자 또는 세무사와 상담하세요.</p>
        </div>
      </Card>
    </ToolLayout>
  );
}

interface DeductionRowProps {
  label: string;
  value: number;
  onCopy: (value: number) => void;
  copied: boolean;
}

function DeductionRow({ label, value, onCopy, copied }: DeductionRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono font-semibold">
          {value.toLocaleString("ko-KR")}원
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onCopy(value)}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
