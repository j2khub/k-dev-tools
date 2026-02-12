"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HourlyWage() {
  const [mode, setMode] = useState<"salary-to-hourly" | "hourly-to-salary">("salary-to-hourly");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [hourlyWage, setHourlyWage] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("40");
  const [includeWeeklyAllowance, setIncludeWeeklyAllowance] = useState(false);

  const MIN_WAGE_2025 = 10030;

  const salaryToHourlyResult = useMemo(() => {
    const salary = parseFloat(monthlySalary.replace(/,/g, ""));
    const hours = parseFloat(weeklyHours);

    if (isNaN(salary) || isNaN(hours) || salary <= 0 || hours <= 0) return null;

    // Monthly hours = weekly hours × 4.345 weeks per month
    const monthlyHours = hours * 4.345;
    const calculatedHourlyWage = salary / monthlyHours;

    // Compare with minimum wage
    const percentageOfMinWage = (calculatedHourlyWage / MIN_WAGE_2025) * 100;
    const isAboveMinWage = calculatedHourlyWage >= MIN_WAGE_2025;

    return {
      hourlyWage: Math.round(calculatedHourlyWage),
      monthlyHours: Math.round(monthlyHours),
      percentageOfMinWage: Math.round(percentageOfMinWage),
      isAboveMinWage,
    };
  }, [monthlySalary, weeklyHours]);

  const hourlyToSalaryResult = useMemo(() => {
    const wage = parseFloat(hourlyWage.replace(/,/g, ""));
    const hours = parseFloat(weeklyHours);

    if (isNaN(wage) || isNaN(hours) || wage <= 0 || hours <= 0) return null;

    // Monthly salary = hourly wage × weekly hours × 4.345 weeks
    const monthlyHours = hours * 4.345;
    let calculatedMonthlySalary = wage * monthlyHours;

    // If weekly allowance is included, add it
    // 주휴수당 = (주 근무시간 ÷ 40) × 8시간 × 시급 × 4.345주
    let weeklyAllowance = 0;
    if (includeWeeklyAllowance && hours >= 15) {
      const weeklyAllowanceHours = Math.min(hours / 40, 1) * 8;
      weeklyAllowance = wage * weeklyAllowanceHours * 4.345;
      calculatedMonthlySalary += weeklyAllowance;
    }

    const annualSalary = calculatedMonthlySalary * 12;

    // Compare with minimum wage
    const percentageOfMinWage = (wage / MIN_WAGE_2025) * 100;
    const isAboveMinWage = wage >= MIN_WAGE_2025;

    return {
      monthlySalary: Math.round(calculatedMonthlySalary),
      annualSalary: Math.round(annualSalary),
      monthlyHours: Math.round(monthlyHours),
      weeklyAllowance: Math.round(weeklyAllowance),
      percentageOfMinWage: Math.round(percentageOfMinWage),
      isAboveMinWage,
    };
  }, [hourlyWage, weeklyHours, includeWeeklyAllowance]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("ko-KR");
  };

  return (
    <ToolLayout
      title="시급 계산기"
      description="월급을 시급으로 또는 시급을 월급/연봉으로 변환합니다"
    >
      <Card className="p-4 space-y-6">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "salary-to-hourly" | "hourly-to-salary")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="salary-to-hourly">월급 → 시급</TabsTrigger>
            <TabsTrigger value="hourly-to-salary">시급 → 월급/연봉</TabsTrigger>
          </TabsList>

          <TabsContent value="salary-to-hourly" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthly-salary">월급 (원)</Label>
                <Input
                  id="monthly-salary"
                  type="text"
                  value={monthlySalary}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setMonthlySalary(value);
                  }}
                  placeholder="예: 2500000"
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="weekly-hours-1">주당 근무시간</Label>
                <Input
                  id="weekly-hours-1"
                  type="text"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(e.target.value)}
                  placeholder="40"
                  className="font-mono"
                />
              </div>
            </div>

            {salaryToHourlyResult && (
              <div className="space-y-4">
                <div className="p-6 rounded-lg border bg-primary/5 border-primary/20">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">시급</div>
                    <div className="text-4xl md:text-5xl font-bold font-mono text-primary">
                      {formatCurrency(salaryToHourlyResult.hourlyWage)}원
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      월 약 {formatCurrency(salaryToHourlyResult.monthlyHours)}시간 근무
                    </div>
                  </div>
                </div>

                <MinWageComparison
                  wage={salaryToHourlyResult.hourlyWage}
                  minWage={MIN_WAGE_2025}
                  percentage={salaryToHourlyResult.percentageOfMinWage}
                  isAbove={salaryToHourlyResult.isAboveMinWage}
                />

                <div className="p-4 bg-muted rounded-lg text-sm">
                  <div className="font-medium mb-2">계산식</div>
                  <div className="space-y-1 text-xs text-muted-foreground font-mono">
                    <div>월 근무시간 = {weeklyHours}시간 × 4.345주 = {salaryToHourlyResult.monthlyHours}시간</div>
                    <div>시급 = {formatCurrency(parseFloat(monthlySalary.replace(/,/g, "")))}원 ÷ {salaryToHourlyResult.monthlyHours}시간 = {formatCurrency(salaryToHourlyResult.hourlyWage)}원</div>
                  </div>
                </div>
              </div>
            )}

            {!salaryToHourlyResult && (
              <div className="text-center py-12 text-muted-foreground">
                월급과 주당 근무시간을 입력하세요
              </div>
            )}
          </TabsContent>

          <TabsContent value="hourly-to-salary" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourly-wage">시급 (원)</Label>
                <Input
                  id="hourly-wage"
                  type="text"
                  value={hourlyWage}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setHourlyWage(value);
                  }}
                  placeholder="예: 10030"
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="weekly-hours-2">주당 근무시간</Label>
                <Input
                  id="weekly-hours-2"
                  type="text"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(e.target.value)}
                  placeholder="40"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="weekly-allowance"
                checked={includeWeeklyAllowance}
                onChange={(e) => setIncludeWeeklyAllowance(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="weekly-allowance" className="cursor-pointer">
                주휴수당 포함 (주 15시간 이상 근무 시)
              </Label>
            </div>

            {hourlyToSalaryResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 rounded-lg border bg-primary/5 border-primary/20">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2">월급</div>
                      <div className="text-3xl font-bold font-mono text-primary">
                        {formatCurrency(hourlyToSalaryResult.monthlySalary)}원
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-lg border bg-muted/50">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2">연봉</div>
                      <div className="text-3xl font-bold font-mono">
                        {formatCurrency(hourlyToSalaryResult.annualSalary)}원
                      </div>
                    </div>
                  </div>
                </div>

                {includeWeeklyAllowance && hourlyToSalaryResult.weeklyAllowance > 0 && (
                  <div className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">주휴수당 (월)</span>
                      <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                        +{formatCurrency(hourlyToSalaryResult.weeklyAllowance)}원
                      </span>
                    </div>
                  </div>
                )}

                <MinWageComparison
                  wage={parseFloat(hourlyWage.replace(/,/g, ""))}
                  minWage={MIN_WAGE_2025}
                  percentage={hourlyToSalaryResult.percentageOfMinWage}
                  isAbove={hourlyToSalaryResult.isAboveMinWage}
                />

                <div className="p-4 bg-muted rounded-lg text-sm">
                  <div className="font-medium mb-2">계산식</div>
                  <div className="space-y-1 text-xs text-muted-foreground font-mono">
                    <div>월 근무시간 = {weeklyHours}시간 × 4.345주 = {hourlyToSalaryResult.monthlyHours}시간</div>
                    <div>기본 월급 = {formatCurrency(parseFloat(hourlyWage.replace(/,/g, "")))}원 × {hourlyToSalaryResult.monthlyHours}시간 = {formatCurrency(parseFloat(hourlyWage.replace(/,/g, "")) * hourlyToSalaryResult.monthlyHours)}원</div>
                    {includeWeeklyAllowance && hourlyToSalaryResult.weeklyAllowance > 0 && (
                      <div>주휴수당 = {formatCurrency(hourlyToSalaryResult.weeklyAllowance)}원</div>
                    )}
                    <div>연봉 = 월급 × 12개월</div>
                  </div>
                </div>
              </div>
            )}

            {!hourlyToSalaryResult && (
              <div className="text-center py-12 text-muted-foreground">
                시급과 주당 근무시간을 입력하세요
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>2025년 최저시급: {formatCurrency(MIN_WAGE_2025)}원</p>
          <p>월 평균 주수: 4.345주 (1년 52.14주 ÷ 12개월)</p>
          <p>주휴수당: 주 15시간 이상 근무 시 유급휴일 수당이 지급됩니다.</p>
        </div>
      </Card>
    </ToolLayout>
  );
}

interface MinWageComparisonProps {
  wage: number;
  minWage: number;
  percentage: number;
  isAbove: boolean;
}

function MinWageComparison({ wage, minWage, percentage, isAbove }: MinWageComparisonProps) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        isAbove
          ? "bg-green-500/5 border-green-500/20"
          : "bg-red-500/5 border-red-500/20"
      }`}
    >
      <div className="flex items-start gap-2">
        <svg
          className={`h-5 w-5 shrink-0 mt-0.5 ${
            isAbove
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isAbove ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          )}
        </svg>
        <div className="flex-1">
          <div
            className={`font-semibold mb-1 ${
              isAbove
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isAbove ? "최저시급 이상" : "최저시급 미달"}
          </div>
          <div className="text-sm text-muted-foreground">
            현재 시급 {wage.toLocaleString("ko-KR")}원은 2025년 최저시급 {minWage.toLocaleString("ko-KR")}원의{" "}
            <span className="font-semibold">{percentage}%</span>입니다.
          </div>
        </div>
      </div>
    </div>
  );
}
