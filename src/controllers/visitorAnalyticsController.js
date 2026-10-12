import { NextResponse } from "next/server";
import { isIP } from "node:net";
import dbConnect from "@/lib/db";
import VisitorAnalytics from "@/models/VisitorAnalytics";

const stringValue = (value, max = 300) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const numberValue = (value, max) =>
  Number.isInteger(value) && value >= 0 && value <= max ? value : null;

function detectBrowser(userAgent) {
  if (/Edg\//i.test(userAgent)) return "Microsoft Edge";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  if (/CriOS|Chrome\//i.test(userAgent)) return "Chrome";
  if (/Safari\//i.test(userAgent)) return "Safari";
  return "Unknown";
}

function detectOS(userAgent) {
  if (/Windows NT/i.test(userAgent)) return "Windows";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Mac OS X/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Unknown";
}

function detectDevice(userAgent) {
  if (/iPad|Tablet/i.test(userAgent)) return "Tablet";
  if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function getRequestIp(req) {
  const candidates = [
    req.headers.get("cf-connecting-ip"),
    req.headers.get("true-client-ip"),
    req.headers.get("x-real-ip"),
    req.headers.get("x-forwarded-for")?.split(",")[0],
    req.headers.get("forwarded")?.match(/for=(?:"?\[?)([0-9a-f:.]+)/i)?.[1],
  ];

  for (const candidate of candidates) {
    const ip = candidate?.trim().replace(/^\[|\]$/g, "");
    if (ip && isIP(ip)) return ip;
  }

  return "";
}

export async function recordConsentedVisit(req) {
  try {
    if (req.cookies.get("analytics_consent")?.value !== "accepted") {
      return NextResponse.json({ message: "Analytics consent is required" }, { status: 403 });
    }

    const body = await req.json();
    const sessionId = stringValue(body.sessionId, 80);
    const pagePath = stringValue(body.path, 500);
    if (!/^[a-f0-9-]{16,80}$/i.test(sessionId)) {
      return NextResponse.json({ message: "Invalid analytics session" }, { status: 400 });
    }
    if (!pagePath.startsWith("/") || pagePath.startsWith("//")) {
      return NextResponse.json({ message: "Invalid page path" }, { status: 400 });
    }

    const userAgent = stringValue(body.userAgent, 500);
    const now = new Date();
    const page = {
      path: pagePath,
      visitedAt: now,
      referrer: stringValue(body.referrer, 500),
    };
    const analytics = {
      browser: detectBrowser(userAgent),
      operatingSystem: detectOS(userAgent),
      deviceType: detectDevice(userAgent),
      ipAddress: getRequestIp(req),
      language: stringValue(body.language, 40),
      languages: Array.isArray(body.languages)
        ? body.languages.filter((language) => typeof language === "string").slice(0, 10).map((language) => stringValue(language, 40))
        : [],
      timezone: stringValue(body.timezone, 100),
      platform: stringValue(body.platform, 100),
      screen: {
        width: numberValue(body.screen?.width, 20000),
        height: numberValue(body.screen?.height, 20000),
        colorDepth: numberValue(body.screen?.colorDepth, 128),
      },
      viewport: {
        width: numberValue(body.viewport?.width, 20000),
        height: numberValue(body.viewport?.height, 20000),
      },
    };

    await dbConnect();
    await VisitorAnalytics.findOneAndUpdate(
      { sessionId },
      {
        $setOnInsert: { sessionId, firstSeenAt: now },
        $set: { lastSeenAt: now, ...analytics },
        $inc: { pageViews: 1 },
        $push: { pages: { $each: [page], $slice: -100 } },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return NextResponse.json({ recorded: true }, { status: 202 });
  } catch (error) {
    console.error("Record visitor analytics error:", error);
    return NextResponse.json({ message: "Failed to record visit" }, { status: 500 });
  }
}

export async function getVisitorAnalytics() {
  try {
    await dbConnect();
    const [visitors, totals] = await Promise.all([
      VisitorAnalytics.find()
        .sort({ lastSeenAt: -1 })
        .limit(500)
        .lean(),
      VisitorAnalytics.aggregate([
        {
          $group: {
            _id: null,
            visitors: { $sum: 1 },
            pageViews: { $sum: "$pageViews" },
          },
        },
      ]),
    ]);
    return NextResponse.json({
      visitors,
      totals: totals[0] || { visitors: 0, pageViews: 0 },
      limit: 500,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Get visitor analytics error:", error);
    return NextResponse.json({ message: "Failed to load visitor analytics" }, { status: 500 });
  }
}

export async function deleteVisitorAnalytics(req, { params }) {
  try {
    const { id } = await params;
    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json({ message: "Invalid visitor record id" }, { status: 400 });
    }

    await dbConnect();
    const result = await VisitorAnalytics.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ message: "Visitor record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Visitor record deleted" });
  } catch (error) {
    console.error("Delete visitor analytics error:", error);
    return NextResponse.json({ message: "Failed to delete visitor record" }, { status: 500 });
  }
}
