import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 인코딩/디코딩",
  description: "텍스트를 Base64로 인코딩하거나 디코딩합니다",
  alternates: { canonical: "/tools/base64/" },
  openGraph: {
    title: "Base64 인코딩/디코딩",
    description: "텍스트를 Base64로 인코딩하거나 디코딩합니다",
    url: "/tools/base64/",
  },
  twitter: {
    title: "Base64 인코딩/디코딩 | AlphaK Tools",
    description: "텍스트를 Base64로 인코딩하거나 디코딩합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
