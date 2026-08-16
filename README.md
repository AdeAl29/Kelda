# Kelda — Interactive Birthday Surprise Card 🎂❤️

Website ucapan ulang tahun interaktif premium, penuh animasi, sinematik, dan elegan yang dibuat khusus untuk merayakan ulang tahun ke-33 **Kelda** (Hilda) pada 16 Agustus 2026 dari sang adik.

---

## ✨ Fitur Utama
- **3D Card Mechanics**: Kartu fisik 3D dengan tekstur midnight luxury, cap stempel lilin (*wax seal*), dan efek 3D Parallax & Gyroscope mengikuti cursor/touch.
- **Parchment Letter Reveal**: Lembar surat keluar dari kartu dengan efek teks bertahap (*staggered blur, slide & fade*).
- **3D Birthday Cake**: Kue bertingkat realistis dengan lilin angka **33** dan animasi api dinamis.
- **Interactive Candle Blowing**: Mendukung deteksi hembusan nafas langsung melalui mikrofon (`Web Audio API`) serta tombol sentuh instan.
- **Celebration & Confetti**: Ledakan confetti, balon melayang, kembang api partikel, dan kartu pesan penutup.
- **Zero-Dependency Synthesizer**: BGM piano ambient lembut dan sound effect realistis bertenaga Web Audio API tanpa risiko audio 404.

---

## 🚀 Cara Menjalankan
Buka file `index.html` langsung di browser, atau jalankan local server:

```bash
# Menggunakan Python
python -m http.server 3000

# Atau menggunakan Node
npx serve .
```

Buka browser di `http://localhost:3000`.

---

## 🛠️ Teknologi
- **HTML5 & CSS3** (Vanilla 3D Transforms, Glassmorphism, CSS Variables)
- **JavaScript ES6+**
- **Web Audio API**
- **GSAP & Canvas Confetti**
