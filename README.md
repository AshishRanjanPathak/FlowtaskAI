# FlowTask AI

Tech Stack:

Frontend: The project is built with Next.js, a popular React framework that provides server-side rendering and static site generation capabilities, enhancing performance and SEO.
Backend: Firebase is used for the backend.
Authentication: Firebase Authentication handles user sign-ups and logins, supporting both Email/Password and Google Sign-In methods.
Database: Cloud Firestore, a NoSQL cloud database, is used to store and manage task data.
AI: The core of the application lies in its integration with generative AI, specifically for:
Task Parsing: An AI Task Parser processes user input (voice or text) to extract and structure task information, including title, description, due date, priority, and estimated energy level. It uses reasoning to interpret the input and categorize tasks.
Task Prioritization: An AI Prioritizer intelligently prioritizes tasks based on factors like urgency, required energy level, and the user's current mood. It also provides transparency by showing the user how the prioritization is being done and allows for manual adjustments.
Other Libraries/Tools:
npm: Used for package management to install project dependencies.
UI/UX:

Overall Aesthetic: The design aims for a calm, uncluttered, and approachable interface.
Color Palette:
Background: Light gray (#F0F2F5) for a clean backdrop.
Primary: Soft blue (#90AFC5) to create a sense of calmness and focus.
Accent: Muted orange (#E2BC74) to highlight interactive elements without being overwhelming.
Typography:
Body text: 'PT Sans' (sans-serif) for readability.
Headlines: 'Space Grotesk' (sans-serif) paired with 'PT Sans' to give a modern, tech-forward feel to headlines.
Icons: Simple, line-based icons (like Feather or Material Design Icons) are used to maintain a minimalist aesthetic.
Layout: A card-based layout with ample spacing and rounded corners provides a friendly and organized presentation of information.
Core Features:

AI-powered task parsing and organization.
Intelligent task prioritization based on various factors, with user transparency and control.
Mood logging to influence task prioritization.
A clear and prioritized task dashboard grouped by energy level.
Smart daily reminders based on user availability and energy levels.
Customizable calendar and reminder settings.
In essence, FlowTask AI is a modern web application leveraging the power of Next.js and Firebase, with generative AI at its core to provide a smart and intuitive task management experience. The UI is designed to be clean, calming, and user-friendly, with a focus on readability and ease of use.

## Getting Started Locally

To get this application running on your local machine, follow these steps.

### Prerequisites

- [Node.js](httpss://nodejs.org/en) (version 18 or later recommended)
- [npm](httpss://www.npmjs.com/) (usually comes with Node.js)

### 1. Download the Code

### 2. Set Up Firebase

This project uses Firebase for authentication and database storage. You'll need to create your own Firebase project to run it.

1.  Go to the [Firebase Console](httpss://console.firebase.google.com/).
2.  Click **Add project** and follow the on-screen instructions to create a new project.
3.  Once your project is created, go to the **Project Overview** page and click the **Web** icon (`</>`) to add a web app to your project.
4.  Give your app a nickname (e.g., "FlowTask AI") and click **Register app**.
5.  After registering, Firebase will provide you with a `firebaseConfig` object. **Copy this object.** It will look something like this:
    ```javascript
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abc123def456"
    };
    ```

### 3. Configure Your Local Environment

1.  **Update Firebase Config**: Open the file `src/lib/firebase.ts` in your code editor. Replace the existing `firebaseConfig` object with the one you copied from your Firebase project.

2.  **Enable Firebase Services**:
    *   In the Firebase Console, go to the **Authentication** section. Click **Get started** and enable the **Email/Password** and **Google** sign-in methods.
    *   Go to the **Cloud Firestore** section. Click **Create database**, start in **Test mode**, and choose a location. This will allow the app to save and retrieve tasks.

### 4. Install and Run the Application

1.  Open your terminal or command prompt and navigate to the project's root folder (the one with `package.json`).
2.  Install the necessary dependencies by running:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open your web browser and go to [https://localhost:9002](https://localhost:9002).

You should now see the FlowTask AI application running on your local machine, connected to your very own Firebase backend