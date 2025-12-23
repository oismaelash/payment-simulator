import { NextRequest, NextResponse } from "next/server";
import { state } from "@/state";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gateway, url, urlBase, headers } = body;

    // Support both legacy format (just url) and new format (gateway + url + headers)
    if (gateway && typeof gateway === "string") {
      // New per-gateway format
      if (!url || typeof url !== "string") {
        return NextResponse.json(
          { error: "Invalid request: 'url' is required when 'gateway' is provided" },
          { status: 400 }
        );
      }

      // url is the final URL (with query params), urlBase is optional
      state.setWebhookUrlForGateway(gateway, url);

      // Save headers if provided
      if (headers && typeof headers === "object" && !Array.isArray(headers)) {
        state.setWebhookHeadersForGateway(gateway, headers);
      }

      return NextResponse.json({
        success: true,
        gateway,
        url,
        urlBase: urlBase || url,
        headers: headers || {},
      });
    } else if (url && typeof url === "string") {
      // Legacy format (backward compatibility)
      state.setWebhookUrl(url);
      return NextResponse.json({ success: true, url });
    } else {
      return NextResponse.json(
        { error: "Invalid request: either 'url' (legacy) or 'gateway' + 'url' (new format) is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gateway = searchParams.get("gateway");

    if (gateway) {
      // Return config for specific gateway
      const url = state.getWebhookUrlForGateway(gateway);
      const headers = state.getWebhookHeadersForGateway(gateway);
      return NextResponse.json({
        gateway,
        url,
        headers,
      });
    } else {
      // Return all gateway configs (for debugging)
      // Note: This requires access to gateway list, which we don't have here
      // For now, return legacy URL if exists
      const legacyUrl = state.getWebhookUrl();
      return NextResponse.json({
        legacyUrl,
        message: "Use ?gateway=<name> to get specific gateway config",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get config" },
      { status: 500 }
    );
  }
}

