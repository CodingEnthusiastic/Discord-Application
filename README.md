# Discord Clone Application

## Setup Instructions

### Architecture 
https://drive.google.com/drive/folders/11T6sKqv8jCLWKQmg0vznQg_QEMaBjgnV?usp=sharing

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend folder with required environment variables:
   ```
   MONGODB_URI=your_mongodb_uri
   PORT=5000
   CLERK_SECRET_KEY=your_clerk_secret_key
   GEMINI_API_KEY=key
   ```

4. Start the server:
   ```bash
   npx nodemon index.js
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend folder with:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will typically run on `http://localhost:5173` and the backend on `http://localhost:5000`.
