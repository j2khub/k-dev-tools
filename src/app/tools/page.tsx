import { FavoritesSection } from "@/components/FavoritesSection";
import { ToolsSection } from "@/components/ToolsSection";

export default function ToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AlphaK Tools</h1>
        <p className="text-muted-foreground">
          빠르고 무료인 온라인 도구 모음. 내 데이터는 내 브라우저 안에서만. 서버 전송 없음.
        </p>
      </div>
      <FavoritesSection />
      <ToolsSection />
    </div>
  );
}
