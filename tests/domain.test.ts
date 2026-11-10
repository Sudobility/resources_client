import { describe, it, expect } from "vitest";
import { shortenDomain } from "../src/utils/domain.js";

describe("shortenDomain", () => {
  it("strips scheme, www and path", () => {
    expect(shortenDomain("https://www.musictheory.net/lessons")).toBe(
      "musictheory.net",
    );
  });
  it("keeps subdomains other than www", () => {
    expect(shortenDomain("https://docs.example.com/x")).toBe("docs.example.com");
  });
  it("handles a bare host", () => {
    expect(shortenDomain("example.org")).toBe("example.org");
  });
  it("handles a www bare host without scheme", () => {
    expect(shortenDomain("www.example.org/path?q=1")).toBe("example.org");
  });
  it("returns empty for empty input", () => {
    expect(shortenDomain("")).toBe("");
  });
});
