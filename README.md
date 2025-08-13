# AuraFit

AuraFit is a web-based wellness application designed to provide users with a personalized, full-day schedule from wake-up to sleep. It adapts to user goals, preferences, and daily feedback to create a holistic plan for a healthy lifestyle. This prototype uses Firebase for user authentication and data storage.

## Features

- **Personalized Schedules:** Generates a daily schedule based on user's wake/sleep times, primary goals (e.g., weight loss, muscle gain), available equipment, and diet.
- **Dynamic Adjustments:** Allows users to adjust their schedule based on daily energy levels, soreness, and available time.
- **Google Authentication:** Securely sign in with your Google account.
- **Cloud Storage:** User profiles and daily schedules are saved to Firestore, making them accessible from any device.
- **AI-Powered Generation:** Option to use a generative AI model to create a more detailed and conversational wellness plan.
- **Data Export:** Export your daily schedule to JSON or CSV format.

## Firebase Setup

To run this application, you need to set up your own Firebase project.

1.  **Create a Firebase Project:**
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Click "Add project" and follow the on-screen instructions.

2.  **Add a Web App:**
    - In your project's overview page, click the Web icon (`</>`) to add a new web app.
    - Give your app a nickname and click "Register app".

3.  **Get Firebase Config:**
    - After registering the app, Firebase will provide you with a `firebaseConfig` object. It looks like this:
      ```javascript
      const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
      };
      ```
    - Copy this object.

4.  **Update `firebase.js`:**
    - Open the `firebase.js` file in this project.
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
    If you have Python 3 installed, you can use its built-in server:
    ```bash
    python -m http.server
    ```
    Alternatively, you can use other tools like `npx serve`.

3.  **Open the app:**
    - Open your web browser and navigate to `http://localhost:8000`.

## How to Use

1.  **Login:** Click the "Login with Google" button to sign in with your Google account.
2.  **Onboarding (First-time users):** If it's your first time logging in, you will be directed to the onboarding screen. Fill in your profile details (wake/sleep times, goals, etc.) and click "Save & Continue".
3.  **Main Dashboard:** You will be taken to the main dashboard, where your personalized daily schedule is displayed.
4.  **Adjust and Generate:** Use the sliders at the top to adjust your current energy, soreness, and available time. The schedule will update accordingly. You can also click "Generate with AI" for a different schedule.
5.  **Logout:** Click the "Logout" button in the header to sign out.
