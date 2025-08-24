# Environment Setup Guide

## Quick Setup

1. **Create a `.env.local` file** in your project root with the following content:

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration (RECOMMENDED for best AI processing)
OPENAI_API_KEY=your_openai_api_key_here

# Google OAuth Configuration (REQUIRED for Calendar integration)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Step-by-Step Setup

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the `database-setup.sql` script in your Supabase SQL Editor
3. Copy your project URL and anon key from Settings > API

### 2. OpenAI Setup (Recommended)
1. Go to [platform.openai.com](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env.local` file

### 3. Google Calendar Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000/auth/callback`
6. Copy Client ID and Client Secret to `.env.local`

### 4. Test the Setup
1. Run `npm run dev`
2. Check the browser console for connection status
3. Try creating a task with natural language

## Troubleshooting

- **"Database connection failed"**: Check your Supabase credentials
- **"AI processing failed"**: Verify your OpenAI or AIML API key
- **"Calendar integration failed"**: Ensure Google OAuth is properly configured
- **"User not found"**: Make sure you're signed in and the database has the correct RLS policies

## Example Task Inputs to Test

- "Schedule a team meeting for tomorrow at 2 PM"
- "Buy groceries this weekend"
- "Complete project proposal by Friday"
- "Call client about the new requirements"
