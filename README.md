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

3. Set up your environment variables in `.env` (requires a `DATABASE_URL` from Supabase and the hugging face api token, you can also replace it with some other api token of your prefered model). You can also check the `.env.example`  file for reference

4. Sync the database schema:
`npx prisma db push`.

5. Run the development server: `npm run dev`.

### Testing via CLI (Curl)

You can verify the API is working without using the frontend by running these commands in your terminal.

1. Test Image Analysis

Create a file named `test-payload.json` containing a test session ID and a tiny Base64 image (a red dot):

```json
{
  "sessionId": "curl-test-session-1",
  "message": "What color is this?",
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
}
```


Run the curl command to send this file to your local API:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d @test-payload.json

```

Expected Output: The AI should reply identifying the image as a "red dot" or "red square".


2. Verify Chat History (GET)

Check if the database successfully saved your conversation by retrieving the history for that session:

```bash
curl "http://localhost:3000/api/chat?sessionId=curl-test-session-1"
```

Expected Output: A JSON array [...] containing the user message and the AI's response from the previous test.