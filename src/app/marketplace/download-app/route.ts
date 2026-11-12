import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.redirect(
    'https://github.com/demainpaulogifted/orizzoncart/releases/latest/download/OrizzonCart-Marketplace.apk',
    302
  );
}
