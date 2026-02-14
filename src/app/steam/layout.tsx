import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Steam 트렌드",
  description:
    "Steam 인기 게임, 최신 할인, 신규 출시 게임 정보를 한눈에 확인하세요.",
  alternates: { canonical: "/steam/" },
  openGraph: {
    title: "Steam 트렌드",
    description: "Steam 인기 게임, 최신 할인, 신규 출시 게임 정보",
    url: "/steam",
  },
  twitter: {
    title: "Steam 트렌드 | AlphaK Tools",
    description: "Steam 인기 게임, 최신 할인, 신규 출시 게임 정보",
  },
};

export default function SteamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
