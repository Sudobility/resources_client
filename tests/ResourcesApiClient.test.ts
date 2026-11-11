import { describe, it, expect, beforeEach, vi } from "vitest";
import type { NetworkClient, NetworkResponse } from "@sudobility/types";
import { ResourcesApiClient } from "../src/network/ResourcesApiClient.js";
import type { ResourceSection } from "../src/types/index.js";

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
    ok: true, status: 200, statusText: "OK", headers: {},
    success: true, data, timestamp: "2026-01-01T00:00:00.000Z",
  };
}

const section: ResourceSection = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Sheet music",
  sortOrder: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  resources: [
    {
      id: "22222222-2222-2222-2222-222222222222",
      title: "MuseScore", text: "Community sheet music",
      iconUrl: "https://example.com/favicon.png", url: "https://musescore.com",
      sortOrder: 0, enabled: true,
      createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

describe("ResourcesApiClient", () => {
  let client: ResourcesApiClient;
  let net: ReturnType<typeof createMockNetworkClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    net = createMockNetworkClient();
    client = new ResourcesApiClient({
      baseUrl: "https://api.test.com/api/v1/",
      networkClient: net,
    });
  });

  it("GETs /resources/data with the lang and returns sections", async () => {
    net.get.mockResolvedValueOnce(ok({ sections: [section] }));
    const result = await client.data("en");
    expect(result).toEqual([section]);
    expect(net.get).toHaveBeenCalledWith(
      "https://api.test.com/api/v1/resources/data?lang=en",
      { headers: { accept: "application/json" } },
    );
  });

  it("attaches a bearer token when configured", async () => {
    const authed = new ResourcesApiClient({
      baseUrl: "https://api.test.com/api/v1",
      networkClient: net,
      getAuthToken: async () => "tok123",
    });
    net.get.mockResolvedValueOnce(ok({ sections: [] }));
    await authed.data("en");
    expect(net.get).toHaveBeenCalledWith(
      "https://api.test.com/api/v1/resources/data?lang=en",
      { headers: { accept: "application/json", Authorization: "Bearer tok123" } },
    );
  });

  it("throws on a non-ok response", async () => {
    net.get.mockResolvedValueOnce({
      ok: false, status: 500, statusText: "Server Error", headers: {},
      success: false, error: "boom", timestamp: "2026-01-01T00:00:00.000Z",
    });
    await expect(client.data("en")).rejects.toThrow("boom");
  });

  it("tolerates a missing sections field", async () => {
    net.get.mockResolvedValueOnce(ok({}));
    expect(await client.data("en")).toEqual([]);
  });
});
