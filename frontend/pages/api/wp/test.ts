import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Sign in required" });
  }

  const { siteUrl, username, appPass } = req.body;

  if (!siteUrl || !username) {
    return res.status(400).json({ error: "Site URL and username are required" });
  }

  try {
    // Normalize the site URL
    let baseUrl = siteUrl.trim();
    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      baseUrl = "https://" + baseUrl;
    }
    baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash

    const wpApiUrl = `${baseUrl}/wp-json/wp/v2/users/me`;

    // Test the connection
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "CastLumen/1.0",
    };

    // Add authentication if app password is provided
    if (appPass) {
      const auth = Buffer.from(`${username}:${appPass}`).toString("base64");
      headers["Authorization"] = `Basic ${auth}`;
    }

    const response = await fetch(wpApiUrl, {
      method: "GET",
      headers,
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      let errorMessage = "Connection failed";
      
      if (response.status === 401) {
        errorMessage = "Authentication failed. Check your username and application password.";
      } else if (response.status === 404) {
        errorMessage = "WordPress site not found or REST API is disabled.";
      } else if (response.status === 403) {
        errorMessage = "Access forbidden. Check your permissions.";
      } else {
        try {
          const errorData = await response.text();
          errorMessage = `HTTP ${response.status}: ${errorData.substring(0, 100)}`;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }

      return res.status(400).json({ error: errorMessage });
    }

    const userData = await response.json();
    
    return res.status(200).json({ 
      message: "Connection successful",
      user: {
        id: userData.id,
        name: userData.name,
        slug: userData.slug,
        capabilities: userData.capabilities || {}
      }
    });

  } catch (error: any) {
    console.error("WordPress connection test error:", error);
    
    let errorMessage = "Connection failed";
    if (error.name === "TimeoutError") {
      errorMessage = "Connection timeout. Check your site URL.";
    } else if (error.code === "ENOTFOUND") {
      errorMessage = "Site not found. Check your site URL.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(500).json({ error: errorMessage });
  }
}
