# LivePlan³

**LivePlan³** is a personal finance management app built with React, Vite, TailwindCSS, and Supabase. The goal is to provide complete control over income, expenses, investments, goals, and financial planning based on smart resource allocation principles.

---

## 🚀 Main Features

- ✅ Sign up and login with email + confirmation via Supabase
- 📊 50/30/20 financial planning formula
- 📁 Import financial spreadsheets (.xlsx or .csv)
- 📅 View goals, expenses, investments, and balances
- 🔔 Notifications and responsive design for mobile
- 🧾 Financial statement generation
- 🏷️ Automatic and manual transaction categorization
- 💾 Persistent storage with Supabase
- 📈 Smooth animations with Framer Motion

---

## 📦 Tech Stack

- **React 18** + **TypeScript**
- **Vite** for fast builds
- **TailwindCSS** for modern design
- **Supabase** (Auth + DB + Storage)
- **Zustand** for global state management
- **Lucide-react** for icons
- **Framer Motion** for animations

---

## 📂 Project Structure

```
src/
├── components/        # Reusable components
├── pages/             # Main pages (Home, Login, etc.)
├── stores/            # Zustand stores
├── lib/               # Supabase client and helpers
├── utils/             # Formatters and utility functions
├── assets/            # Icons and images
```

---

## 🛠️ How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/liveplan3.git
cd liveplan3
```

### 2. Install dependencies

```bash
pnpm install
```

> Or use `npm install` if you prefer.

### 3. Start the local server

```bash
pnpm run dev
```

### 4. Open in your browser

```
http://localhost:5173
```

---

## 🔐 Required Environment Variables (`.env`)

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🧪 Pre-launch Checklist

- [x] Login and email confirmation tested
- [x] Spreadsheet import working
- [x] Formula³ calculations accurate
- [x] Session persistence
- [x] Data visible and updating correctly
- [x] Responsiveness tested on mobile
- [x] No redirect to `/onboarding`

---

## 🧑‍💻 Created by

Helio Woi  
CEO & Creator of LivePlan³  
[linkedin.com/in/helio-woicichowski](https://linkedin.com/in/helio-woicichowski)

---

## 📃 License

MIT — feel free to adapt, improve, or distribute with credit.
