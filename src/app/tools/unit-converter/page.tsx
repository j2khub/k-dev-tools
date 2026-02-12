"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftRight } from "lucide-react";

type Category = "length" | "weight" | "temperature" | "speed";

const units = {
  length: [
    { label: "밀리미터 (mm)", value: "mm", toBase: 0.001 },
    { label: "센티미터 (cm)", value: "cm", toBase: 0.01 },
    { label: "미터 (m)", value: "m", toBase: 1 },
    { label: "킬로미터 (km)", value: "km", toBase: 1000 },
    { label: "인치 (inch)", value: "inch", toBase: 0.0254 },
    { label: "피트 (feet)", value: "feet", toBase: 0.3048 },
    { label: "야드 (yard)", value: "yard", toBase: 0.9144 },
    { label: "마일 (mile)", value: "mile", toBase: 1609.344 },
  ],
  weight: [
    { label: "밀리그램 (mg)", value: "mg", toBase: 0.000001 },
    { label: "그램 (g)", value: "g", toBase: 0.001 },
    { label: "킬로그램 (kg)", value: "kg", toBase: 1 },
    { label: "톤 (ton)", value: "ton", toBase: 1000 },
    { label: "온스 (oz)", value: "oz", toBase: 0.0283495 },
    { label: "파운드 (lb)", value: "lb", toBase: 0.453592 },
  ],
  temperature: [
    { label: "섭씨 (°C)", value: "celsius" },
    { label: "화씨 (°F)", value: "fahrenheit" },
    { label: "켈빈 (K)", value: "kelvin" },
  ],
  speed: [
    { label: "m/s", value: "ms", toBase: 1 },
    { label: "km/h", value: "kmh", toBase: 0.277778 },
    { label: "mph", value: "mph", toBase: 0.44704 },
    { label: "knot", value: "knot", toBase: 0.514444 },
  ],
};

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>("length");
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState(units.length[2].value); // m
  const [toUnit, setToUnit] = useState(units.length[3].value); // km

  const result = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return null;

    const currentUnits = units[category];

    if (category === "temperature") {
      // Temperature conversion
      let celsius: number;

      // Convert to Celsius first
      if (fromUnit === "celsius") celsius = num;
      else if (fromUnit === "fahrenheit") celsius = ((num - 32) * 5) / 9;
      else celsius = num - 273.15; // kelvin

      // Convert from Celsius to target
      if (toUnit === "celsius") return celsius.toFixed(2);
      else if (toUnit === "fahrenheit") return (celsius * (9 / 5) + 32).toFixed(2);
      else return (celsius + 273.15).toFixed(2); // kelvin
    } else {
      // Other conversions (length, weight, speed)
      const from = currentUnits.find((u) => u.value === fromUnit) as { label: string; value: string; toBase?: number } | undefined;
      const to = currentUnits.find((u) => u.value === toUnit) as { label: string; value: string; toBase?: number } | undefined;

      if (!from || !to || !from.toBase || !to.toBase) return null;

      const baseValue = num * from.toBase;
      const converted = baseValue / to.toBase;
      return converted.toFixed(6).replace(/\.?0+$/, "");
    }
  }, [value, fromUnit, toUnit, category]);

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
    setValue("");
    const newUnits = units[newCategory];
    setFromUnit(newUnits[0].value);
    setToUnit(newUnits[1].value);
  };

  const currentUnits = units[category];

  return (
    <ToolLayout
      title="단위 변환기"
      description="길이, 무게, 온도, 속도 단위를 변환합니다"
    >
      <Card className="p-4 space-y-6">
        <div>
          <Label className="mb-3 block">카테고리</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              variant={category === "length" ? "default" : "outline"}
              onClick={() => handleCategoryChange("length")}
            >
              길이
            </Button>
            <Button
              variant={category === "weight" ? "default" : "outline"}
              onClick={() => handleCategoryChange("weight")}
            >
              무게
            </Button>
            <Button
              variant={category === "temperature" ? "default" : "outline"}
              onClick={() => handleCategoryChange("temperature")}
            >
              온도
            </Button>
            <Button
              variant={category === "speed" ? "default" : "outline"}
              onClick={() => handleCategoryChange("speed")}
            >
              속도
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="from-unit">변환할 단위</Label>
            <select
              id="from-unit"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-transparent mt-1"
            >
              {currentUnits.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="value-input">값</Label>
            <Input
              id="value-input"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="100"
              className="font-mono text-lg"
              step="any"
            />
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwap}
              className="rounded-full"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Label htmlFor="to-unit">변환될 단위</Label>
            <select
              id="to-unit"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-transparent mt-1"
            >
              {currentUnits.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          {result !== null && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">결과</div>
              <div className="text-3xl font-bold font-mono">{result}</div>
              <div className="text-xs text-muted-foreground mt-2">
                {value} {currentUnits.find((u) => u.value === fromUnit)?.label} ={" "}
                {result} {currentUnits.find((u) => u.value === toUnit)?.label}
              </div>
            </div>
          )}
        </div>
      </Card>
    </ToolLayout>
  );
}
