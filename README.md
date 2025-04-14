# Church Management System

A comprehensive church management system built with Next.js, Tailwind CSS, and Supabase. This application helps churches manage members, cell groups, districts, classes, pastoral services, attendance tracking, and administrative document generation.

## Features

- **Authentication**: Secure login and registration system
- **Member Management**: Comprehensive member database with detailed profiles
- **Cell Groups**: Manage cell groups with leaders and members
- **Districts**: Organize cell groups into districts with district leaders
- **Classes**: Track Bible studies, pre-marital counseling, and other classes
- **Pastoral Services**: Request and track pastoral visits, counseling, baptisms, weddings, etc.
- **Attendance Tracking**: Record and analyze attendance for various church events
- **Administrative Documents**: Generate certificates and official church documents

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication, storage)
- **PDF Generation**: jsPDF

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/church-management.git
   cd church-management
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Supabase URL and anon key:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup

1. Create a new project in [Supabase](https://supabase.com/)
2. Set up the following tables:
   - members
   - cell_groups
   - districts
   - classes
   - pastoral_services
   - attendance
   - documents

Detailed schema information can be found in the `database` directory.

## Deployment

The application can be deployed to Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Set the environment variables
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [React Hook Form](https://react-hook-form.com/)
- [jsPDF](https://github.com/MrRio/jsPDF)
