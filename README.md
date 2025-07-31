# Lantrn Web Convert

A web application for publication profile management and automated public notice conversion to InDesign format using Claude AI.

## Features

- **User Authentication**: Secure registration and login system
- **Publication Profiles**: Create and manage publication information
- **File Upload System**: Upload InDesign spec sheets and pricing sheets
- **Public Notice Upload**: Upload notices in various formats (PDF, DOCX, TXT, RTF)
- **AI-Powered Conversion**: Automatically convert notices to InDesign format using Claude AI
- **Calendar Scheduling**: Visual calendar interface for scheduling publication dates
- **Weekly Sheet Generation**: Automatically generate weekly compilation sheets as PDFs
- **Dashboard Management**: Comprehensive dashboard for managing all aspects

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development) / PostgreSQL (production)
- **AI Integration**: Anthropic Claude API
- **File Management**: File uploads with drag-and-drop
- **PDF Generation**: jsPDF for weekly sheets
- **Calendar**: React Calendar component

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
│   ├── auth.ts           # Authentication utilities
│   ├── claude.ts         # Claude AI integration
│   ├── prisma.ts         # Database client
│   ├── upload.ts         # File upload handling
│   └── weekly-sheet.ts   # PDF generation
├── types/                # TypeScript type definitions
└── utils/                # Helper utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lantrn-web-convert
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your environment variables:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="your-anthropic-api-key-here"
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=10485760
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Initial Setup

1. **Register**: Create a new account
2. **Create Publication Profile**: Add your publication information
3. **Upload Files**: Upload your InDesign specification sheet and pricing sheet
4. **Upload Notices**: Start uploading public notices for conversion

### Workflow

1. **Upload Notice**: Upload a public notice file and set publication date
2. **AI Conversion**: Claude AI automatically converts the notice to InDesign format
3. **Schedule Management**: Use the calendar to view and manage scheduled notices
4. **Weekly Sheets**: Generate PDF compilation sheets for each week
5. **Download Files**: Access converted InDesign files and weekly sheets

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/user/profile` - Get user profile and publication
- `POST /api/publication` - Create publication profile
- `PUT /api/publication` - Update publication profile
- `POST /api/upload` - File upload
- `POST /api/notices` - Create public notice
- `GET /api/notices` - Get user's notices
- `POST /api/convert` - Convert notice using Claude AI
- `POST /api/weekly-sheets` - Generate weekly sheet
- `GET /api/weekly-sheets` - Get weekly sheets

## Database Schema

The application uses Prisma with the following main models:

- **User**: User accounts and authentication
- **Publication**: Publication profiles and settings
- **PublicNotice**: Individual public notices with conversion status
- **WeeklySheet**: Generated weekly compilation sheets
- **WeeklySheetNotice**: Junction table for notices in weekly sheets

## File Structure

- `/public/uploads/spec/` - InDesign specification sheets
- `/public/uploads/pricing/` - Pricing sheets  
- `/public/uploads/notice/` - Original notice files
- `/public/uploads/converted/` - AI-converted InDesign files
- `/public/uploads/weekly-sheets/` - Generated weekly PDF sheets

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..."  # Use PostgreSQL for production
NEXTAUTH_SECRET="secure-random-string"
NEXTAUTH_URL="https://your-domain.com"
ANTHROPIC_API_KEY="your-api-key"
```

## Development

### Running Tests

```bash
npm run test
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Database Management

```bash
npx prisma studio          # Open database browser
npx prisma db push         # Push schema changes
npx prisma migrate dev     # Create and apply migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open a GitHub issue or contact the development team.