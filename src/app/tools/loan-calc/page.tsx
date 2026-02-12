"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoanCalc() {
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [months, setMonths] = useState("");
  const [method, setMethod] = useState<"equal" | "principal">("equal");

  const calculations = useMemo(() => {
    const P = parseFloat(principal.replace(/,/g, ""));
    const annualRate = parseFloat(interestRate);
    const n = parseInt(months);

    if (isNaN(P) || isNaN(annualRate) || isNaN(n) || P <= 0 || annualRate < 0 || n <= 0) {
      return null;
    }

    const r = annualRate / 100 / 12; // Monthly interest rate

    if (method === "equal") {
      // 원리금균등상환: monthly = P × r(1+r)^n / ((1+r)^n - 1)
      const monthlyPayment = r === 0
        ? P / n
        : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

      let balance = P;
      const schedule = [];
      let totalInterest = 0;

      for (let i = 1; i <= Math.min(n, 12); i++) {
        const interestPayment = balance * r;
        const principalPayment = monthlyPayment - interestPayment;
        balance = balance - principalPayment;
        totalInterest += interestPayment;

        schedule.push({
          month: i,
          payment: Math.round(monthlyPayment),
          principal: Math.round(principalPayment),
          interest: Math.round(interestPayment),
          balance: Math.round(Math.max(0, balance)),
        });
      }

      // Calculate total interest for all months
      const totalInterestAll = monthlyPayment * n - P;

      return {
        method: "equal",
        monthlyPayment: Math.round(monthlyPayment),
        totalInterest: Math.round(totalInterestAll),
        totalPayment: Math.round(monthlyPayment * n),
        schedule,
      };
    } else {
      // 원금균등상환: monthly principal = P/n, interest decreases
      const principalPayment = P / n;
      let balance = P;
      const schedule = [];
      let totalInterest = 0;

      for (let i = 1; i <= Math.min(n, 12); i++) {
        const interestPayment = balance * r;
        const monthlyPayment = principalPayment + interestPayment;
        balance = balance - principalPayment;
        totalInterest += interestPayment;

        schedule.push({
          month: i,
          payment: Math.round(monthlyPayment),
          principal: Math.round(principalPayment),
          interest: Math.round(interestPayment),
          balance: Math.round(Math.max(0, balance)),
        });
      }

      // Calculate total interest for all months
      let balanceTotal = P;
      let totalInterestAll = 0;
      for (let i = 1; i <= n; i++) {
        totalInterestAll += balanceTotal * r;
        balanceTotal -= principalPayment;
      }

      return {
        method: "principal",
        monthlyPayment: Math.round(schedule[0].payment), // First month payment
        totalInterest: Math.round(totalInterestAll),
        totalPayment: Math.round(P + totalInterestAll),
        schedule,
      };
    }
  }, [principal, interestRate, months, method]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("ko-KR");
  };

  return (
    <ToolLayout
      title="대출이자 계산기"
      description="원리금균등상환 또는 원금균등상환 방식으로 대출 이자와 월 납입금을 계산합니다"
    >
      <Card className="p-4 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="principal">대출금액 (원)</Label>
            <Input
              id="principal"
              type="text"
              value={principal}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setPrincipal(value);
              }}
              placeholder="예: 100000000"
              className="font-mono"
            />
          </div>
          <div>
            <Label htmlFor="interest">연이자율 (%)</Label>
            <Input
              id="interest"
              type="text"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="예: 3.5"
              className="font-mono"
            />
          </div>
          <div>
            <Label htmlFor="months">대출기간 (개월)</Label>
            <Input
              id="months"
              type="text"
              value={months}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setMonths(value);
              }}
              placeholder="예: 360"
              className="font-mono"
            />
          </div>
        </div>

        <Tabs value={method} onValueChange={(v) => setMethod(v as "equal" | "principal")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="equal">원리금균등상환</TabsTrigger>
            <TabsTrigger value="principal">원금균등상환</TabsTrigger>
          </TabsList>

          <TabsContent value="equal" className="mt-4 space-y-4">
            {calculations && calculations.method === "equal" && (
              <ResultSection
                monthlyPayment={calculations.monthlyPayment}
                totalInterest={calculations.totalInterest}
                totalPayment={calculations.totalPayment}
                schedule={calculations.schedule}
                methodDescription="매월 동일한 금액을 납부합니다"
              />
            )}
          </TabsContent>

          <TabsContent value="principal" className="mt-4 space-y-4">
            {calculations && calculations.method === "principal" && (
              <ResultSection
                monthlyPayment={calculations.monthlyPayment}
                totalInterest={calculations.totalInterest}
                totalPayment={calculations.totalPayment}
                schedule={calculations.schedule}
                methodDescription="매월 원금을 동일하게 갚고, 이자는 점점 줄어듭니다"
              />
            )}
          </TabsContent>
        </Tabs>

        {!calculations && (
          <div className="text-center py-12 text-muted-foreground">
            대출금액, 이자율, 대출기간을 입력하세요
          </div>
        )}

        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>원리금균등상환: 매월 납입액이 일정하여 계획적인 자금 관리가 용이합니다.</p>
          <p>원금균등상환: 초기 납입액이 많지만 시간이 지날수록 이자 부담이 줄어듭니다.</p>
          <p>실제 대출 조건은 금융기관마다 다를 수 있습니다.</p>
        </div>
      </Card>
    </ToolLayout>
  );
}

interface ResultSectionProps {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
  methodDescription: string;
}

function ResultSection({
  monthlyPayment,
  totalInterest,
  totalPayment,
  schedule,
  methodDescription,
}: ResultSectionProps) {
  const formatCurrency = (value: number) => value.toLocaleString("ko-KR");

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg text-sm text-center">
        {methodDescription}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
          <div className="text-sm text-muted-foreground mb-1">
            {schedule[0].month === 1 ? "첫 달 " : ""}월 납입금
          </div>
          <div className="text-2xl font-bold font-mono text-primary">
            {formatCurrency(monthlyPayment)}원
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50">
          <div className="text-sm text-muted-foreground mb-1">총 이자</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {formatCurrency(totalInterest)}원
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50">
          <div className="text-sm text-muted-foreground mb-1">총 상환금액</div>
          <div className="text-2xl font-bold font-mono">
            {formatCurrency(totalPayment)}원
          </div>
        </div>
      </div>

      <div>
        <div className="font-semibold mb-3">상환 스케줄 (처음 12개월)</div>
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left">회차</th>
                <th className="px-3 py-2 text-right">월 납입금</th>
                <th className="px-3 py-2 text-right">원금</th>
                <th className="px-3 py-2 text-right">이자</th>
                <th className="px-3 py-2 text-right">잔액</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {schedule.map((row) => (
                <tr key={row.month} className="hover:bg-muted/50">
                  <td className="px-3 py-2 font-medium">{row.month}개월</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {formatCurrency(row.payment)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-blue-600 dark:text-blue-400">
                    {formatCurrency(row.principal)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-amber-600 dark:text-amber-400">
                    {formatCurrency(row.interest)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                    {formatCurrency(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
