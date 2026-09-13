# 🧠 BrainChain - Facility Intelligence Dashboard

An AI-powered decision dashboard for government-run and institution-run facilities across India. It helps analyze sustainability, safety, and operations challenges such as air quality, waste management, water usage, energy consumption, traffic flow, asset utilization, and climate resilience.

## 🏗️ Tech Stack
*   **Frontend:** React (Vite), TailwindCSS, React-Grid-Layout, Recharts, React-Leaflet
*   **Backend:** Node.js (Express), SQLite (better-sqlite3)
*   **ML Pipeline:** Python, Scikit-learn (IsolationForest, LinearRegression), Pandas
*   **GenAI Engine:** (Upcoming) Google Gemini 1.5 Flash

---

## 🚀 Getting Started

### 1. Prerequisites
*   **Node.js** (v18+)
*   **Python** (v3.9+)

### 2. Backend Setup
```bash
cd brainchain-backend
npm install

# Install ML dependencies
cd ml
pip install -r requirements.txt
cd ..

# Create a .env file based on .env.example (or manually)
# GEMINI_API_KEY=your_api_key

# Start the backend server (Runs on port 3001 and triggers the ML cron job)
npm start
```

### 3. Frontend Setup
```bash
cd brainchain-ui
npm install

# Create a .env file and add your Map API key
# VITE_API_BASE_URL=http://localhost:3001
# VITE_MAP_TOKEN=cb1_3jky_1_fcb3401b35c59215295652a3

# Start the Vite development server
npm run dev
```
Navigate to `http://localhost:5173` to view the dashboard!

---

## 🤝 Collaboration & Git Workflow (CRITICAL)

To prevent merge conflicts and ensure code quality during the hackathon, **DO NOT PUSH DIRECTLY TO `master` (or `main`)**. Please follow this Pull Request (PR) workflow:

### 1. Update your local master
Always start from the latest code before building something new.
```bash
git checkout master
git pull origin master
```

### 2. Create a Feature Branch
Create a new branch for your specific task (e.g., frontend-layout, ml-model, api-integration).
```bash
git checkout -b feature/your-feature-name
```

### 3. Commit Your Changes
Make your changes, then add and commit them with descriptive messages.
```bash
git add .
git commit -m "feat: added new charts to energy module"
```

### 4. Push and Open a PR
Push your branch to GitHub and open a Pull Request to merge it into `master`.
```bash
git push origin feature/your-feature-name
```
*Go to GitHub to review your code and click **Compare & pull request**. Ask another teammate to quickly review before merging!*

---

## 📂 Project Structure
*   `/brainchain-ui/` - The React frontend (Routing, Zustand stores, UI components)
*   `/brainchain-backend/` - Node.js Express API and SQLite database
*   `/brainchain-backend/ml/` - Scikit-learn Python scripts for Anomaly Detection & Forecasting
