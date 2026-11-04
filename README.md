# Kampüs Etkinlik Panosu

BMH231 Web Programlama dersi Ödev 2 için geliştirilen küçük bir web uygulamasıdır.
Kampüs etkinliklerini listeler; etkinlikler Node.js ile yazılmış bir JSON API'den
`fetch` ile çekilir. Ön yüzde HTML, CSS ve JavaScript kullanılmıştır (framework yok);
sunucu yalnızca Node.js'in `http`, `fs` ve `path` modülleriyle yazılmıştır.

## Özellikler

- Etkinlikleri kart olarak listeleme
- Türe göre filtreleme (Atölye, Söyleşi, Topluluk) ve başlıkta arama
- Etkinlik öneri formu ve istemci tarafı doğrulama
- Duyarlı (responsive) tasarım

## Kurulum ve çalıştırma

Node.js (LTS) ve Git kurulu olmalıdır.

```
git clone https://github.com/EcemErgel/bmh231-odev2.git
cd bmh231-odev2
npm start
```

Ardından tarayıcıda http://localhost:3000 adresini açın.