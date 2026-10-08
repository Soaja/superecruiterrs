import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API routes, files with an extension and metadata
  // image routes (icons, OG/Twitter cards are served as-is, no locale redirect).
  matcher: "/((?!api|trpc|_next|_vercel|icon|apple-icon|.*opengraph-image|.*twitter-image|.*\\..*).*)",
};
