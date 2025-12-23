import { NextRequest, NextResponse } from "next/server";
import { webhookTemplates } from "@/db/sqlite";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gateway = searchParams.get("gateway");
    const event = searchParams.get("event");
    const id = searchParams.get("id");

    if (id) {
      // Get specific template by ID
      const template = webhookTemplates.getById(id);
      if (!template) {
        return NextResponse.json(
          { error: `Template with id "${id}" not found` },
          { status: 404 }
        );
      }
      return NextResponse.json({ template });
    } else if (gateway && event) {
      // Get templates for specific gateway and event
      const templates = webhookTemplates.getForEvent(gateway, event);
      return NextResponse.json({ templates });
    } else {
      // Get all templates
      const templates = webhookTemplates.getAll();
      return NextResponse.json({ templates });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, gateway, event, payload, id } = body;

    if (!name || !gateway || !event || !payload) {
      return NextResponse.json(
        { error: "Invalid request: 'name', 'gateway', 'event', and 'payload' are required" },
        { status: 400 }
      );
    }

    const template = webhookTemplates.save({
      id,
      name,
      gateway,
      event,
      payload,
    });

    return NextResponse.json({ template });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save template" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Invalid request: 'id' query parameter is required" },
        { status: 400 }
      );
    }

    const deleted = webhookTemplates.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: `Template with id "${id}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}

