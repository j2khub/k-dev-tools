import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "날씨",
  description:
    "서울, 부산, 인천, 대구, 대전, 광주, 울산, 제주 등 한국 주요 도시의 현재 날씨, 시간별 기온, 7일 예보를 확인하세요.",
  alternates: { canonical: "/weather/" },
  openGraph: {
    title: "날씨",
    description: "한국 주요 도시 현재 날씨와 7일 예보",
    url: "/weather",
  },
  twitter: {
    title: "날씨 | AlphaK Tools",
    description: "한국 주요 도시 현재 날씨와 7일 예보",
  },
};

export default function WeatherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
