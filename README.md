# QuizMeter 🚀

QuizMeter is a modern, real-time quiz platform designed for interactive learning and engagement. Featuring a stunning NASA-inspired space aesthetic, it offers a seamless experience for both hosts and participants.

## ✨ Features

- **Real-time Quizzes**: Interactive live quiz sessions with instant feedback.

- **Host Dashboard**: Comprehensive tools for managing quizzes, tracking player progress, and viewing leaderboards.
- **Participant Experience**: Smooth, responsive interface for joining sessions and answering questions.
- **Dynamic Leaderboards**: Live score updates and competitive play.
- **Secure Authentication**: Robust user authentication with JWT and secure cookie management.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Bun](https://bun.sh/) / [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Caching**: [Redis](https://redis.io/)
- **Validation**: [Zod](https://zod.dev/)

### Infrastructure
- **Containerization**: [Docker](https://www.docker.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/) and Docker Compose

### Environment Setup
1. Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgres://quiz:quiz@localhost:5432/quizdb
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET=your_jwt_secret
   ```

### Installation
1. Install dependencies:
   ```bash
   bun install
   ```
2. Start infrastructure (Database & Redis):
   ```bash
   docker-compose up -d
   ```
3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

### Running the Application

#### Backend (API)
```bash
bun run dev
```

#### Frontend (Web)
```bash
cd src/web
bun run dev
```

## 🧠 Architectural Decisions

The architecture of QuizMeter was chosen with performance, scalability, and developer experience in mind:

- **Bun**: We use Bun for its high performance and "all-in-one" nature. It serves as both a runtime and package manager, significantly reducing development-to-test cycle times compared to traditional Node.js/npm setups.
- **Socket.io + Redis**: Real-time synchronization is the core of QuizMeter. Socket.io provides the WebSocket abstraction, while Redis acts as the backbone for scaling and persisting session state across distributed server instances.
- **Prisma ORM**: Type-safety is a priority. Prisma ensures that our data models are strictly typed from the database schema all the way to the frontend, preventing entire classes of runtime errors.
- **Vite + React (Frontend)**: Vite provides an extremely fast development server and optimized build process. React's component-based architecture, paired with Shadcn UI, allows for a rapid development of a premium "NASA-inspired" aesthetic.

## 📂 Project Structure

- `src/api`: Backend logic, modules, sockets, and Prisma integration.
- `src/web`: Frontend React components, pages, and UI elements.
- `prisma`: Database schema and migrations.
- `docker-compose.yml`: Infrastructure configuration.

---
Built with ❤️ by the QuizMeter Team.

