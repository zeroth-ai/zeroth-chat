# AI Image Chat

This is a full-stack chat application that uses AI to analyze and describe images. Users can upload an image or send text prompts, and the application returns a detailed description along with relevant meta tags.

### Features

- **Image Analysis:** Upload images to receive AI-generated descriptions and keyword tags.
- **Persistent Chat:** Conversation history, including images, is stored in a PostgreSQL database and persists across browser sessions using a unique session ID.
- **Full Stack Architecture:** Built with a Next.js backend that handles database operations and communication with the AI service.

### Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **AI Service:** Pollinations AI (Proxy for OpenAI/Vision models)

### Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install

3. Set up your environment variables in `.env` (requires a `DATABASE_URL` from Supabase).

4. Sync the database schema:
`npx prisma db push`.
5 Run the development server: `npm run dev`.