# Talk2Task - AI-Powered Task Management

Transform your voice and text into actionable tasks with AI-powered intelligence. Simply speak or type, and let AI handle the rest.

## ✨ Features

- **🎤 Voice Input**: Speak naturally and let AI convert your words into structured tasks
- **🤖 AI Processing**: Intelligent task extraction with priority, due dates, and context
- **📅 Google Calendar Integration**: Automatic calendar event creation for tasks with due dates
- **📱 Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- **🔐 Authentication**: Secure user management with Supabase Auth
- **📊 Task Management**: Create, update, and organize tasks with ease

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account
- OpenAI API key (recommended) or AIML API key
- Google Cloud Console project (for Calendar integration)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd talk2task
npm install
# or
pnpm install
```

### 2. Environment Setup
Create a `.env.local` file in your project root:

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

### 3. Database Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the `database-setup.sql` script in your Supabase SQL Editor
3. This creates all necessary tables, policies, and functions

### 4. Google Calendar Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
6. Copy Client ID and Client Secret to `.env.local`

### 5. Run the Application
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 How It Works

### Task Creation Flow
1. **Input**: User speaks or types a natural language task
2. **AI Processing**: AI analyzes the input and extracts:
   - Task title and description
   - Priority level (low, medium, high, urgent)
   - Due date (if mentioned)
   - Suggested integrations
3. **Database Storage**: Task is saved to Supabase with AI context
4. **Calendar Integration**: If due date exists, automatically creates Google Calendar event
5. **User Feedback**: Shows AI-generated confirmation message

### Example Inputs
- "Schedule a team meeting for tomorrow at 2 PM"
- "Buy groceries this weekend"
- "Complete project proposal by Friday"
- "Call client about the new requirements"

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **AI**: OpenAI GPT-3.5-turbo (recommended) or AIML API
- **Authentication**: Supabase Auth
- **Calendar**: Google Calendar API with OAuth 2.0

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/process/          # AI task processing
│   │   ├── integrations/        # Google Calendar integration
│   │   └── tasks/              # Task CRUD operations
│   ├── auth/                   # Authentication pages
│   ├── components/             # React components
│   │   ├── Talk2TaskInterface  # Main task interface
│   │   ├── GoogleCalendarConnect # Calendar connection
│   │   └── ui/                 # Reusable UI components
│   ├── contexts/               # React contexts
│   └── lib/                    # Utility functions
├── types/                      # TypeScript type definitions
└── styles/                     # Global styles
```

## 🔌 API Endpoints

### AI Processing
- `POST /api/ai/process` - Process natural language into structured tasks

### Google Calendar
- `POST /api/integrations/google-calendar` - Create calendar events
- `PUT /api/integrations/google-calendar` - Generate OAuth URL
- `GET /api/integrations/google-calendar` - List calendars

### Tasks
- `GET /api/tasks` - Fetch user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🛠️ Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Code Quality
```bash
npm run lint
```

## 🐛 Troubleshooting

### Common Issues

1. **"Database connection failed"**
   - Verify Supabase credentials in `.env.local`
   - Check if database tables are created
   - Ensure RLS policies are active

2. **"AI processing failed"**
   - Verify OpenAI or AIML API key
   - Check API rate limits
   - Review browser console for errors

3. **"Calendar integration failed"**
   - Ensure Google OAuth is configured
   - Check redirect URIs match exactly
   - Verify Google Calendar API is enabled

4. **"User not found"**
   - Check authentication flow
   - Verify database has correct user records
   - Ensure RLS policies allow user access

### Debug Mode
The application includes debug information in development mode:
- Environment variable status
- Database connection tests
- API response logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Check the Supabase dashboard for database issues
4. Create an issue in the repository

## 🚀 Roadmap

- [ ] Notion integration
- [ ] Trello integration  
- [ ] Slack notifications
- [ ] Email reminders
- [ ] Mobile app
- [ ] Team collaboration features
- [ ] Advanced AI task prioritization
- [ ] Time tracking integration
