import { createAuthPlugin } from "@agent-native/core/server";

// Students sign in with Supabase Auth (app/lib/supabase.ts); the app's own
// route guard in app/routes/_app.tsx gates the screens. Every page route is
// public to the framework so its login page never intercepts them.
// Must match APP_PAGES in app/root.tsx.
export const APP_PAGES = [
  "/",
  "/welcome",
  "/signin",
  "/create-account",
  "/complete-profile",
  "/search",
  "/items",
  "/report",
  "/claims",
  "/posts",
  "/profile",
];

export default createAuthPlugin({
  rootAuth: false,
  workspaceAppPublicPaths: APP_PAGES,
});
