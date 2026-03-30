import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    platform: "BSWFCC Platform",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    services: {
      api: "operational",
      auth: "operational",
    },
  });
}
