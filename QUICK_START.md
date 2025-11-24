# ⚡ Quick Start - CMS PassportKita

## 🚀 Langkah Cepat Menjalankan CMS

### 1. Masuk ke Folder CMS
```bash
cd passport-kita-cms
```

### 2. Install Dependencies (jika belum)
```bash
npm install
```

### 3. Pastikan File .env Ada
File `.env` sudah dibuat dengan isi:
```
VITE_API_URL=http://localhost:3001/api
```

**Verifikasi**:
```bash
cat .env
```

### 4. Pastikan Backend Berjalan
Backend harus berjalan di `http://localhost:3001`

**Test backend**:
```bash
curl http://localhost:3001/api/health
```

### 5. Jalankan CMS
```bash
npm run dev
```

### 6. Buka Browser
Buka: **http://localhost:5173**

---

## ✅ Selesai!

CMS sekarang berjalan di `http://localhost:5173`

---

## 🐛 Jika Ada Masalah

### Port 5173 sudah digunakan?
```bash
# Kill process
lsof -ti:5173 | xargs kill
```

### Backend tidak connect?
1. Pastikan backend berjalan: `curl http://localhost:3001/api/health`
2. Cek file `.env` ada dan benar
3. Restart CMS: `Ctrl+C` lalu `npm run dev`

### Dependencies error?
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

Setelah CMS berjalan, lihat `CMS_SETUP_GUIDE.md` untuk:
- Setup routing
- Buat halaman login
- Buat tour management pages

