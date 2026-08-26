import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { DatabaseFactory } from '@/lib/database';
import { StorageFactory } from '@/lib/storage';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || id.includes('..') || id.includes('/') || id.includes('\\')) {
      return new NextResponse('Invalid audio ID', { status: 400 });
    }

    const db = DatabaseFactory.getProvider();
    const storage = StorageFactory.getProvider();

    // 1. Resolve registered audio artifact from database
    const artifact = await db.getNarrationArtifact(id);
    let filePath: string | null = null;

    if (artifact && artifact.audioPath) {
      filePath = storage.getAbsolutePath(artifact.audioPath);
    } else {
      // Check direct filename in storage/audio/
      const directRel = `audio/${id}.mp3`;
      if (await storage.exists(directRel)) {
        filePath = storage.getAbsolutePath(directRel);
      }
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return new NextResponse('Audio artifact not found on disk', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);
    const stream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      },
    });

    return new NextResponse(stream as any, {
      headers: {
        'Content-Length': stat.size.toString(),
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error: any) {
    console.error('Error serving local audio:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
