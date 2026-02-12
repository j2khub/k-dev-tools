"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SeveranceCalc() {
  const [hireDate, setHireDate] = useState("");
  const [terminationDate, setTerminationDate] = useState("");
  const [monthlySalary1, setMonthlySalary1] = useState("");
  const [monthlySalary2, setMonthlySalary2] = useState("");
  const [monthlySalary3, setMonthlySalary3] = useState("");

  const calculations = useMemo(() => {
    if (!hireDate || !terminationDate) return null;

    const hire = new Date(hireDate);
    const termination = new Date(terminationDate);

    if (hire >= termination) return null;

    const salary1 = parseFloat(monthlySalary1.replace(/,/g, "")) || 0;
    const salary2 = parseFloat(monthlySalary2.replace(/,/g, "")) || 0;
    const salary3 = parseFloat(monthlySalary3.replace(/,/g, "")) || 0;

    if (salary1 <= 0 || salary2 <= 0 || salary3 <= 0) return null;

    // Calculate total days worked
    const totalDays = Math.floor(
      (termination.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate years and remaining days
    const years = Math.floor(totalDays / 365);
    const remainingDays = totalDays % 365;

    // Average salary of last 3 months
    const totalSalary = salary1 + salary2 + salary3;
    // Average daily wage = total of last 3 months / 91 days (approximately 3 months)
    const avgDailyWage = totalSalary / 91;

    // Severance pay = (1일 평균임금 × 30일) × (재직일수 / 365)
    const severancePay = avgDailyWage * 30 * (totalDays / 365);

    return {
      totalDays,
      years,
      remainingDays,
      avgDailyWage: Math.round(avgDailyWage),
      severancePay: Math.round(severancePay),
      totalSalary,
    };
  }, [hireDate, terminationDate, monthlySalary1, monthlySalary2, monthlySalary3]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("ko-KR");
  };

  return (
    <ToolLayout
      title="퇴직금 계산기"
      description="근로기준법에 따라 1년 이상 근무한 근로자의 퇴직금을 계산합니다"
    >
      <Card className="p-4 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hire-date">입사일</Label>
            <Input
              id="hire-date"
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              className="font-mono"
            />
          </div>
          <div>
            <Label htmlFor="termination-date">퇴사일</Label>
            <Input
              id="termination-date"
              type="date"
              value={terminationDate}
              onChange={(e) => setTerminationDate(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>

        <div>
          <Label className="mb-3 block">최근 3개월 월급 (세전)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="salary1" className="text-xs text-muted-foreground">
                3개월 전
              </Label>
              <Input
                id="salary1"
                type="text"
                value={monthlySalary1}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setMonthlySalary1(value);
                }}
                placeholder="예: 3000000"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="salary2" className="text-xs text-muted-foreground">
                2개월 전
              </Label>
              <Input
                id="salary2"
                type="text"
                value={monthlySalary2}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setMonthlySalary2(value);
                }}
                placeholder="예: 3000000"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="salary3" className="text-xs text-muted-foreground">
                1개월 전
              </Label>
              <Input
                id="salary3"
                type="text"
                value={monthlySalary3}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setMonthlySalary3(value);
                }}
                placeholder="예: 3000000"
                className="font-mono"
              />
            </div>
          </div>
        </div>

        {calculations && (
          <div className="space-y-4">
            <div className="p-6 rounded-lg border bg-primary/5 border-primary/20">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">예상 퇴직금</div>
                <div className="text-4xl md:text-5xl font-bold font-mono text-primary">
                  {formatCurrency(calculations.severancePay)}원
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">재직기간</div>
                <div className="text-xl font-bold">
                  {calculations.years}년 {calculations.remainingDays}일
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  총 {formatCurrency(calculations.totalDays)}일
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">1일 평균임금</div>
                <div className="text-xl font-bold font-mono">
                  {formatCurrency(calculations.avgDailyWage)}원
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  최근 3개월 임금 기준
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="font-medium text-sm">계산 내역</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">최근 3개월 임금 총액</span>
                  <span className="font-mono font-semibold">
                    {formatCurrency(calculations.totalSalary)}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">1일 평균임금</span>
                  <span className="font-mono">
                    {formatCurrency(calculations.totalSalary)}원 ÷ 91일 = {formatCurrency(calculations.avgDailyWage)}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">30일분 임금</span>
                  <span className="font-mono">
                    {formatCurrency(calculations.avgDailyWage)}원 × 30일 = {formatCurrency(calculations.avgDailyWage * 30)}원
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">퇴직금</span>
                  <span className="font-mono font-semibold">
                    {formatCurrency(calculations.avgDailyWage * 30)}원 × ({calculations.totalDays}일 ÷ 365일)
                  </span>
                </div>
              </div>
            </div>

            {calculations.totalDays < 365 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg
                    className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="text-sm">
                    <div className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
                      재직기간 1년 미만
                    </div>
                    <div className="text-muted-foreground">
                      근로기준법상 1년 미만 근무자는 퇴직금이 발생하지 않습니다.
                      다만, 회사 내규에 따라 지급될 수 있으니 확인이 필요합니다.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!calculations && (
          <div className="text-center py-12 text-muted-foreground">
            입사일, 퇴사일, 최근 3개월 월급을 입력하세요
          </div>
        )}

        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>퇴직금 = (1일 평균임금 × 30일) × (재직일수 ÷ 365일)</p>
          <p>1일 평균임금 = 퇴직 전 3개월간 지급받은 임금 총액 ÷ 91일</p>
          <p>근로기준법에 따라 계속근로기간이 1년 이상인 근로자에게 지급됩니다.</p>
          <p>실제 퇴직금은 연차수당, 상여금 등이 포함될 수 있으니 정확한 계산은 인사팀 또는 노무사와 상담하세요.</p>
        </div>
      </Card>
    </ToolLayout>
  );
}
