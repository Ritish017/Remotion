import { NextRequest, NextResponse } from 'next/server'

const CATALYST_URL = process.env.NEXT_PUBLIC_CATALYST_URL || 'http://127.0.0.1:8000'

async function proxyRequest(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const targetPath = path.join('/')
  const url = `${CATALYST_URL}/${targetPath}`

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const options: RequestInit = { method: req.method, headers }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = await req.text()
    }

    const res = await fetch(url, options)
    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    }

    const blob = await res.blob()
    return new NextResponse(blob, {
      status: res.status,
      headers: { 'Content-Type': contentType },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: `CATALYST proxy error: ${error.message}` },
      { status: 502 }
    )
  }
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const DELETE = proxyRequest
