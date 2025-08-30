# Finance AI Tracker

A modern, AI-powered personal finance tracking application that simplifies expense management through intelligent transaction parsing and comprehensive analytics.

## Overview

Finance AI Tracker is a full-stack web application designed to help users effortlessly track their income and expenses. Leveraging artificial intelligence, the app can parse transaction details from text inputs (such as receipts or descriptions), automatically categorizing and organizing financial data. Users can visualize their spending patterns through interactive charts and gain valuable insights into their financial habits.

## Features

### Core Functionality
- **AI-Powered Transaction Parsing**: Input transaction details in natural language, and the app uses OpenAI's GPT-4o-mini to automatically extract amount, category, description, and transaction type with confidence scores.
- **Manual Transaction Entry**: Traditional form-based input for precise control over transaction details.
- **Comprehensive CRUD Operations**: Create, read, update, and delete transactions with full user ownership validation.
- **Advanced Analytics**: Real-time financial summaries, category breakdowns, and spending trend analysis.
- **Interactive Visualizations**: Beautiful charts and graphs powered by Recharts for spending insights and trends.

### User Experience
- **Secure Authentication**: Google OAuth integration for seamless and secure user login.
- **Responsive Design**: Modern, mobile-friendly interface built with React and Tailwind CSS.
- **Real-time Updates**: Instant synchronization of data across the application.
- **Error Handling**: Robust error handling with user-friendly messages and retry mechanisms.

### Technical Features
- **Scalable Architecture**: Modular backend with clear separation of concerns.
- **Database Integration**: Supabase for reliable, real-time database operations.
- **API Rate Limiting**: Built-in retry logic for OpenAI API calls with exponential backoff.
- **Type Safety**: Full TypeScript implementation for enhanced code reliability.

## Tech Stack

### Frontend
- **React 19** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality, accessible UI components
- **Recharts** - Composable charting library
- **React Router** - Client-side routing
- **React Hook Form** - Performant forms with easy validation
- **Zustand** - Lightweight state management
- **TanStack Query** - Powerful data synchronization for React

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Fast, unopinionated web framework
- **Supabase** - Open-source Firebase alternative for database and auth
- **OpenAI API** - GPT-4o-mini for AI transaction parsing
- **Google Auth Library** - OAuth 2.0 authentication
- **JWT** - JSON Web Tokens for session management
- **bcryptjs** - Password hashing (if needed)
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Auto-restart for backend development
- **Vite Plugin React SWC** - Fast React compilation

## How It Works

### Architecture Overview
The application follows a client-server architecture with clear separation between frontend and backend:

1. **Frontend (React)**: Handles user interactions, displays data, and communicates with the backend API.
2. **Backend (Express)**: Processes requests, interacts with the database, and integrates with external services.
3. **Database (Supabase)**: Stores user data, transactions, and handles real-time subscriptions.
4. **AI Service (OpenAI)**: Parses natural language transaction inputs into structured data.

### Transaction Flow
1. **Input**: User enters transaction details either manually or via text description.
2. **AI Parsing** (if text input): OpenAI processes the text to extract transaction components.
3. **Validation**: Backend validates the transaction data and user permissions.
4. **Storage**: Valid transactions are stored in Supabase with user association.
5. **Analytics**: Real-time calculation of summaries, categories, and trends.
6. **Visualization**: Frontend renders updated charts and insights.

### Authentication Flow
1. User initiates Google OAuth login.
2. Backend verifies the OAuth token and creates/updates user record.
3. JWT token is issued for subsequent API requests.
4. All protected routes validate the JWT token.

## Challenges & Problems Solved

### Problem 1: Tedious Manual Transaction Entry
**Challenge**: Traditional finance apps require users to manually input each transaction detail, which is time-consuming and error-prone.
**Solution**: Implemented AI-powered parsing that allows users to paste receipt text or describe transactions in natural language. The system automatically extracts amount, category, and other details with high accuracy.

### Problem 2: Lack of Financial Insights
**Challenge**: Many users struggle to understand their spending patterns and make informed financial decisions.
**Solution**: Built comprehensive analytics including spending summaries, category breakdowns, and trend analysis with interactive visualizations.

### Problem 3: Data Security and Privacy
**Challenge**: Financial data is sensitive and requires robust security measures.
**Solution**: Implemented secure authentication with Google OAuth, encrypted data storage in Supabase, and proper user data isolation.

### Problem 4: API Reliability
**Challenge**: External API calls (OpenAI) can fail due to rate limits or network issues.
**Solution**: Added retry logic with exponential backoff, error handling, and fallback mechanisms.

### Problem 5: Scalability and Performance
**Challenge**: As user base grows, the application needs to handle increased load efficiently.
**Solution**: Used Supabase for scalable database operations, optimized queries, and efficient state management in the frontend.

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- Supabase account
- OpenAI API key
- Google OAuth credentials

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the frontend directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   pnpm run dev
   ```

### Database Setup
1. Create a new Supabase project
2. Run the following SQL to create the transactions table:
   ```sql
   CREATE TABLE transactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL,
     amount DECIMAL(10,2) NOT NULL,
     description TEXT NOT NULL,
     category TEXT NOT NULL,
     type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
     date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

   -- Create policy for users to access only their own transactions
   CREATE POLICY "Users can access their own transactions" ON transactions
     FOR ALL USING (auth.uid() = user_id);
   ```

## Usage

### Getting Started
1. Open the application in your browser (typically http://localhost:5173)
2. Click "Sign in with Google" to authenticate
3. Start adding transactions using either method:
   - **AI Parsing**: Paste receipt text or describe the transaction
   - **Manual Entry**: Fill out the transaction form

### Adding Transactions
- Use the transaction input form on the dashboard
- For AI parsing, enter natural language descriptions like:
  - "Spent $25 on lunch at McDonald's"
  - "Received salary of $3000"
  - "Grocery shopping: milk $3.50, bread $2.00, total $5.50"

### Viewing Analytics
- **Dashboard**: Overview of total income, expenses, and savings
- **Spending Chart**: Visual breakdown of expenses by category
- **Transaction Insights**: Detailed analysis of spending patterns
- **Trend Chart**: Income and expense trends over time

### Managing Transactions
- View all transactions in the transaction list
- Edit or delete transactions as needed
- Filter transactions by category or date range

## API Endpoints

### Authentication
- `POST /auth/google` - Google OAuth login
- `GET /auth/me` - Get current user info

### Transactions
- `POST /api/transactions/parse` - Parse transaction from text using AI
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions` - Get user's transactions (with optional filters)
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Analytics
- `GET /api/analytics/summary` - Get financial summary
- `GET /api/analytics/categories` - Get spending by category
- `GET /api/analytics/trends` - Get spending trends over time

## Contributing

We welcome contributions to Finance AI Tracker! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

### Development Guidelines
- Follow the existing code style and TypeScript conventions
- Write clear, concise commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
- Check the existing issues on GitHub
- Create a new issue with detailed information
- Contact the maintainers

## Future Enhancements

- Mobile app development
- Advanced budgeting features
- Receipt scanning with OCR
- Multi-currency support
- Export functionality for tax purposes
- Integration with banking APIs
- Advanced AI insights and recommendations
