import {
  Strategy,
  AuthorizationError,
  type AuthenticateOptions,
  type StrategyVerifyCallback,
} from "remix-auth";
import type { SessionStorage } from "@remix-run/server-runtime";
import jwt from "@tsndr/cloudflare-worker-jwt";
import type { SessionData } from "~/services/auth.server.utils";

export interface ExternalAuthVerifyParams {
  token: string;
}

export interface ExternalAuthStrategyOptions {
  issuer?: string;
  audience?: string;
  secret?: string;
}

export type ExternalAuthUser = SessionData;

export const extractExternalAuthToken = (request: Request) => {
  const authorization = request.headers.get("Authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : undefined;

  if (bearerToken) {
    return bearerToken;
  }

  const params = new URL(request.url).searchParams;
  const token = params.get("token") ?? params.get("accessToken") ?? undefined;

  return token ?? undefined;
};

export class ExternalAuthStrategy extends Strategy<
  ExternalAuthUser,
  ExternalAuthVerifyParams
> {
  name = "external";

  protected readonly strategyOptions: ExternalAuthStrategyOptions;

  constructor(
    verify: StrategyVerifyCallback<ExternalAuthUser, ExternalAuthVerifyParams>,
    options: ExternalAuthStrategyOptions
  ) {
    super(verify);
    this.strategyOptions = options;
  }

  async authenticate(
    request: Request,
    sessionStorage: SessionStorage,
    options: AuthenticateOptions
  ): Promise<ExternalAuthUser> {
    const token = extractExternalAuthToken(request);

    if (token === undefined) {
      return this.failure(
        "External authentication failed: missing token",
        request,
        sessionStorage,
        options,
        new Error("Missing external authentication token")
      );
    }

    const user = await this.verify({ token });

    return this.success(user, request, sessionStorage, options);
  }
}

export const createExternalAuthVerify =
  (options: ExternalAuthStrategyOptions) =>
  async ({ token }: ExternalAuthVerifyParams): Promise<ExternalAuthUser> => {
    const secret = options.secret;

    if (secret === undefined) {
      throw new Error("External authentication secret is not configured");
    }

    const isValid = await jwt.verify(token, secret);

    if (false === isValid) {
      throw new AuthorizationError("Invalid external authentication token");
    }

    const decoded = jwt.decode<{
      sub?: string;
      userId?: string;
      createdAt?: number;
      iss?: string;
      aud?: string | string[];
    }>(token);
    const payload = decoded?.payload;

    if (options.issuer !== undefined && payload?.iss !== options.issuer) {
      throw new AuthorizationError("Invalid external authentication token");
    }

    const audiences = Array.isArray(payload?.aud)
      ? payload.aud
      : payload?.aud
        ? [payload.aud]
        : [];

    if (
      options.audience !== undefined &&
      audiences.includes(options.audience) === false
    ) {
      throw new AuthorizationError("Invalid external authentication token");
    }

    const userId = payload?.sub ?? payload?.userId;

    if (typeof userId !== "string") {
      throw new AuthorizationError(
        "Invalid external authentication token: missing subject"
      );
    }

    const createdAt =
      typeof payload?.createdAt === "number" ? payload.createdAt : Date.now();

    const user: ExternalAuthUser = { userId, createdAt };

    return user;
  };
