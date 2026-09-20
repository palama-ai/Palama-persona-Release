import { NextResponse } from 'next/server'

/**
 * GET /api/releases/latest — release feed for Palama Co-Worker auto-update.
 * Configure via env (Vercel): RELEASE_VERSION, RELEASE_DOWNLOAD_URL, RELEASE_NOTES.
 * Without a published release it honestly reports no version (app stays "up to date").
 */
export async function GET() {
  const version = (process.env.RELEASE_VERSION || '').trim()
  if (!version) {
    return NextResponse.json({ version: '', download_url: '', notes: '' })
  }
  return NextResponse.json({
    version,
    download_url: (process.env.RELEASE_DOWNLOAD_URL || '').trim(),
    notes: (process.env.RELEASE_NOTES || '').trim(),
  })
}
