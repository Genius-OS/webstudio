import type { LoaderFunction } from "@remix-run/node";
import { createDebug } from "~/shared/debug";
import { authenticator } from "~/services/auth.server";
import {
  comparePathnames,
  dashboardPath,
  isDashboard,
  loginPath,
} from "~/shared/router-utils";
import { isRedirectResponse, returnToCookie } from "~/services/cookie.server";
import { preventCrossOriginCookie } from "~/services/no-cross-origin-cookie";
import { redirect, setNoStoreToRedirect } from "~/services/no-store-redirect";
import { allowedDestinations } from "~/services/destinations.server";

const debug = createDebug(import.meta.url);

// External auth entry: /sso?token=<signed external JWT>
export const loader: LoaderFunction = async ({ request }) => {
  if (false === isDashboard(request)) {
    return new Response("Not Found", {
      status: 404,
    });
  }

  try {
    preventCrossOriginCookie(request);
    allowedDestinations(request, ["document"]);
    // CSRF is not needed for document only routes

    const token = new URL(request.url).searchParams.get("token");

    if (token === null || token === "") {
      throw redirect(loginPath({ returnTo: dashboardPath() }));
    }

    return await authenticator.authenticate("external", request, {
      successRedirect: dashboardPath(),
      throwOnError: true,
    });
  } catch (error) {
    // all redirects are basically errors and in that case we don't want to catch it
    if (error instanceof Response) {
      if (isRedirectResponse(error)) {
        const noStoreResponse = setNoStoreToRedirect(error);
        const response = new Response(noStoreResponse.body, noStoreResponse);
        const url = new URL(request.url);
        const isAuthRoute = url.pathname === "/sso";
        let returnTo = isAuthRoute
          ? url.searchParams.get("returnTo")
          : `${url.pathname}${url.search}`;

        if (returnTo !== null) {
          if (isAuthRoute && comparePathnames(returnTo, request.url)) {
            // avoid loops
            returnTo = "/";
          }

          // Do not allow absolute URLs
          if (URL.canParse(returnTo)) {
            returnTo = "/";
          }
        }

        const options = returnTo === null ? { maxAge: -1 } : {};

        response.headers.append(
          "Set-Cookie",
          await returnToCookie.serialize(returnTo, options)
        );

        return response;
      }

      return error;
    }

    debug("error", error);

    console.error("error", error);
    throw error;
  }
};
