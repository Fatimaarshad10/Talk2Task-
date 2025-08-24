# Talk2Task Setup Guide

## Overview
Talk2Task is an AI-powered productivity application that converts voice and text input into structured tasks, automatically saves them to Supabase, and integrates with Google Calendar for scheduling.

## Features
- 🎤 **Voice Input**: Speak naturally to create tasks
- ✍️ **Text Input**: Type task descriptions manually
- 🤖 **AI Processing**: GPT-powered task analysis and structuring
- 💾 **Database Storage**: Tasks saved to Supabase with full CRUD operations
- 📅 **Calendar Integration**: Automatic Google Calendar event creation
- 🔐 **Authentication**: Secure user management with Supabase Auth
- 📱 **Responsive UI**: Modern, mobile-friendly interface

## Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account and project
- Google Cloud Console account (for Calendar integration)
- OpenAI API key (optional - for AI processing)

## Step 1: Environment Setup

1. Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```

2. Fill in your environment variables:

### Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### OpenAI Configuration (Optional)
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Google OAuth Configuration
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Step 2: Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Run the script to create all necessary tables and policies

The script will create:
- `profiles` table for user information
- `tasks` table for task storage
- `integrations` table for platform connections
- `ai_conversations` table for conversation history
- Row Level Security (RLS) policies
- Automatic triggers for timestamps

## Step 3: Google Calendar Integration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
6. Copy Client ID and Client Secret to your `.env.local`

## Step 4: Install Dependencies

```bash
npm install
# or
pnpm install
```

## Step 5: Run the Application

```bash
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000`

## Step 6: First Time Setup

1. **Sign Up/In**: Use the authentication system to create an account
2. **Connect Google Calendar**: Go to Integrations tab and connect your Google account
3. **Create Your First Task**: Use voice or text input to create a task
4. **Verify Calendar Integration**: Check if the task appears in your Google Calendar

## Usage Guide

### Creating Tasks

#### Voice Input
1. Click the "Voice Input" button
2. Speak your task naturally (e.g., "Schedule a team meeting for tomorrow at 2 PM")
3. The AI will process your request and create a structured task
4. If a date/time is mentioned, it will automatically create a Google Calendar event

#### Text Input
1. Type your task description in the text field
2. Click the send button or press Enter
3. AI will analyze and structure your task
4. Task will be saved to the database

### Task Management
- **View Tasks**: Click "Show Tasks" to see all your tasks
- **Update Status**: Use the dropdown to change task status
- **Delete Tasks**: Click the trash icon to remove tasks
- **Priority Levels**: Tasks are automatically assigned priority based on AI analysis

### Calendar Integration
- Tasks with due dates are automatically added to Google Calendar
- Calendar events include task descriptions and reminders
- Events are synced with your task status updates

## API Endpoints

### AI Processing
- `POST /api/ai/process` - Process text input with AI

### Tasks
- `GET /api/tasks` - Fetch user's tasks
- `POST /api/tasks` - Create new task

### Google Calendar
- `POST /api/integrations/google-calendar` - Create calendar event
- `GET /api/integrations/google-calendar` - List calendars

## Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  source TEXT DEFAULT 'text',
  ai_context TEXT,
  external_id TEXT,
  external_platform TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Integrations Table
```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  platform TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify Supabase URL and keys in `.env.local`
   - Check if RLS policies are properly set up

2. **Google Calendar Integration Fails**
   - Verify OAuth credentials are correct
   - Check if Calendar API is enabled
   - Ensure redirect URIs match your setup

3. **AI Processing Errors**
   - Verify OpenAI API key is valid
   - Check API rate limits and quotas

4. **Database Connection Issues**
   - Verify Supabase project is active
   - Check if database tables exist
   - Verify RLS policies are enabled

### Debug Mode
Enable debug logging by adding to `.env.local`:
```env
DEBUG=true
NEXT_PUBLIC_DEBUG=true
```

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **OAuth 2.0**: Secure authentication with Google
- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Protection**: Supabase client prevents SQL injection

## Performance Optimization

- **Lazy Loading**: Tasks are loaded on demand
- **Optimistic Updates**: UI updates immediately for better UX
- **Error Boundaries**: Graceful error handling
- **Caching**: Supabase client handles caching automatically

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- Ensure environment variables are set
- Update redirect URIs for production domain
- Configure proper CORS settings

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Supabase and Google Cloud Console logs
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
