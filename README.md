# Notesy - Voice-Controlled Note-Taking Application

<div align="center">
<a href="https://notesy-chi.vercel.app" target="_blank">
  <img src="https://notesy-chi.vercel.app/favicon.svg" alt="Notesy Logo" width="75"/>
</a>

**The world's first truly voice-controlled note-taking app**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-lightgrey)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)](https://mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)

  <br />
  <a href="https://notesy-chi.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-Notesy-blue?style=for-the-badge&logo=vercel" alt="Live Demo Badge"/>
  </a>
</div>

## 🎯 Overview

Notesy is a revolutionary note-taking application that allows users to create, edit, search, and collaborate on notes entirely through voice commands. Built with modern web technologies, it provides an intuitive and accessible way to manage notes with advanced features like real-time collaboration, AI-powered voice recognition, and comprehensive note organization.

## ✨ Key Features

### 🎤 Voice Control

-   **Complete Voice Navigation**: Navigate the entire app using voice commands
-   **Wake Word Detection**: "Hey Notesy" or "Hey Assistant" to activate voice mode
-   **Natural Language Processing**: Intuitive voice commands for all actions
-   **Page-Specific Commands**: Context-aware voice controls for different sections

### 📝 Note Management

-   **Rich Text Editing**: Create notes with formatting, checklists, and images
-   **Voice-to-Text**: Convert speech to text in real-time
-   **Labels & Organization**: Categorize notes with custom labels
-   **Archive & Trash**: Organize notes with archive and trash functionality
-   **Pinning**: Pin important notes for quick access

### 👥 Collaboration

-   **Real-time Sharing**: Share notes with collaborators instantly
-   **Voice Invitations**: Invite users using voice commands
-   **Permission Management**: Control access levels for shared notes
-   **Live Updates**: See changes from collaborators in real-time

### 🎨 Advanced Features

-   **Excalidraw Integration**: Create and edit drawings with voice commands
-   **Reminders & Scheduling**: Set voice-activated reminders
-   **Statistics & Analytics**: Track your note-taking habits
-   **Cloud Sync**: Access notes from any device
-   **Premium Features**: Advanced voice commands and unlimited storage

### 🔐 Security & Authentication

-   **Firebase Authentication**: Secure user authentication
-   **JWT Tokens**: Stateless authentication with refresh tokens
-   **Data Encryption**: All data encrypted in transit and at rest
-   **Privacy Protection**: Your notes are private and secure

## 🏗️ Architecture

### Frontend (Next.js 15 + React 19)

```
notesy-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   └── (protected)/       # Protected application pages
│   ├── components/            # Reusable UI components
│   │   ├── notes/            # Note-related components
│   │   ├── ui/               # Base UI components
│   │   └── voice-assistant/  # Voice control components
│   ├── redux/                # State management
│   ├── hooks/                # Custom React hooks
│   └── utils/                # Utility functions
```

### Backend (Node.js + Express + TypeScript)

```
notesy-backend/
├── src/
│   ├── controllers/          # Route handlers
│   ├── models/              # MongoDB schemas
│   ├── routes/              # Express routes
│   ├── middlewares/         # Custom middleware
│   ├── config/              # Configuration files
│   ├── jobs/                # Scheduled tasks
│   └── utils/               # Utility functions
```

## 🚀 Quick Start

### Prerequisites

-   **Node.js** 18+
-   **MongoDB** (Atlas or local)
-   **Firebase** project
-   **Stripe** account (for payments)
-   **Cloudinary** account (for image storage)

### 1. Clone the Repository

```bash
# Clone the frontend
git clone <frontend-repo-url>
cd notesy-frontend

# In a new terminal, clone the backend
git clone <backend-repo-url>
cd notesy-backend
```

### 2. Backend Setup

```bash
cd notesy-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Environment Variables (Backend):**

```env
# Server Configuration
PORT=3005
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/notesy

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Firebase Admin
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Client URL
CLIENT_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd notesy-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

**Environment Variables (Frontend):**

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3005

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Start Development Servers

**Terminal 1 - Backend:**

```bash
cd notesy-backend
npm run dev:ts
```

**Terminal 2 - Frontend:**

```bash
cd notesy-frontend
npm run dev
```

Visit `http://localhost:3000` to access the application!

## 🎤 Voice Commands Guide

### Global Navigation Commands

-   **Wake Words**: "Hey Notesy", "Hey Assistant", "Hey App"
-   **Navigation**: "Go to dashboard", "Navigate to profile", "Open archive"
-   **Deactivation**: "Never mind"

### Note Creation & Editing

-   **Create Note**: "Create note", "New note", "Add note"
-   **Set Title**: "Set title [title]"
-   **Add Content**: "Add content [content]"
-   **Save Note**: "Save note", "Save changes"

### Search & Organization

-   **Search**: "Search [query]", "Find [query]"
-   **Clear Search**: "Clear search", "Reset search"
-   **View Types**: "Grid view", "List view"
-   **Labels**: "Add label [label]", "Remove label [label]"

### Collaboration

-   **Add Collaborator**: "Add collaborator", "Share note"
-   **User Search**: "User find [name/email]"
-   **Invite User**: "Add user [name/email]"
-   **Remove User**: "Remove user [name/email]"

### Advanced Features

-   **Reminders**: "Set reminder [date/time]", "Remove reminder"
-   **Colors**: "Change color [color]", "Set background [color]"
-   **Archive**: "Archive note", "Move to archive"
-   **Delete**: "Delete note", "Move to trash"

## 📱 Available Pages

### Public Pages

-   **Landing Page** (`/`) - Product showcase and features
-   **Pricing** (`/pricing`) - Subscription plans
-   **Login** (`/login`) - User authentication
-   **Signup** (`/signup`) - User registration
-   **Email Verification** (`/verify-email`) - Email verification

### Protected Pages

-   **Dashboard** (`/dashboard`) - Main notes interface
-   **Archive** (`/archive`) - Archived notes
-   **Trash** (`/trash`) - Deleted notes
-   **Profile** (`/profile`) - User profile and settings
-   **Statistics** (`/statistics`) - Usage analytics
-   **Reminders** (`/reminders`) - Manage reminders
-   **Labels** (`/labels`) - Note organization
-   **Boards** (`/boards`) - Collaborative boards
-   **Upgrade** (`/upgrade`) - Premium features

## 🛠️ Technology Stack

### Frontend

-   **Framework**: Next.js 15 (App Router)
-   **UI Library**: React 19
-   **Styling**: Tailwind CSS 4 + SCSS
-   **State Management**: Redux Toolkit + RTK Query
-   **Authentication**: Firebase Auth
-   **Voice Recognition**: Web Speech API
-   **Charts**: Chart.js + React Chart.js 2
-   **UI Components**: Radix UI + Lucide React
-   **Forms**: React Hook Form
-   **Animations**: Framer Motion

### Backend

-   **Runtime**: Node.js
-   **Framework**: Express.js 5
-   **Language**: TypeScript
-   **Database**: MongoDB + Mongoose
-   **Authentication**: Firebase Admin + JWT
-   **File Upload**: Multer + Cloudinary
-   **Payments**: Stripe
-   **Email**: Nodemailer
-   **Scheduling**: node-schedule
-   **Validation**: Validator.js

### DevOps & Tools

-   **Package Manager**: npm
-   **Linting**: ESLint
-   **Type Checking**: TypeScript
-   **Version Control**: Git
-   **Deployment**: Vercel (Frontend) + Railway/Render (Backend)

## 🔧 Development

### Available Scripts

**Backend:**

```bash
npm run dev      # Start development server
npm run build    # Build TypeScript
npm run start    # Start production server
npm run watch    # Watch mode for TypeScript
npm run dev:ts   # Dev mode: watch & auto-restart
```

**Frontend:**

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Code Structure

The application follows a modular architecture with clear separation of concerns:

-   **Components**: Reusable UI components with TypeScript interfaces
-   **Hooks**: Custom React hooks for business logic
-   **Redux**: Centralized state management with RTK Query for API calls
-   **Voice System**: Modular voice command system with page-specific commands
-   **API**: RESTful API with proper error handling and validation

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend Deployment (Railway/Render)

1. Connect your GitHub repository
2. Set environment variables
3. Configure build command: `npm run build`
4. Configure start command: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

-   **Documentation**: Check the [VOICE-COMMANDS.md](notesy-frontend/VOICE-COMMANDS.md) for detailed voice command reference
-   **Issues**: Report bugs and feature requests via GitHub Issues
-   **Discussions**: Join community discussions for help and ideas

## 🙏 Acknowledgments

-   **Excalidraw** for the drawing integration
-   **Firebase** for authentication and real-time features
-   **Stripe** for payment processing
-   **Cloudinary** for image storage and optimization
-   **Tailwind CSS** for the beautiful UI framework

---

<div align="center">
  <strong>Notesy — built with ❤️ for everyone</strong>
</div>
