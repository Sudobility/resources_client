import { describe, it, expect, beforeEach, vi } from "vitest";
import type { NetworkClient, NetworkResponse } from "@sudobility/types";
import { ResourcesApiClient } from "../src/network/ResourcesApiClient.js";
import type { Resource } from "../src/types/index.js";

function createMockNetworkClient(): NetworkClient & {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  request: ReturnType<typeof vi.fn>;
} {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
  };
}

function ok<T>(data: T): NetworkResponse<T> {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: {},
    success: true,
    data,
    timestamp: "2026-01-01T00:00:00.000Z",
  };
}

const sample: Resource = {
  id: "11111111-1111-1111-1111-111111111111",
  app: "music",
  locale: "en",
  title: "Learn Theory",
  text: "Music theory basics",
  iconUrl: "https://example.com/favicon.png",
  url: "https://example.com/theory",
  sortOrder: 0,
  enabled: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("ResourcesApiClient", () => {
  let client: ResourcesApiClient;
  let net: ReturnType<typeof createMockNetworkClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    net = createMockNetworkClient();
    client = new ResourcesApiClient({
      baseUrl: "https://api.test.com/",
      networkClient: net,
    });
  });

  it("GETs /resources with a locale and returns the array", async () => {
    net.get.mockResolvedValueOnce(ok({ resources: [sample] }));
    const result = await client.list("en");
    expect(result).toEqual([sample]);
    expect(net.get).toHaveBeenCalledWith(
      "https://api.test.com/resources?locale=en",
      { headers: { accept: "application/json" } },
    );
  });

  it("omits the locale param when not given", async () => {
    net.get.mockResolvedValueOnce(ok({ resources: [] }));
    await client.list();
    expect(net.get).toHaveBeenCalledWith("https://api.test.com/resources", {
      headers: { accept: "application/json" },
    });
  });

  it("attaches a bearer token when a provider is configured", async () => {
    const authed = new ResourcesApiClient({
      baseUrl: "https://api.test.com",
      networkClient: net,
      getAuthToken: async () => "tok123",
    });
    net.get.mockResolvedValueOnce(ok({ resources: [] }));
    await authed.list("en");
    expect(net.get).toHaveBeenCalledWith(
      "https://api.test.com/resources?locale=en",
      { headers: { accept: "application/json", Authorization: "Bearer tok123" } },
    );
  });

  it("throws on a non-ok response", async () => {
    net.get.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Server Error",
      headers: {},
      success: false,
      error: "boom",
      timestamp: "2026-01-01T00:00:00.000Z",
    });
    await expect(client.list("en")).rejects.toThrow("boom");
  });

  it("tolerates a missing resources field", async () => {
    net.get.mockResolvedValueOnce(ok({}));
    expect(await client.list("en")).toEqual([]);
  });
});
