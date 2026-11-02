import { createAuthPlugin } from "@agent-native/core/server";

// Email/password auth with optional Google OAuth (enabled automatically when
// GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set). The app ships its own
// Welcome / Sign in / Create account screens, so the framework login page
// just forwards there.
export default createAuthPlugin({
  rootAuth: false,
  workspaceAppPublicPaths: ["/welcome", "/signin", "/create-account"],
  loginHtml: `<!doctype html><html><head><meta charset="utf-8"><title>CampusLost&amp;Found</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#0B3C49}</style><script>location.replace("/welcome")</script></head><body></body></html>`,
});
