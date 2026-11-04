import { getH3App } from "@agent-native/core/server";
import { defineEventHandler, setResponseHeader } from "h3";

// Framework default is geolocation=(); finders can pin where they found an item.
const PERMISSIONS_POLICY = "camera=*, microphone=(self), geolocation=(self), screen-wake-lock=()";

export default (nitroApp: { hooks?: { hook?: (name: string, cb: () => void) => void } }) => {
  const hook = nitroApp?.hooks?.hook;
  if (typeof hook !== "function") return;

  // Registered on first request so it runs after the core security middleware (last write wins).
  let registered = false;
  hook.call(nitroApp.hooks, "request", () => {
    if (registered) return;
    registered = true;
    getH3App(nitroApp).use(
      defineEventHandler((event) => {
        setResponseHeader(event, "Permissions-Policy", PERMISSIONS_POLICY);
      }),
    );
  });
};
