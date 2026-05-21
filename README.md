# Welcome to your React Native Reccurly app 👋
<img width="1864" height="694" alt="image" src="https://github.com/user-attachments/assets/9e30cb79-5373-4d23-a75e-fd8f30d657c1" />

This is a simple [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) .

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Environment Variables

This project supports environment variables for configuration. Create a `.env` file in the root directory to add your environment variables:

```bash
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key

# PostHog Analytics (optional - analytics disabled if not set)
POSTHOG_PROJECT_TOKEN=your-posthog-project-token
POSTHOG_HOST=https://us.i.posthog.com
```

### How to Use Environment Variables

Access environment variables in your code using `process.env`:

```tsx
import { Constants } from 'expo-constants';

const clerkPublishableKey = Constants.expoConfig.extra.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
```

### Important Notes

- Environment variables prefixed with `EXPO_PUBLIC_` are available in both development and production builds
- Variables without `EXPO_PUBLIC_` prefix are only available in development builds
- Never commit sensitive information to version control - add `.env` to your `.gitignore` file
- Use `Constants.expoConfig.extra` to access environment variables in your app

## PostHog Analytics

This project includes optional PostHog analytics integration for tracking user behavior.

### Configuration

PostHog is configured in `src/config/posthog.ts` and reads from the following environment variables:

- `POSTHOG_PROJECT_TOKEN` - Your PostHog project token (starts with `phc_`)
- `POSTHOG_HOST` - PostHog API host URL (defaults to `https://us.i.posthog.com`)

### How It Works

- When `POSTHOG_PROJECT_TOKEN` is set, analytics are enabled
- When not configured, a warning is logged and analytics are disabled
- Events are batched and flushed every 10 seconds for battery efficiency
- App lifecycle events (install, open, background) are captured automatically
- Screen tracking is handled via Expo Router in `_layout.tsx`

### Event Tracking

The app tracks the following events:

- `user_logged_in` - When a user signs in (includes `username` and `is_new_user`)
- `user_logged_out` - When a user signs out
- `burrito_considered` - When user considers a burrito (includes `total_considerations`)

### User Identification

Users are automatically identified by username when they log in, with the following properties set:

- `$set.username` - The username
- `$set_once.first_login_date` - Timestamp of first login

### Testing

1. Set your `POSTHOG_PROJECT_TOKEN` in `.env`
2. Run `npx expo start`
3. Open PostHog dashboard and navigate to "Live Events" to see events in real-time


## Building the App

This project uses [Expo Application Services (EAS)](https://expo.dev/eas) to compile and build the applications for Android and iOS.

### Prerequisites

Before creating your first build, you need to install the EAS CLI and log in to your Expo account:

1. Install the EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Initialize your project for EAS (this will generate an `eas.json` file if it doesn't exist):
   ```bash
   eas build:configure
   ```

### Creating Cloud Builds

You can trigger cloud builds for different platforms and profiles (e.g., development, preview, or production).

**For Android:**
To create an APK for testing or an AAB for the Play Store:
```bash
# For a preview build (APK)
eas build -p android --profile preview

# For a production build (AAB)
eas build -p android --profile production
```

**For iOS:**
To create a build for simulators or TestFlight/App Store:
```bash
# For a simulator build
eas build -p ios --profile preview

# For a production build (requires Apple Developer account)
eas build -p ios --profile production
```

### Local Builds

If you prefer to compile the app directly on your machine rather than using Expo's cloud servers, you can append the `--local` flag to your build commands. 

*Note: You will need Android Studio/SDK installed locally for Android, and Xcode (macOS only) installed for iOS.*
```bash
eas build -p android --profile preview --local
```

For more detailed information, check out the [EAS Build documentation](https://docs.expo.dev/build/introduction/).

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

If You want to use android emulator on linux without installing android studio, you can use [method](https://abp.io/docs/latest/framework/ui/react-native/setting-up-android-emulator).
