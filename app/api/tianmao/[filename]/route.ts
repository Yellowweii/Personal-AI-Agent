import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  if (filename === "2264ae042fd6942ef7b10f92e52b1ebd.txt") {
    return new NextResponse(
      "Jfc4Z4Ur15JwUBuvUQD5wg7Nu8+l+HscqYlfofbyJdY4rZ9rR4aoEkVOdVnOVy/A",
      {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache",
        },
      },
    );
  }
  return new NextResponse("Not Found", { status: 404 });
}
