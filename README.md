# PassportKita CMS

Content Management System untuk mengelola tours PassportKita.

## 🚀 Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Routing
- **Zustand** - State management
- **React Query** - Data fetching
- **React Hook Form** - Form handling
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## 📋 Prerequisites

- Node.js 18+
- Backend API running (see backend README)

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` ke `.env` dan isi dengan konfigurasi:

```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Run Development Server

```bash
npm run dev
```

CMS akan berjalan di `http://localhost:5173`

## 📚 Features

- ✅ Authentication (Login/Register)
- ✅ Tour Management (CRUD)
- ✅ Image Upload
- ✅ Responsive Design
- ✅ Modern UI dengan shadcn/ui

## 🎨 Adding shadcn/ui Components

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add table
```

## 📦 Project Structure

```
passport-kita-cms/
├── src/
│   ├── api/           # API clients
│   ├── components/     # React components
│   │   ├── ui/        # shadcn/ui components
│   │   ├── layout/    # Layout components
│   │   └── tours/     # Tour-specific components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── store/         # Zustand stores
│   └── utils/         # Utility functions
├── components.json    # shadcn/ui config
└── package.json
```

## 🔐 Default Credentials

- Email: `admin@passportkita.com`
- Password: `admin123`

## 📖 Documentation

Lihat dokumentasi lengkap di:
- `QUICK_START_GUIDE.md`
- `TASK_LIST.md`
- `TOUR_INTEGRATION_GUIDE.md`
