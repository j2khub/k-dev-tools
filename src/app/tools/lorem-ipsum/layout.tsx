import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lorem Ipsum 생성기",
  description: "더미 텍스트를 원하는 분량만큼 생성합니다",
  alternates: { canonical: "/tools/lorem-ipsum/" },
  openGraph: {
    title: "Lorem Ipsum 생성기",
    description: "더미 텍스트를 원하는 분량만큼 생성합니다",
    url: "/tools/lorem-ipsum/",
  },
  twitter: {
    title: "Lorem Ipsum 생성기 | AlphaK Tools",
    description: "더미 텍스트를 원하는 분량만큼 생성합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
