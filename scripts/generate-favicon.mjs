import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// α (Greek alpha) + 회로 패턴 파비콘 SVG
// 참고 이미지: 그리스 알파 문자 안에 PCB 회로 패턴
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141420"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
    <!-- α 형태 마스크: 실제 그리스 알파(α) 글리프 - 굵게 -->
    <mask id="am" maskUnits="userSpaceOnUse">
      <rect width="512" height="512" fill="black"/>
      <text x="248" y="420" font-family="Georgia, 'Times New Roman', serif"
            font-size="560" font-weight="bold" text-anchor="middle"
            fill="white">α</text>
    </mask>
  </defs>

  <!-- 배경 -->
  <rect width="512" height="512" rx="108" fill="url(#bg)"/>

  <!-- α 본체 + 회로 패턴 (마스크로 α 영역만 표시) -->
  <g mask="url(#am)">
    <!-- α 기본 채움 -->
    <rect width="512" height="512" fill="#d4d4dc"/>

    <!-- 수평 회로 트레이스 -->
    <g stroke="#11111b" stroke-width="5.5" fill="none" opacity="0.6">
      <line x1="20" y1="78" x2="420" y2="78"/>
      <line x1="20" y1="118" x2="420" y2="118"/>
      <line x1="20" y1="158" x2="420" y2="158"/>
      <line x1="20" y1="198" x2="420" y2="198"/>
      <line x1="20" y1="238" x2="420" y2="238"/>
      <line x1="20" y1="278" x2="420" y2="278"/>
      <line x1="20" y1="318" x2="420" y2="318"/>
      <line x1="20" y1="358" x2="420" y2="358"/>
      <line x1="20" y1="398" x2="420" y2="398"/>
      <line x1="20" y1="438" x2="420" y2="438"/>
      <line x1="20" y1="478" x2="420" y2="478"/>
    </g>

    <!-- 수직 회로 트레이스 -->
    <g stroke="#11111b" stroke-width="4.5" fill="none" opacity="0.45">
      <line x1="128" y1="20" x2="128" y2="500"/>
      <line x1="240" y1="20" x2="240" y2="500"/>
      <line x1="340" y1="20" x2="340" y2="500"/>
    </g>

    <!-- 대각선 커넥터 트레이스 -->
    <g stroke="#11111b" stroke-width="4" fill="none" opacity="0.5">
      <polyline points="128,158 168,158 168,198"/>
      <polyline points="240,278 280,278 280,318"/>
      <polyline points="128,358 178,358 178,398"/>
      <polyline points="340,118 370,118"/>
      <polyline points="340,398 365,398 365,438"/>
    </g>

    <!-- 회로 노드 (접합점) -->
    <g fill="#11111b" opacity="0.7">
      <circle cx="128" cy="118" r="7.5"/>
      <circle cx="240" cy="158" r="7.5"/>
      <circle cx="340" cy="198" r="7"/>
      <circle cx="128" cy="238" r="7.5"/>
      <circle cx="240" cy="318" r="7.5"/>
      <circle cx="128" cy="358" r="7.5"/>
      <circle cx="340" cy="358" r="6.5"/>
      <circle cx="240" cy="438" r="6.5"/>
      <circle cx="340" cy="478" r="6"/>
      <circle cx="168" cy="158" r="5.5"/>
      <circle cx="168" cy="198" r="5.5"/>
      <circle cx="280" cy="278" r="5.5"/>
      <circle cx="280" cy="318" r="5.5"/>
      <circle cx="178" cy="358" r="5.5"/>
      <circle cx="178" cy="398" r="5.5"/>
    </g>
  </g>
</svg>
`;

// ICO 파일 생성 (16x16 + 32x32 + 48x48 PNG을 ICO 컨테이너에 패킹)
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * count;
  let offset = headerSize + dirSize;

  // ICO 헤더
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  const sizes = [16, 32, 48];

  for (let i = 0; i < count; i++) {
    const entry = Buffer.alloc(dirEntrySize);
    const size = sizes[i];
    entry.writeUInt8(size < 256 ? size : 0, 0); // width
    entry.writeUInt8(size < 256 ? size : 0, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(pngBuffers[i].length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset
    dirEntries.push(entry);
    offset += pngBuffers[i].length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

async function main() {
  const svgBuffer = Buffer.from(svg);

  // 다양한 크기로 PNG 생성
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map((size) =>
      sharp(svgBuffer).resize(size, size).png().toBuffer()
    )
  );

  // ICO 생성
  const ico = createIco(pngBuffers);
  writeFileSync(join(ROOT, "src", "app", "favicon.ico"), ico);
  console.log("favicon.ico generated (" + ico.length + " bytes)");

  // 192x192 PNG (PWA / apple-touch-icon 용)
  const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  writeFileSync(join(ROOT, "public", "icon-192.png"), png192);
  console.log("icon-192.png generated");

  // 512x512 PNG
  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  writeFileSync(join(ROOT, "public", "icon-512.png"), png512);
  console.log("icon-512.png generated");

  // SVG 원본 저장
  writeFileSync(join(ROOT, "public", "favicon.svg"), svg.trim());
  console.log("favicon.svg generated");
}

main().catch(console.error);
