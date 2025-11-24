# 🚀 Panduan Setup CMS PassportKita

Panduan lengkap untuk setup dan menjalankan CMS PassportKita.

---

## 📋 Prerequisites

- ✅ Backend API sudah berjalan di `http://localhost:3001`
- ✅ Node.js 18+ terinstall
- ✅ npm atau yarn terinstall

---

## 🛠️ Langkah-langkah Setup

### Step 1: Masuk ke Direktori CMS

```bash
cd passport-kita-cms
```

### Step 2: Install Dependencies

```bash
npm install
```

**Catatan**: Jika ada error, coba:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Step 3: Setup Environment Variables

Buat file `.env` di root folder `passport-kita-cms`:

```bash
# Di terminal
touch .env
```

Atau buat manual dengan isi:

```env
VITE_API_URL=http://localhost:3001/api
```

**Penting**: 
- Pastikan backend berjalan di port 3001
- Jika backend di port lain, sesuaikan URL-nya

### Step 4: Verifikasi Komponen shadcn/ui

Komponen berikut sudah terinstall:
- ✅ button
- ✅ card
- ✅ dialog
- ✅ form
- ✅ input
- ✅ label
- ✅ table

Jika perlu menambah komponen lain:

```bash
npx shadcn@latest add [component-name]
```

Contoh:
```bash
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add toast
```

### Step 5: Jalankan Development Server

```bash
npm run dev
```

CMS akan berjalan di: **http://localhost:5173**

---

## ✅ Verifikasi Setup

### 1. Cek Backend Connection

Buka browser console (F12) dan cek apakah ada error connection ke backend.

### 2. Test API Connection

Buka terminal baru dan test:

```bash
curl http://localhost:3001/api/health
```

Harus return:
```json
{
  "status": "ok",
  "message": "API is running",
  "timestamp": "..."
}
```

### 3. Cek CMS Running

Buka browser di `http://localhost:5173` - harus muncul halaman (meskipun masih default Vite).

---

## 🎯 Next Steps - Setup Routing & Pages

Setelah CMS berjalan, langkah selanjutnya:

### 1. Setup React Router

File `src/App.tsx` masih default. Perlu dibuat routing structure.

### 2. Buat Halaman Login

- Halaman login di `src/pages/Auth/Login.tsx`
- Form dengan email & password
- Integrasi dengan `authApi.login()`

### 3. Buat Layout

- Sidebar navigation
- Header dengan user menu
- Protected route wrapper

### 4. Buat Tour Management Pages

- Tours list page
- Tour create/edit form
- Tour detail view

---

## 🔐 Default Credentials

Gunakan credentials dari backend:

- **Email**: `admin@passportkita.com`
- **Password**: `admin123`

---

## 🐛 Troubleshooting

### Error: Cannot find module

```bash
# Clear cache dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: Port 5173 already in use

```bash
# Kill process
lsof -ti:5173 | xargs kill

# Atau ubah port di vite.config.ts
```

### Error: Cannot connect to backend

1. **Cek backend berjalan**:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Cek CORS di backend**:
   Pastikan `CORS_ORIGIN` di backend `.env` include `http://localhost:5173`

3. **Cek VITE_API_URL**:
   Pastikan file `.env` ada dan berisi:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

### Error: shadcn/ui components not found

```bash
# Reinstall components
npx shadcn@latest add [component-name]
```

### Vite HMR not working

```bash
# Restart dev server
# Tekan Ctrl+C untuk stop
npm run dev
```

---

## 📦 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 📁 Project Structure

```
passport-kita-cms/
├── src/
│   ├── api/              # API clients (✅ sudah ada)
│   │   ├── auth.api.ts
│   │   └── tour.api.ts
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components (✅ sudah ada)
│   │   ├── layout/      # Layout components (📁 kosong)
│   │   └── tours/       # Tour components (📁 kosong)
│   ├── pages/            # Page components
│   │   ├── Auth/        # Auth pages (📁 kosong)
│   │   ├── Tours/       # Tour pages (📁 kosong)
│   │   └── Dashboard/   # Dashboard (📁 kosong)
│   ├── store/           # Zustand stores (✅ sudah ada)
│   │   └── authStore.ts
│   ├── utils/           # Utilities (✅ sudah ada)
│   │   └── api.ts
│   ├── App.tsx          # ⚠️ Masih default, perlu routing
│   └── main.tsx         # ✅ Entry point
├── .env                  # ⚠️ Perlu dibuat
├── components.json       # ✅ shadcn/ui config
└── package.json          # ✅ Dependencies
```

---

## 🎨 Development Tips

1. **Hot Module Replacement (HMR)**: 
   - Perubahan file langsung terlihat di browser
   - Tidak perlu refresh manual

2. **Browser DevTools**:
   - Gunakan React DevTools extension
   - Check Network tab untuk API calls
   - Check Console untuk errors

3. **TypeScript**:
   - Semua file menggunakan TypeScript
   - Type safety untuk API calls
   - Auto-complete di IDE

---

## 📚 Related Documentation

- `README.md` - CMS documentation
- `../SETUP_INSTRUCTIONS.md` - Setup semua project
- `../PROJECT_SETUP_PROGRESS.md` - Progress summary

---

## ✅ Checklist Setup

- [ ] Dependencies terinstall (`npm install`)
- [ ] File `.env` dibuat dengan `VITE_API_URL`
- [ ] Backend API berjalan di port 3001
- [ ] CMS dev server berjalan (`npm run dev`)
- [ ] Browser bisa akses `http://localhost:5173`
- [ ] Tidak ada error di console

---

**Setelah semua checklist ✅, CMS siap untuk development!**

Selanjutnya bisa mulai membuat halaman login dan routing structure.

