import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BMI 계산기",
  description: "키와 몸무게로 체질량지수(BMI)를 계산합니다",
  alternates: { canonical: "/tools/bmi-calc/" },
  openGraph: {
    title: "BMI 계산기",
    description: "키와 몸무게로 체질량지수(BMI)를 계산합니다",
    url: "/tools/bmi-calc/",
  },
  twitter: {
    title: "BMI 계산기 | AlphaK Tools",
    description: "키와 몸무게로 체질량지수(BMI)를 계산합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
