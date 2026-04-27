# 🎓 Reviso — Smart Study Tracker

Reviso is a premium, full-stack study tracking application designed to help students and lifelong learners organize their study sessions, track progress through beautiful analytics, and build long-lasting habits.

![Version](https://img.shields.io/badge/version-1.0.0-emerald)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

## ✨ Key Features

- **📊 Advanced Analytics**: Visualize your study patterns with interactive bar charts and subject-specific pie charts.
- **🔥 Activity Heatmap**: Track your consistency over time with a GitHub-style study heatmap.
- **🎯 Goal Management**: Set and track daily, weekly, and monthly study targets with real-time progress bars.
- **📝 Detailed Logging**: Log study sessions with specific topics, notes, and mood tracking.
- **🎨 Premium UI/UX**: A modern, responsive interface featuring emerald-themed aesthetics, custom loaders, and smooth animations.
- **🌓 Dark Mode**: Fully supported dark and light modes that respect your system preferences.
- **🔒 Secure Auth**: Robust authentication system powered by NextAuth.js.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via Mongoose)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/reviso.git
   cd reviso
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📦 Deployment

This application is optimized for deployment on the [Vercel Platform](https://vercel.com/).

### Important Deployment Notes
- Ensure `MONGODB_URI` and `NEXTAUTH_SECRET` are set in your Vercel project settings.
- Whitelist `0.0.0.0/0` in your MongoDB Atlas Network Access settings to allow Vercel's dynamic IPs.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for better learning.
