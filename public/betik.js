// ===== Durum (state) =====
let tumEtkinlikler = [];
let seciliTur = "tumu";
let aramaMetni = "";

// ===== Sayfadaki öğeler =====
const liste = document.getElementById("etkinlik-listesi");
const durumMesaji = document.getElementById("durum-mesaji");
const aramaKutusu = document.getElementById("arama-kutusu");
const filtreDugmeleri = document.querySelectorAll(".filtre-dugme");
const form = document.getElementById("oneri-formu");
const formMesaji = document.getElementById("form-mesaji");

const TUR_ADLARI = {
  atolye: "Atölye",
  soylesi: "Söyleşi",
  topluluk: "Topluluk",
};

// ===== C1: Kart oluşturma (innerHTML yok) =====
function kartOlustur(etkinlik) {
  const kart = document.createElement("article");
  kart.classList.add("kart");

  const baslik = document.createElement("h3");
  baslik.textContent = etkinlik.baslik;

  const tarih = document.createElement("p");
  const tarihNesnesi = new Date(etkinlik.tarih + "T00:00:00");
  tarih.textContent = "Tarih: " + tarihNesnesi.toLocaleDateString("tr-TR");

  const yer = document.createElement("p");
  yer.textContent = "Yer: " + etkinlik.yer;

  const kontenjan = document.createElement("p");
  kontenjan.textContent = "Kontenjan: " + etkinlik.kontenjan;

  const etiket = document.createElement("span");
  etiket.classList.add("etiket", "etiket-" + etkinlik.tur);
  etiket.textContent = TUR_ADLARI[etkinlik.tur] || etkinlik.tur;

  kart.append(baslik, tarih, yer, kontenjan, etiket);
  return kart;
}

// ===== C2: Filtre ve aramayı birlikte uygulayan çizim =====
function cizimYap() {
  liste.replaceChildren(); // önceki kartları temizle

  const aranan = aramaMetni.toLocaleLowerCase("tr-TR");

  const sonuc = tumEtkinlikler.filter((e) => {
    const turUyuyor = seciliTur === "tumu" || e.tur === seciliTur;
    const aramaUyuyor = e.baslik.toLocaleLowerCase("tr-TR").includes(aranan);
    return turUyuyor && aramaUyuyor;
  });

  if (sonuc.length === 0) {
    durumMesaji.textContent = "Aramanıza uygun etkinlik yok.";
    return;
  }

  durumMesaji.textContent = "";
  liste.append(...sonuc.map(kartOlustur));
}

filtreDugmeleri.forEach((dugme) => {
  dugme.addEventListener("click", () => {
    filtreDugmeleri.forEach((d) => d.classList.remove("secili"));
    dugme.classList.add("secili");
    seciliTur = dugme.dataset.tur;
    cizimYap();
  });
});

aramaKutusu.addEventListener("input", () => {
  aramaMetni = aramaKutusu.value.trim();
  cizimYap();
});

// ===== D2: fetch ile API'den veri çekme =====
async function etkinlikleriYukle() {
  durumMesaji.textContent = "Yükleniyor...";
  liste.replaceChildren();

  try {
    const yanit = await fetch("/api/etkinlikler");
    if (!yanit.ok) {
      throw new Error("Sunucu hatası: " + yanit.status);
    }
    tumEtkinlikler = await yanit.json();
    cizimYap();
  } catch (hata) {
    console.error(hata);
    durumMesaji.textContent =
      "Etkinlikler yüklenemedi. Sunucunun çalıştığından emin olup sayfayı yenileyin.";
  }
}

// ===== C3: Form doğrulama =====
form.addEventListener("submit", (olay) => {
  olay.preventDefault();

  const ad = form.elements["ad"].value.trim();
  const tarih = form.elements["tarih"].value;
  const eposta = form.elements["eposta"].value.trim();
  const hatalar = [];

  if (ad.length < 5) {
    hatalar.push("Etkinlik adı en az 5 karakter olmalı.");
  }

  if (tarih === "") {
    hatalar.push("Tarih boş olamaz.");
  } else {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    if (new Date(tarih + "T00:00:00") < bugun) {
      hatalar.push("Tarih geçmiş bir gün olamaz.");
    }
  }

  const epostaDesen = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!epostaDesen.test(eposta)) {
    hatalar.push("Geçerli bir e-posta adresi girin.");
  }

  formMesaji.classList.remove("hata", "basari");

  if (hatalar.length > 0) {
    formMesaji.classList.add("hata");
    formMesaji.textContent = hatalar.join(" ");
    return;
  }

  formMesaji.classList.add("basari");
  formMesaji.textContent = "Teşekkürler! Öneriniz alındı.";
  form.reset();
});

// ===== Başlangıç =====
etkinlikleriYukle();