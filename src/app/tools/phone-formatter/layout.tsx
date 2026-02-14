import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전화번호 포매터",
  description: "한국 전화번호를 올바른 형식으로 변환합니다",
  alternates: { canonical: "/tools/phone-formatter/" },
  openGraph: {
    title: "전화번호 포매터",
    description: "한국 전화번호를 올바른 형식으로 변환합니다",
    url: "/tools/phone-formatter/",
  },
  twitter: {
    title: "전화번호 포매터 | AlphaK Tools",
    description: "한국 전화번호를 올바른 형식으로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
