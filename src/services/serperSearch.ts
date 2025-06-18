import { config } from "../config";

const TRUSTED_DOMAINS = [
  "gov.uk",
  "digital.nhs.uk",
  "nationalarchives.gov.uk",
  "parliament.uk",
  "service.gov.uk",
  "blog.gov.uk",
  "design-system.service.gov.uk",
  "gds.blog.gov.uk",
];

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
  domain: string;
}

const extractDDaTInfo = (content: string): string => {
  const ddatPatterns = [
    /skill level:.*?(?=\n|$)/i,
    /capability:.*?(?=\n|$)/i,
    /role description:.*?(?=\n|$)/i,
    /responsibilities:.*?(?=\n|$)/i,
    /essential criteria:.*?(?=\n|$)/i,
  ];
  return ddatPatterns
    .map((pattern) => {
      const match = pattern.exec(content);
      return match ? match[0].trim() : "";
    })
    .filter(Boolean)
    .join("\n");
};

const isTrustedSource = (url: string): boolean => {
  return TRUSTED_DOMAINS.some((domain) => url.toLowerCase().includes(domain));
};

const formatSearchResult = (result: SearchResult): string => {
  const domain = new URL(result.link).hostname;
  return `${result.snippet} (Source: ${result.title} - ${domain})`;
};

export const performSerperSearch = async (
  query: string,
  role: string,
  context: string = "general"
): Promise<SearchResult[]> => {
  const apiKey = config.GOOGLE_SERP_API_KEY;

  if (!apiKey) {
    console.error("Google Serper API key not found in environment variables");
    throw new Error(
      "Google Serper API key not configured. Please add VITE_GOOGLE_SERP_API_KEY to your environment variables."
    );
  }

  try {
    const enhancedQuery = `${query} site:gov.uk OR site:digital.nhs.uk ${role} DDaT framework GDS standards guidelines`;

    const requestBody = {
      q: enhancedQuery,
      gl: "uk",
      hl: "en",
      num: 10,
      search_type: "search",
    };

    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Serper API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      if (response.status === 403) {
        throw new Error(
          "Invalid or expired Google Serper API key. Please check your API key configuration."
        );
      }

      throw new Error(
        `Google Serper API error: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.organic || !Array.isArray(data.organic)) {
      console.error("Unexpected API response format:", data);
      throw new Error("Invalid response format from Google Serper API");
    }

    const results: SearchResult[] = data.organic
      .map((result: any) => ({
        title: result.title ?? "",
        link: result.link ?? "",
        snippet: result.snippet ?? "",
        position: result.position ?? 0,
        domain: new URL(result.link).hostname,
      }))
      .filter((result) => isTrustedSource(result.link));

    switch (context) {
      case "technical_architect":
        return results.map((result) => ({
          ...result,
          snippet: extractDDaTInfo(result.snippet),
        }));

      case "enhance_prompt":
        return results.filter(
          (result) =>
            result.snippet.toLowerCase().includes("standard") ||
            result.snippet.toLowerCase().includes("guideline") ||
            result.snippet.toLowerCase().includes("best practice") ||
            result.snippet.toLowerCase().includes("gds")
        );

      default:
        return results;
    }
  } catch (error) {
    console.error("Web search error:", error);
    throw error;
  }
};

export const fetchDDaTFrameworkInfo = async (role: string): Promise<string> => {
  try {
    const results = await performSerperSearch(
      `${role} DDaT framework capability skills responsibilities`,
      role,
      "technical_architect"
    );

    return results.map((result) => result.snippet).join("\n\n");
  } catch (error) {
    console.error("Error fetching DDaT framework:", error);
    return "";
  }
};

export const enhanceResponseWithSerperSearch = async (
  query: string,
  modelResponse: string,
  role: string = ""
): Promise<string> => {
  try {
    const searchResults = await performSerperSearch(query, role);

    if (!searchResults.length) {
      return modelResponse;
    }

    const formattedResults = searchResults.map(formatSearchResult);

    const content = formattedResults.join("\n\n");

    return `${modelResponse}\n\n${content}`.trim();
  } catch (error) {
    console.error("Error enhancing response with search:", error);
    return modelResponse;
  }
};
