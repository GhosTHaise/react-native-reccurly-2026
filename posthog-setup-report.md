<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurrly Expo app. Here is a summary of all changes made:

- **`app.config.js`** — Created dynamic Expo config to expose `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` from `.env` via `Constants.expoConfig.extra`, replacing the static `app.json` for runtime config access.
- **`src/config/posthog.ts`** — Created PostHog singleton client configured from `expo-constants`, with app lifecycle tracking, batching, and feature flag preloading.
- **`app/_layout.tsx`** — Added `PostHogProvider` wrapping the app, activated manual screen tracking with `posthog.screen()` using `usePathname` and `useGlobalSearchParams`.
- **`app/(auth)/sign-in.tsx`** — Activated `usePostHog`, added `posthog.identify()` + `posthog.capture('user_signed_in')` on successful sign-in (both password and MFA paths), and `posthog.capture('user_sign_in_failed')` on error.
- **`app/(auth)/sign-up.tsx`** — Activated `usePostHog`, added `posthog.identify()` + `posthog.capture('user_signed_up')` on successful registration, and `posthog.capture('user_sign_up_failed')` on error.
- **`app/(tabs)/settings.tsx`** — Activated `usePostHog`, added `posthog.capture('user_signed_out')` and `posthog.reset()` on sign-out.
- **`app/onboarding.tsx`** — Added `posthog.capture('onboarding_viewed')` on mount to track the top of the conversion funnel.
- **`app/(tabs)/index.tsx`** — Added `posthog.capture('subscription_expanded')` with `subscription_name` and `category` properties when a user expands a subscription card.

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully completes sign-in (including MFA verification path) | `app/(auth)/sign-in.tsx` |
| `user_sign_in_failed` | Sign-in attempt failed due to invalid credentials or other error | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User successfully completes sign-up and email verification | `app/(auth)/sign-up.tsx` |
| `user_sign_up_failed` | Sign-up attempt failed due to validation or server error | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signs out from the settings screen | `app/(tabs)/settings.tsx` |
| `onboarding_viewed` | User views the onboarding screen — top of the conversion funnel | `app/onboarding.tsx` |
| `subscription_expanded` | User expands a subscription card to view its details on the home screen | `app/(tabs)/index.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics](https://us.posthog.com/project/397222/dashboard/1510059)
- **Sign-up Conversion Funnel** (onboarding → sign-up): [https://us.posthog.com/project/397222/insights/qbrMkvhr](https://us.posthog.com/project/397222/insights/qbrMkvhr)
- **Daily Sign-ins**: [https://us.posthog.com/project/397222/insights/MlMfMCM2](https://us.posthog.com/project/397222/insights/MlMfMCM2)
- **Auth Failures** (sign-in + sign-up errors): [https://us.posthog.com/project/397222/insights/ZEqTp911](https://us.posthog.com/project/397222/insights/ZEqTp911)
- **Subscription Engagement** (card expansions): [https://us.posthog.com/project/397222/insights/tee5OXdC](https://us.posthog.com/project/397222/insights/tee5OXdC)
- **User Churn — Sign-outs**: [https://us.posthog.com/project/397222/insights/lGQfo9m2](https://us.posthog.com/project/397222/insights/lGQfo9m2)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
