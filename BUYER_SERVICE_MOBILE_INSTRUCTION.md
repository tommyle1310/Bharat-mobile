# KMSG Mobile (React Native)

A React Native app built with React Navigation, Zustand for state, Axios for API, Socket.IO for realtime, and a small theming system. This guide explains how to run the project and how the app is structured so any developer can get productive quickly.

> Important: API base URL
> - `.env.*` (API_URL) is not currently wired for runtime usage.
> - The API base URL is defined in `src/config/index.ts` via `Config.apiUrl` and `resolveBaseUrl()`.
> - To change the backend endpoint, edit `src/config/index.ts` (both `Config.apiUrl` and, if needed, the dev logic in `resolveBaseUrl`).

## Prerequisites
- Node.js >= 20
- Java 17 (for Android)
- Android Studio with SDK/NDK and an emulator (or a real device)
- Xcode with CocoaPods (macOS only, for iOS)
- Watchman (optional, macOS)

Follow the official environment setup: https://reactnative.dev/docs/set-up-your-environment

## Install
```sh
npm install
```

## Useful scripts (package.json)
- **start**: start Metro bundler
  - `npm start`
- **android:dev**: run Android app in development
  - `npm run android:dev`
- **android:test**: run Android app against test env
  - `npm run android:test`
- **android:prod**: run Android app against production env
  - `npm run android:prod`
- **android:log**: attach Android logs

- **If running android emulator (Android Studio, WINDOW + Shift + Up to adjust the size of the emulator )

  - `npm run android:log`
- **ios**: run iOS app (macOS only)
  - `npm run ios`
- Pre-scripts:
  - `prestart`, `preandroid`, `preios` run `sync-assets` which executes `scripts/sync-data-files.js` and `scripts/gen-images-map.js`

Notes:
- The default `react-native` scripts (`npm run android` / `npm run ios`) also work, but the provided env variants are preferred.
- Ensure an Android emulator is running, or a device is connected with USB debugging enabled before Android commands.

## Running the app
1. Start Metro in one terminal:
   ```sh
   npm start --reset-cache
   ```
2. In another terminal, run a platform target:
   - Android:
     ```sh
     npm run android:dev
     ```
   - iOS (macOS):
     ```sh
     npm run ios
     ```

## Project structure overview
```
./
├─ App.tsx                      # App entry: providers + RootNavigator
├─ index.js                     # Native entry point
├─ src/
│  ├─ navigation/               # React Navigation stacks/tabs and custom tab bar
│  │  ├─ RootNavigator.tsx      # Auth gate + app stack + tabs
│  │  ├─ AuthNavigator.tsx      # Auth flow (login, signup, OTP, etc.)
│  │  └─ BottomTabBar.tsx       # Custom bottom tab UI
│  ├─ screens/                  # Feature screens (home, search, auth, etc.)
│  ├─ components/               # Reusable UI components (Button, Header, Toast ...)
│  ├─ services/                 # API and realtime clients (axios, socket.io)
│  ├─ stores/                   # Zustand store(s) and types
│  ├─ providers/                # App-level providers (StoreProvider)
│  ├─ theme/                    # Design tokens (colors, spacing, fonts)
│  ├─ config/                   # Config and axios setup
│  ├─ data/                     # Static JSON data
│  ├─ hooks/                    # Reusable hooks
│  └─ types/                    # Shared TypeScript types
├─ android/ ios/                # Native projects
├─ assets/                      # Images and local data files
└─ scripts/                     # Asset sync & image mapping
```

## App composition (providers)
`App.tsx` composes top-level providers and mounts navigation:
```tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { StoreProvider } from './src/providers/StoreProvider';
import { ToastProvider } from './src/components';

function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <ToastProvider>
          <RootNavigator />
        </ToastProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
```
- **SafeAreaProvider**: Handles safe area insets.
- **StoreProvider**: Initializes/persists Zustand store.
- **ToastProvider**: In-app toast notifications.
- **RootNavigator**: Main navigation container.

## Navigation
- Library: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`.
- Theme: Navigation uses app `theme` colors for background, text, etc.

Flow:
- `RootNavigator` decides between `AuthNavigator` and the main app based on `useUserStore().isAuthenticated`.
- Authenticated users get a Stack with:
  - Tabs: Home, Watchlist, Bids, Wins, More (custom `BottomTabBar`)
  - Plus stack screens: `Search`, `VehicleList`, `VehicleDetail`, `Wishlist`, `VehicleImages`
- Unauthenticated users get `AuthNavigator` with `Login`, `Signup`, `OTP`, `Pan`, `Adhaar`, `TermsnConditions`, `ForgotPassword`.

Key files:
- `src/navigation/RootNavigator.tsx`
- `src/navigation/AuthNavigator.tsx`
- `src/navigation/BottomTabBar.tsx`

## State management (Zustand)
- Store lives in `src/stores/userStore.ts` and is re-exported via `src/stores/index.ts`.
- Persisted using `zustand/middleware` with `@react-native-async-storage/async-storage`.
- Tracks auth tokens, buyer info, and user vehicle lists (watchList, wins, bids, wishlist). Provides CRUD actions and helpers, e.g. `isVehicleInList`.

Example usage:
```ts
import { useUserStore } from '@/src/stores/userStore';

const token = useUserStore((s) => s.token);
const addToWatchList = useUserStore((s) => s.addToWatchList);
```

Auth gating:
- `useUserStore().isAuthenticated` controls which navigator the app renders.
- `setAuthTokens({ token, refreshToken, category })` marks user as authenticated.
- `logout()` clears state and calls API logout.

## Theme
- Located in `src/theme/index.ts` as a typed `theme` object with:
  - **colors**: primary, background, text, border, status, etc.
  - **spacing/radii**: layout sizing tokens.
  - **fonts/fontSizes**: typography tokens.
  - **shadows**: platform-friendly elevation presets.
- Navigation theme derives from this `theme` so UI colors remain consistent.

Usage example:
```ts
import { theme } from '@/src/theme';

const styles = {
  card: { backgroundColor: theme.colors.card, padding: theme.spacing.lg },
};
```

## UI components
- Exported via `src/components/index.ts` for convenient imports.
- Notable components:
  - **Button, Input, Select, Link, IconButton**: basic controls
  - **Avatar, Badge**: display elements
  - **Spinner, FullScreenLoader**: loading states
  - **Modal, FilterModal**: overlays
  - **Header, Tab, TabExamples, HeaderExamples**: layout/navigation helpers
  - **ToastProvider, useToast**: global toasts
  - **VehicleCard, GroupCard, UserProfile**: domain-specific UI

## Services (API + Realtime)
- HTTP: Axios clients configured in `src/config/axiosConfig.ts` (base URL, interceptors). Domain services:
  - `src/services/authService.ts` — register, login, logout, refresh token, name lookup
  - `src/services/vehicleServices.ts` — groups, vehicle list by group, vehicle details, images
  - `src/services/searchServices.ts` — search and filter endpoints plus lookup data
- Realtime: `src/services/socket.ts` uses `socket.io-client` and `resolveBaseUrl()` for the server URL. Exposes subscribe helpers like `onVehicleWinnerUpdate`, `onVehicleEndtimeUpdate`, plus `setBuyerId` to join per-user rooms.

## Config
- `src/config/index.ts` builds a `Config` object from env via `react-native-dotenv` (`@env`) and exports `resolveBaseUrl()`.
  - Env keys used: `API_URL`, `DIR_BASE`, `DIR_CASE_OPTION`, `DIR_BUYER`, `DIR_REGION`, `DIR_VEHICLE`, `PORT`.
  - In dev, Android defaults to a fixed IP (`13.203.1.159:PORT`) per current code; iOS uses `localhost:PORT`.
- `src/config/axiosConfig.ts` (referenced by services) centralizes HTTP config and error handling.

Environment file:
- Create a `.env` in project root if needed (values may already be hard-coded):
```env
API_URL=http://13.203.1.159:1310/kmsg/buyer
PORT=1310
DIR_BASE=data-files
DIR_VEHICLE=vehicles
DIR_BUYER=buyer
DIR_REGION=region
DIR_CASE_OPTION=case_option
```

## Types
- `src/types/Vehicle.tsx` defines the `Vehicle` shape used in store lists and UI mapping.
- Services expose their own response shapes (e.g., `VehicleApi`, `VehicleGroupApi`, `SearchVehicleResponse`).

## Auth flow summary
- Signup/Login via `authService` endpoints.
- On successful login, call `useUserStore.getState().setAuthTokens({...})` to set tokens and `isAuthenticated=true`.
- `RootNavigator` switches from `AuthNavigator` to app tabs when authenticated.
- `logout()` clears local state and hits the logout endpoint.

## Data and assets
- `assets/data-files` contains static images and groups used by Home and vehicle screens.
- `npm run sync-assets` ensures images and maps are generated (triggered automatically before start/build scripts).

## Testing & linting
- Jest setup with a sample test in `__tests__/App.test.tsx`.
- ESLint config via `@react-native/eslint-config`.

### Common issues
- Android cannot connect to backend: ensure device can reach `13.203.1.159`; adjust `resolveBaseUrl()` or `.env` accordingly.
- Metro cache issues: clear cache `npm start -- --reset-cache` and rebuild the app.

## Conventions
- TypeScript across the app; avoid `any` in exported APIs.
- Keep functions short, prefer early returns.
- Use tokens from `theme` for colors/sizes.
- Favor reusable components from `src/components`.

## Where to start reading code
- `App.tsx` → `src/navigation/RootNavigator.tsx` → `src/screens/home/ui/HomeScreen.tsx`
- Store/state: `src/stores/userStore.ts`
- API layer: `src/config/axiosConfig.ts` and `src/services/*`
- UI kit: `src/components/*`
