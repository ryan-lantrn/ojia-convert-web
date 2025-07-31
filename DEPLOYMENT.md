# Node.js Deployment Guide

This application has been successfully converted from Next.js to Node.js Express for easy deployment on Replit and other platforms.

## What Changed

- **Framework**: Next.js → Express.js
- **Frontend**: React components → EJS templates  
- **API Routes**: Next.js App Router → Express routes
- **Authentication**: Next-Auth → Custom JWT implementation
- **Database**: SQLite with Prisma (unchanged)

## File Structure

```
├── server.js                 # Main Express server
├── routes/                   # Express route handlers
│   ├── auth.js              # Authentication routes
│   ├── pages.js             # Page rendering routes
│   ├── upload.js            # File upload handling
│   ├── publication.js       # Publication management
│   ├── notices.js           # Notice management
│   ├── convert.js           # AI conversion
│   ├── weekly-sheets.js     # Weekly sheet generation
│   └── user.js              # User profile
├── middleware/              
│   └── auth.js              # Authentication middleware
├── views/                   # EJS templates
│   ├── layout.ejs
│   ├── index.ejs
│   ├── auth/
│   └── dashboard/
├── src/lib/                 # Converted to CommonJS
│   ├── auth.js
│   ├── prisma.js
│   ├── upload.js
│   ├── claude.js
│   └── weekly-sheet.js
└── public/                  # Static assets
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
ANTHROPIC_API_KEY="your-anthropic-api-key"
NODE_ENV="production"
PORT="3000"
```

## Deployment Steps

### For Replit:

1. **Import the project** to Replit
2. **Set environment variables** in Replit's Secrets tab:
   - `DATABASE_URL`: `file:./prisma/dev.db`
   - `NEXTAUTH_SECRET`: Generate a secure random string
   - `ANTHROPIC_API_KEY`: Your Claude API key
   - `NODE_ENV`: `production`
   - `PORT`: `3000`

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up database**:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start the application**:
   ```bash
   npm start
   ```

### For other platforms:

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set environment variables** (see above)
4. **Initialize database**: 
   ```bash
   npm run db:generate
   npm run db:push
   ```
5. **Start the server**: `npm start`

## Key Features

- ✅ User registration and authentication
- ✅ Publication profile management
- ✅ File upload (notices, specs, pricing sheets)
- ✅ AI-powered notice conversion using Claude
- ✅ Calendar scheduling
- ✅ Weekly sheet generation
- ✅ File management dashboard

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET|POST|PUT /api/publication` - Publication management
- `POST /api/upload` - File upload
- `GET|POST /api/notices` - Notice management
- `POST /api/convert` - AI conversion
- `GET|POST /api/weekly-sheets` - Weekly sheet generation
- `GET /api/user/profile` - User profile

## Web Pages

- `/` - Landing page
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/dashboard` - Main dashboard
- `/dashboard/publication` - Publication profile
- `/dashboard/upload` - File upload
- `/dashboard/notices` - Notice management
- `/dashboard/calendar` - Calendar view
- `/dashboard/weekly-sheets` - Weekly sheets
- `/dashboard/files` - File manager

## Development

For development with auto-reload:
```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

## Notes

- The application uses SQLite for easy deployment
- File uploads are stored in `public/uploads/`
- EJS templates use Tailwind CSS via CDN for styling
- Authentication uses HTTP-only cookies with JWT tokens