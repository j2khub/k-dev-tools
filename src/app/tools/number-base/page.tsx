"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

const BASES = [
  { label: "2진수 (Binary)", base: 2, prefix: "0b", placeholder: "1010" },
  { label: "8진수 (Octal)", base: 8, prefix: "0o", placeholder: "12" },
  { label: "10진수 (Decimal)", base: 10, prefix: "", placeholder: "10" },
  { label: "16진수 (Hex)", base: 16, prefix: "0x", placeholder: "A" },
];

export default function NumberBase() {
  const [values, setValues] = useState<Record<number, string>>({
    2: "", 8: "", 10: "", 16: "",
  });
  const { copied, copy } = useCopyToClipboard();

  const handleChange = (base: number, value: string) => {
    const clean = value.replace(/^0[bBoOxX]/, "");
    const num = parseInt(clean, base);
    if (clean === "" || isNaN(num)) {
      setValues({ 2: "", 8: "", 10: "", 16: "", [base]: value });
      return;
    }
    setValues({
      2: num.toString(2),
      8: num.toString(8),
      10: num.toString(10),
      16: num.toString(16).toUpperCase(),
      [base]: value,
    });
  };

  return (
    <ToolLayout
      title="진법 변환기"
      description="2진수, 8진수, 10진수, 16진수를 상호 변환합니다"
    >
      <Card className="p-4 space-y-4">
        {BASES.map((b) => (
          <div key={b.base}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">{b.label}</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copy(`${b.prefix}${values[b.base]}`)}
                disabled={!values[b.base]}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <input
              type="text"
              value={values[b.base]}
              onChange={(e) => handleChange(b.base, e.target.value)}
              placeholder={b.placeholder}
              className="w-full px-3 py-2 text-sm font-mono border rounded-md bg-transparent"
            />
          </div>
        ))}
      </Card>
    </ToolLayout>
  );
}
