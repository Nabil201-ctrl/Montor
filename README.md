# Montor: Developer Momentum Engine

Montor is a comprehensive platform designed to track, analyze, and gamify the software development process. It specifically focuses on the transition from rapid, experimental coding (Vibe Coding) to structured, professional software development (System Platforms).

## Core Philosophy

The platform acts as a high-level monitor for GitHub repositories, providing AI-driven insights that capture the "why" behind code changes, rather than just the "what". It rewards high-quality progress and consistency through a weighted Velocity scoring system.

## Project Structure

The project is split into two main components:
1. **Ui/Montor**: React-based frontend using Vite and Tailwind CSS v4.
2. **Server**: Node.js and Express backend providing a RESTful API and GitHub integration.

## Key Features

### 1. Vibe-to-System Tracking
Projects are categorized into three phases:
- **Vibe Coding**: The initial stage of rapid experimentation and prompt-driven development.
- **Transition**: The middle ground where structure begins to emerge.
- **System Platform**: The professional phase with documentation, tests, and scalability.

### 2. AI-Generated Milestones
The system analyzes commit messages and code diffs to generate milestone summaries. These milestones include:
- Sentiment analysis (Excited, Neutral, Frustrated).
- Suggested next steps.
- Automated tagging.
- "Vibe Shift" metrics indicating progress toward system stability.

### 3. Velocity Scoring System
Velocity is a weighted metric that rewards significant progress over raw commit counts:
- Milestone Completion: 25 points.
- Phase Shift (Vibe to System): 50 points.
- Flow State (5+ commits in a session): 15 points.
- AI-Verified Progress: 35 points.
- Momentum Consistency: Based on daily activity streaks.

### 4. DevLog Timeline
A standalone, cross-project chronological view of all development sessions.
- Displays mood indicators (Flow, Productive, Exploring, Struggling).
- Tracks duration and commit counts per session.
- Includes a weekly activity bar chart.
- Filterable by specific projects.

### 5. Gamification and Social
- **Global Leaderboard**: Ranks builders by their Velocity Score.
- **Build Circles**: Private groups with dedicated leaderboards and invite codes for friends or coworkers.
- **Proof of Work (Badges)**: 10 distinct badge types awarded for specific achievements (e.g., first milestone, weekly streaks, verified ships).
- **Momentum Feed**: A social feed where users can publish milestones, boost others' progress, and leave comments.

### 6. Build-Off Sprints
Time-bound competitions (default 48 hours) where participants race to hit milestones and earn points within a specific window.

## Technical Architecture

### Frontend (Ui/Montor)
- **Framework**: React 18 with Vite.
- **Styling**: Tailwind CSS v4 with custom dark-mode theme.
- **State Management**: React Context API (AuthContext).
- **Visualizations**: Chart.js and react-chartjs-2 for momentum lines, phase donuts, velocity bars, and health radars.
- **Routing**: React Router DOM with protected route logic.

### Backend (Server)
- **Framework**: Node.js with Express.
- **Authentication**: GitHub OAuth 2.0 with JWT (JSON Web Tokens) for session persistence.
- **CORS**: Configured for secure communication with the frontend origin.
- **Database**: In-memory mock database (db.js) designed for easy migration to PostgreSQL or Supabase.
- **External APIs**: Integration with GitHub API for repository syncing and commit fetching.

## API Reference

### Authentication
- GET /api/auth/github: Initiates OAuth flow.
- GET /api/auth/github/callback: Handles GitHub redirect and issues JWT.
- GET /api/auth/me: Returns current authenticated user profile.
- GET /api/auth/dev-login: Developer bypass that seeds a mock user with realistic demo data.

### Projects and Stats
- GET /api/projects: Lists user's synced repositories.
- POST /api/projects/:id/milestones: Manually triggers AI milestone generation.
- GET /api/stats: Returns dashboard summaries including project counts, health scores, and recent activity.

### Social and Competition
- GET /api/leaderboard: Global velocity rankings.
- GET /api/circles: User's build circles.
- GET /api/feed: Public social momentum feed.
- GET /api/sprints: Active and past build competitions.
- GET /api/badges: Available badge types and user achievements.

## Development Setup

### Server
1. Navigate to the Server directory.
2. Install dependencies: npm install.
3. Configure .env file with GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and FRONTEND_URL.
4. Run in development mode: npm run dev.

### UI
1. Navigate to the Ui/Montor directory.
2. Install dependencies: npm install.
3. Run the development server: npm run dev.

## External Access and Public Testing

To allow external users to test your local instance of Montor, you must expose your local ports via a tunnel (e.g., Ngrok) and update your GitHub OAuth App settings.

### 1. Tunnel your ports
Expose both your frontend (5173) and backend (3001):
```bash
ngrok http 5173
ngrok http 3001
```

### 2. Update GitHub OAuth App
Update your application settings in GitHub with the Ngrok URLs:
- **Homepage URL**: `https://<your-frontend-ngrok-id>.ngrok-free.app`
- **Authorization callback URL**: `https://<your-backend-ngrok-id>.ngrok-free.app/api/auth/github/callback`

### 3. Update Server .env
```env
GITHUB_REDIRECT_URI=https://<your-backend-ngrok-id>.ngrok-free.app/api/auth/github/callback
FRONTEND_URL=https://<your-frontend-ngrok-id>.ngrok-free.app
```

### 4. Update UI Environment
Create a `.env` file in `Ui/Montor/`:
```env
VITE_API_URL=https://<your-backend-ngrok-id>.ngrok-free.app/api
```
