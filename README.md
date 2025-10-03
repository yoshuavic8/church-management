# Church Management System

A comprehensive church manageme### Database Setup

1. Set up MySQL database
2. Clone the API repository:
   ```bash
   git clone <api-repo-url> church-management-api
   cd church-management-api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure the database:
   ```bash
   # Copy the environment file
   cp .env.example .env
   
   # Add your database URL
   DATABASE_URL="mysql://username:password@localhost:3306/church_management"
   ```
5. Run database migrations:
   ```bash
   npm run migrate
   ```
6. Start the API server:
   ```bash
   npm run dev
   ```lt with Next.js, Tailwind CSS, and a Node.js API with MySQL. This application helps churches manage members, cell groups, districts, classes, pastoral services, attendance tracking, and administrative document generation.

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
- **Backend**: Node.js API with Express and Prisma (MySQL database)
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
   - Add your API configuration:
   ```
     NEXT_PUBLIC_API_URL=http://localhost:3001/api
     API_URL=http://localhost:3001
     ADMIN_REGISTER_SECRET_KEY=your-admin-secret-key
   ```4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup

1. Set up MySQL database
2. Clone the API repository:
   ```bash
   git clone <api-repo-url> church-management-api
   cd church-management-api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure the database:
   ```bash
   # Copy the environment file
   cp .env.example .env
   
   # Add your database URL
   DATABASE_URL="mysql://username:password@localhost:3306/church_management"
   ```
5. Run database migrations:
   ```bash
   npm run migrate
   ```
6. Start the API server:
   ```bash
   npm run dev
   ```

The following tables are automatically created:
   - members
   - cell_groups
   - districts
   - classes
   - ministries
   - attendance
   - donations

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
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Prisma](https://prisma.io/)
- [MySQL](https://mysql.com/)
- [React Hook Form](https://react-hook-form.com/)
- [jsPDF](https://github.com/MrRio/jsPDF)
