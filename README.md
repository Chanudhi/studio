
# FridgeChef 🍳🤖

FridgeChef is a Next.js web application that uses AI to suggest recipes based on the ingredients you have on hand. It also allows you to specify dietary restrictions and cuisine preferences to tailor the suggestions. You can then view detailed information for suggested recipes, fetched from TheMealDB API.

## ✨ Key Features

*   **AI-Powered Recipe Suggestions:** Enter your available ingredients, and our Genkit-powered AI will suggest recipes.
*   **Generated Recipe Images:** Each recipe suggestion comes with an AI-generated image to give you a visual idea.
*   **Customizable Preferences:**
    *   Specify dietary restrictions (e.g., vegetarian, vegan, gluten-free).
    *   Indicate cuisine preferences (e.g., Italian, Mexican, Indian).
*   **Detailed Recipe View:** Click "View Recipe" to see more details, including:
    *   Ingredients list
    *   Cooking instructions
    *   Image of the dish (from TheMealDB)
    *   Link to the original recipe source (if available)
*   **Responsive Design:** Built with ShadCN UI and Tailwind CSS for a modern and responsive user experience.

## 🛠️ Tech Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) (App Router)
    *   [React](https://reactjs.org/)
    *   [TypeScript](https://www.typescriptlang.org/)
*   **UI Components:**
    *   [ShadCN UI](https://ui.shadcn.com/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [Lucide React](https://lucide.dev/) (for icons)
*   **Generative AI:**
    *   [Genkit (Firebase Genkit)](https://firebase.google.com/docs/genkit) - For AI flows, including recipe name suggestion, image generation, and orchestrating calls to external APIs.
    *   Google AI (Gemini models via Genkit)
*   **External API:**
    *   [TheMealDB API](https://www.themealdb.com/api.php) (for fetching recipe details)
*   **State Management & Forms:**
    *   React Hooks (`useState`, `useEffect`, `useCallback`, `useActionState`, `useTransition`)
    *   `react-hook-form` with `zod` for form validation.

## 🚀 Getting Started

### Prerequisites

*   Node.js (version 18.x or higher recommended)
*   npm or yarn

### Installation

1.  **Clone the repository (if you haven't already):**
    ```bash
    # git clone <your-repository-url>
    # cd <your-project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Environment Variables:**
    *   This project uses Genkit which typically requires Google Cloud credentials for using Google AI models (like Gemini). Ensure your environment is configured for Google Cloud authentication if you're running Genkit locally against Google AI.
    *   You can create a `.env` file in the root of the project for any future API keys or environment-specific configurations. For example:
        ```env
        # Example for a future API key (not currently used by TheMealDB integration)
        # THEMEALDB_API_KEY=your_api_key_here

        # For Genkit with Google AI, ensure GOOGLE_APPLICATION_CREDENTIALS is set
        # or you are logged in via `gcloud auth application-default login`.
        ```

### Running the Development Servers

You need to run two development servers concurrently:
1.  The Next.js frontend application.
2.  The Genkit development server (for AI flows).

1.  **Start the Next.js development server:**
    Open a terminal and run:
    ```bash
    npm run dev
    ```
    This will typically start the app on `http://localhost:9002`.

2.  **Start the Genkit development server:**
    Open a *new* terminal and run:
    ```bash
    npm run genkit:dev
    ```
    This starts the Genkit development server, usually on `http://localhost:3400` where you can inspect your flows. The Genkit plugins (`@genkit-ai/next` or similar) will handle the communication between your Next.js app and the Genkit flows.

    Alternatively, to have Genkit watch for changes in your AI flow files:
    ```bash
    npm run genkit:watch
    ```

Now, you should be able to access FridgeChef in your browser at the address provided by the Next.js development server (e.g., `http://localhost:9002`).

## 📜 Scripts

*   `npm run dev`: Starts the Next.js development server.
*   `npm run genkit:dev`: Starts the Genkit development server.
*   `npm run genkit:watch`: Starts the Genkit development server with file watching.
*   `npm run build`: Builds the Next.js application for production.
*   `npm run start`: Starts the Next.js production server (after building).
*   `npm run lint`: Lints the codebase.
*   `npm run typecheck`: Runs TypeScript type checking.

## 💡 About Genkit

[Genkit](https://firebase.google.com/docs/genkit) is used in this project to define and manage AI-powered flows. These flows handle tasks such as:
*   Suggesting recipe names based on user inputs.
*   Generating images for those recipes.
*   Fetching detailed recipe information from external APIs (TheMealDB).

The Genkit flows are located in the `src/ai/flows/` directory. The Genkit configuration and initialization can be found in `src/ai/genkit.ts`.

---

Happy cooking with FridgeChef!
