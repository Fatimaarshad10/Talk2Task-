# Notion Integration Setup Guide

This guide will help you set up the Notion integration for your Talk2Task application.

## Prerequisites

1. A Notion account
2. Your Talk2Task application running locally or deployed

## Step 1: Create a Notion Integration

1. Go to [Notion Developers](https://developers.notion.com/)
2. Click "New integration"
3. Fill in the details:
   - **Name**: Talk2Task Integration
   - **Associated workspace**: Select your workspace
   - **Type**: Internal integration
4. Click "Submit"

## Step 2: Configure OAuth Settings

1. In your integration settings, go to the "OAuth" tab
2. Add redirect URI:
   - For development: `http://localhost:3000/api/notion/auth`
   - For production: `https://yourdomain.com/api/notion/auth`
3. Copy the following credentials:
   - **Client ID**
   - **Client Secret**

## Step 3: Create a Notion Database

1. In Notion, create a new database with the following properties:
   - **Name** (Title property - required)
   - **Status** (Select property) with options:
     - Not started
     - In progress
     - Done
     - Cancelled
   - **Priority** (Select property) with options:
     - Low
     - Medium
     - High
     - Urgent
   - **Due Date** (Date property)

2. Share the database with your integration:
   - Click the "Share" button in the top right
   - Invite your integration by name
   - Give it "Can edit" permissions

3. Get the database ID:
   - Copy the database URL
   - The database ID is the long string between the workspace name and the "?" in the URL
   - Example: `https://www.notion.so/workspace/1234567890abcdef?v=1234567890abcdef` → `1234567890abcdef`

## Step 4: Configure Environment Variables

Update your `.env.local` file with the credentials:

```env
# Notion Integration Configuration
NOTION_CLIENT_ID=your_actual_client_id_here
NOTION_CLIENT_SECRET=your_actual_client_secret_here
NOTION_DATABASE_ID=your_actual_database_id_here
NEXT_PUBLIC_NOTION_DATABASE_ID=your_actual_database_id_here
```

## Step 5: Test the Integration

1. Start your application: `npm run dev`
2. Go to Settings/Integrations
3. Click "Connect" next to Notion
4. Authorize the integration in Notion
5. Try creating a task with Notion keywords:
   - "Add this task to my Notion workspace"
   - "Create a page for this in Notion"
   - "Save this to Notion"

## How It Works

### Task Creation
When a user creates a task mentioning Notion keywords, the system:
1. AI detects "notion" in the input
2. Adds "notion" to the integrations array
3. Creates a task in your local database
4. Creates a page in your Notion database with:
   - Task title as the page name
   - Task description as page content
   - Priority and status as database properties
   - Due date if specified

### Status Synchronization
- Task status changes in your app sync to Notion
- Status mapping: pending → "Not started", in_progress → "In progress", completed → "Done", cancelled → "Cancelled"

### Task Deletion
- Deleting a task in your app archives the corresponding Notion page

## Troubleshooting

### Common Issues

1. **"Notion database not configured"**
   - Check that `NEXT_PUBLIC_NOTION_DATABASE_ID` is set in `.env.local`
   - Ensure the database ID is correct (no extra characters)

2. **"Not authenticated with Notion"**
   - Make sure you've connected your Notion account in Settings
   - Check that the integration is properly authorized

3. **"Failed to create Notion page"**
   - Verify the database properties match exactly (case-sensitive)
   - Ensure the integration has edit permissions on the database
   - Check that the database still exists and hasn't been moved

4. **OAuth redirect issues**
   - Ensure the redirect URI in Notion matches your app's URL
   - For production, update the redirect URI to your production domain

### Debug Tips

1. Check browser console for errors
2. Verify environment variables are loaded correctly
3. Test the Notion API directly using their documentation
4. Ensure your database properties exactly match the expected names

## Security Notes

- Access tokens are stored securely in HTTP-only cookies
- The integration only accesses the specific database you shared
- No data is stored permanently on external servers
- Tokens expire and need to be refreshed periodically

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your Notion database properties match the expected schema
4. Test with a simple task first to isolate issues