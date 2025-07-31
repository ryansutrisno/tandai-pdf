# Tandai PDF

**Your personal PDF reader with smart bookmarking.**

Tandai PDF is a modern, Progressive Web App (PWA) that provides an intuitive PDF reading experience with intelligent bookmarking and reading position memory. Built with Next.js 15 and designed for both desktop and mobile devices.

## ✨ Features

### Core Features

- **📖 PDF Display**: High-quality PDF rendering with smooth zoom and scrolling
- **🔖 Smart Bookmarking**: Add bookmarks at any page and save them locally
- **💾 Reading Position Memory**: Automatically saves and restores your last reading position for each document
- **🔍 Full-Text Search**: Search through PDF content with highlighted results
- **📱 Progressive Web App**: Install on any device for native app-like experience
- **🌓 Dark/Light Theme**: Toggle between themes for comfortable reading
- **🌐 Multilingual Support**: Available in English and Indonesian
- **📚 Personal Library**: Manage your PDF collection with local storage

### User Experience

- **🎨 Clean Interface**: Minimalist design focused on readability
- **📱 Mobile Optimized**: Responsive design that works perfectly on all screen sizes
- **⚡ Fast Performance**: Optimized loading and rendering for smooth experience
- **🔄 Offline Support**: Read your PDFs even without internet connection
- **🎯 Fullscreen Mode**: Distraction-free reading experience

## 🛠️ Tech Stack

### Frontend Framework

- **Next.js 15.3.3** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5** - Type safety and better development experience

### UI & Styling

- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful icon library
- **next-themes** - Theme switching functionality
- **Literata Font** - Optimized serif typeface for reading

### PDF Processing

- **react-pdf 9.1.0** - PDF rendering in React
- **PDF.js** - Mozilla's PDF rendering engine

### Data Management

- **Dexie 4.0.7** - IndexedDB wrapper for local storage
- **dexie-react-hooks** - React hooks for Dexie

### PWA & Performance

- **@ducanh2912/next-pwa** - Progressive Web App functionality
- **@vercel/analytics** - Performance monitoring

### AI Integration

- **Google AI Genkit** - AI capabilities (future features)
- **Firebase 11.9.1** - Backend services

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Turbopack** - Fast bundler for development

## 🚀 Installation

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone [<repository-url>](https://github.com/ryansutrisno/tandai-pdf)
   cd tandai-pdf
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
   Or with yarn:
   ```bash
   yarn install
   ```
3. **Run the development server**
   ```bash
   npm run dev
   ```
   Or with yarn:
   ```bash
   yarn dev
   ```
   Open your browser and navigate to http://localhost:9002
4. **Build for production**
   ```bash
   npm run build
   ```
   Or with yarn:
   ```bash
   yarn build
   ```
5. **Start the production server**
   ```bash
   npm start
   ```
   Or with yarn:
   ```bash
   yarn start
   ```
