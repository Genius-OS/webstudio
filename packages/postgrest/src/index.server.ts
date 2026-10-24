import type { Database } from "./__generated__/db-types";
import { PostgrestClient } from "@supabase/postgrest-js";
import { Agent, fetch as undiciFetch } from "undici";
export type { Database } from "./__generated__/db-types";

export type Client = PostgrestClient<Database>;

const postgrestAgent = new Agent({ keepAliveTimeout: 1, pipelining: 0 });

const postgrestFetch = (async (
  input: Parameters<typeof undiciFetch>[0],
  init?: Parameters<typeof undiciFetch>[1]
) =>
  undiciFetch(input, {
    ...init,
    dispatcher: postgrestAgent,
  })) as typeof fetch;

export const createClient = (url: string, apiKey: string): Client => {
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers.apikey = apiKey;
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const client = new PostgrestClient<Database>(url, {
    headers,
    fetch: postgrestFetch,
  });

  return client;
};
