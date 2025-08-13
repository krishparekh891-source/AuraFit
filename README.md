# AuraFit (React Version)

AuraFit is a web-based wellness application designed to provide users with a personalized, full-day schedule from wake-up to sleep. This version of the application has been rebuilt using React and Firebase.

## Features

- **Personalized Schedules:** Generates a daily schedule based on user's wake/sleep times, primary goals, available equipment, and diet.
- **Dynamic Adjustments:** Allows users to adjust their schedule based on daily energy levels, soreness, and available time.
- **Google Authentication:** Securely sign in with your Google account using Firebase Authentication.
- **Cloud Storage:** User profiles and daily schedules are saved to Firestore, making them accessible from any device.
- **Component-Based UI:** The user interface is built with React, making it more maintainable and scalable.
- **Centralized State Management:** Uses React Context API to manage global state for authentication and UI elements.

## Tech Stack

- **Frontend:** React (v18)
- **Backend:** Firebase (Authentication, Firestore)
- **Styling:** Tailwind CSS
- **Build:** No build step. Uses CDN-hosted React, ReactDOM, and Babel for in-browser transpilation.

## Firebase Setup

To run this application, you need to set up your own Firebase project.

1.  **Create a Firebase Project:**
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Click "Add project" and follow the on-screen instructions.

2.  **Add a Web App:**
    - In your project's overview page, click the Web icon (`</>`) to add a new web app.
    - Give your app a nickname and click "Register app".

3.  **Get Firebase Config:**
    - After registering the app, Firebase will provide you with a `firebaseConfig` object.
    - Copy this object.

4.  **Update `src/firebase.js`:**
    - Open the `src/firebase.js` file in this project.
    - Replace the existing `firebaseConfig` object with the one you copied from your Firebase project.

5.  **Enable Google Authentication:**
    - In the Firebase console, go to the "Authentication" section.
    - Click the "Sign-in method" tab.
    - Click on "Google" in the list of providers and enable it.

6.  **Set up Firestore:**
    - In the Firebase console, go to the "Firestore Database" section.
    - Click "Create database" and start in **test mode** for easy setup. (For production, you should configure security rules).

## How to Run

This is a static web application and can be run using any simple local web server.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Start a local server:**
    If you have Python 3 installed, you can use its built-in server from the project's root directory:
    ```bash
    python -m http.server
    ```
    Alternatively, you can use other tools like `npx serve`.

3.  **Open the app:**
    - Open your web browser and navigate to `http://localhost:8000/public/`.

## Project Structure

The project is organized into two main directories:

-   `/public`: Contains the main `index.html` file, which is the entry point for the application, and the `index.css` stylesheet.
-   `/src`: Contains all the JavaScript source code.
    -   `/src/components`: Contains all the React components that make up the UI.
    -   `/src/contexts`: Contains the React Context providers for managing global state.
    -   `/src/firebase.js`: Handles Firebase configuration and initialization.
    -   `/src/index.js`: The main entry point for the React application, where the root component is rendered.
