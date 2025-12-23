import { NextRequest, NextResponse } from "next/server";
import { webhookConfig } from "@/db/sqlite";

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
      const finalUrlBase = urlBase || url;
      webhookConfig.set(gateway, url, finalUrlBase, headers || {});

      return NextResponse.json({
        success: true,
        gateway,
        url,
        urlBase: finalUrlBase,
        headers: headers || {},
      });
    } else if (url && typeof url === "string") {
      // Legacy format (backward compatibility) - save to a default gateway
      // We'll use "default" as the gateway name for legacy URLs
      webhookConfig.set("default", url, url, {});
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
      const config = webhookConfig.get(gateway);
      if (config) {
        return NextResponse.json({
          gateway,
          url: config.url,
          urlBase: config.urlBase,
          headers: config.headers,
        });
      } else {
        return NextResponse.json({
          gateway,
          url: null,
          urlBase: null,
          headers: {},
        });
      }
    } else {
      // Return all gateway configs
      const allConfigs = webhookConfig.getAll();
      return NextResponse.json({
        configs: allConfigs,
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

