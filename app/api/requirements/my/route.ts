import { NextResponse } from 'next/server'

// Minimal placeholder route handler so this file is a proper module.
// Adjust logic as needed for your application.
export async function GET(request: Request) {
  return NextResponse.json({ ok: true, message: 'No requirements yet' }, { status: 200 })
}

export async function POST(request: Request) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
