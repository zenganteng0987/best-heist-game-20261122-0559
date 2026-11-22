# Malam di Museum Sari

[![Malam di Museum Sari](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![Rank](https://make.fun/badge/best-heist-game-20261122-0559/zenganteng0987/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![Reward](https://make.fun/badge/best-heist-game-20261122-0559/zenganteng0987/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

Game heist top-down 2D original: Rani menyelinap ke Museum Sari tengah malam, melewati tiga ruangan — Galeri Lukisan, Koridor Tengah, dan Ruang Brankas — untuk mencuri **Berlian Sari** lalu kabur lewat pintu keluar sebelum alarm mencapai 100%.

## Cara main

- **Bergerak:** WASD / tombol panah, atau klik titik di lantai untuk jalan ke sana.
- **Penjaga:** tiga satpam patroli mengikuti rute waypoint. Kerucut penglihatan mereka terlihat jelas; kalau Rani masuk kerucut dan tidak terhalang etalase atau dinding, mereka mengejar. Kalau kehilangan jejak, mereka mencari di tempat terakhir Rani terlihat, lalu kembali ke rute.
- **CCTV:** tiga kamera menyapu kerucutnya bolak-balik. Masuk kerucut kamera menaikkan alarm lebih pelan dari penjaga.
- **Alarm meter:** naik saat terlihat (penjaga lebih cepat dari kamera), turun pelan saat bersembunyi. Di 100% museum terkunci dan Rani ketahuan.
- **Loot:** koin emas tersebar di tiga ruangan (25 koin tiap satu). Berlian Sari ada di atas pedestal di Ruang Brankas (500 koin). Ambil berlian, lalu sampai ke pintu KELUAR di kiri bawah untuk menang.
- **Tools berbayar (pakai koin):**
  - `[1]` / `Q` — Bom asap (50 koin): 4 detik tak terlihat oleh penjaga.
  - `[2]` / `E` — Jammer (75 koin): 6 detik semua CCTV buta.
- **Jeda:** `P` atau `Esc`. **Mulai / main lagi:** Spasi atau klik.
- **Suara:** semua efek suara disintesis dengan WebAudio (tidak ada file audio).

## Cara jalanin

```sh
node serve.ts
```

Lalu buka http://localhost:8080 di desktop Chrome. Tidak ada build step dan tidak ada request network — semua file ada di bawah `game/`.

## Struktur source

- `game/index.html` — halaman game, satu canvas penuh layar.
- `game/src/config.js` — semua angka tuning dan warna.
- `game/src/random.js` — generator acak berseed (mulberry32).
- `game/src/world.js` — museum: ruangan, dinding, etalase, loot, dan helper geometri (tabrakan, garis pandang, kerucut penglihatan).
- `game/src/thief.js` — gerakan Rani (keyboard + klik).
- `game/src/guard.js` — penjaga: patroli, kejar, cari, kembali.
- `game/src/camera.js` — CCTV: sapuan kerucut dan deteksi.
- `game/src/loot.js` — koin, Berlian Sari, dan pintu keluar.
- `game/src/alarm.js` — alarm meter naik/turun.
- `game/src/game.js` — state heist dan satu fungsi step yang memajukan semuanya.
- `game/src/render.js` — semua yang digambar: lantai, kerucut, HUD, layar judul/jeda/menang/ketahuan.
- `game/src/audio.js` — suara sintetis WebAudio.
- `game/src/input.js` — keyboard dan mouse.
- `game/src/shots.js` — scene screenshot deterministik (`?shot=cover|patrol|alert|exit`).
- `game/src/main.js` — boot dan loop utama.
- `main.ts` — program penyerahan: menyalin `game/` dan `screenshots/` ke `/output` dan menulis `dossier.json`.
- `serve.ts` — server statis lokal untuk `game/`.

Dibuat untuk [make.fun](https://make.fun/bounty/best-heist-game-20261122-0559?ref=7z4nfrpv) — bounty best heist game.
