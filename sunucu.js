const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC_KLASORU = path.join(__dirname, "public");
const VERI_DOSYASI = path.join(__dirname, "etkinlikler.json");

// Dosya uzantısına göre Content-Type başlığı
const ICERIK_TURLERI = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function jsonGonder(res, durum, veri) {
  res.writeHead(durum, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(veri));
}

function metinGonder(res, durum, metin, ekBasliklar = {}) {
  res.writeHead(durum, {
    "Content-Type": "text/plain; charset=utf-8",
    ...ekBasliklar,
  });
  res.end(metin);
}

async function etkinlikleriOku() {
  const metin = await fs.promises.readFile(VERI_DOSYASI, "utf-8");
  return JSON.parse(metin);
}

async function dosyaGonder(res, istekYolu) {
  let yol = istekYolu === "/" ? "/index.html" : istekYolu;

  let cozulmusYol;
  try {
    cozulmusYol = decodeURIComponent(yol);
  } catch {
    return metinGonder(res, 404, "Sayfa bulunamadı");
  }

  // Sadece public/ klasörünün içine izin ver (../ ile dışarı çıkılamaz)
  const tamYol = path.join(PUBLIC_KLASORU, cozulmusYol);
  if (!tamYol.startsWith(PUBLIC_KLASORU + path.sep)) {
    return metinGonder(res, 404, "Sayfa bulunamadı");
  }

  try {
    const icerik = await fs.promises.readFile(tamYol);
    const uzanti = path.extname(tamYol).toLowerCase();
    const tur = ICERIK_TURLERI[uzanti] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": tur });
    res.end(icerik);
  } catch {
    metinGonder(res, 404, "Sayfa bulunamadı");
  }
}

const sunucu = http.createServer(async (req, res) => {
  console.log(req.method, req.url);

  // GET dışındaki yöntemler: 405
  if (req.method !== "GET") {
    return metinGonder(res, 405, "Bu yöntem desteklenmiyor", { Allow: "GET" });
  }

  const url = new URL(req.url, "http://localhost");
  const yol = url.pathname;

  try {
    // GET /api/etkinlikler  veya  /api/etkinlikler?tur=atolye
    if (yol === "/api/etkinlikler") {
      let etkinlikler = await etkinlikleriOku();
      const tur = url.searchParams.get("tur");
      if (tur) {
        etkinlikler = etkinlikler.filter((e) => e.tur === tur);
      }
      return jsonGonder(res, 200, etkinlikler);
    }

    // GET /api/etkinlikler/3
    const eslesme = yol.match(/^\/api\/etkinlikler\/(\d+)$/);
    if (eslesme) {
      const id = Number(eslesme[1]);
      const etkinlikler = await etkinlikleriOku();
      const etkinlik = etkinlikler.find((e) => e.id === id);
      if (!etkinlik) {
        return jsonGonder(res, 404, { hata: "Etkinlik bulunamadı" });
      }
      return jsonGonder(res, 200, etkinlik);
    }

    // Diğer her şey: public/ altındaki dosya mı?
    await dosyaGonder(res, yol);
  } catch (hata) {
    console.error("Sunucu hatası:", hata.message);
    jsonGonder(res, 500, { hata: "Sunucu hatası" });
  }
});

sunucu.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});