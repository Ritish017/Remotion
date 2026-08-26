import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { DatabaseFactory } from '@/lib/database';
import { StorageFactory } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || id.includes('..') || id.includes('/') || id.includes('\\')) {
      return new NextResponse('Invalid video ID', { status: 400 });
    }

    const db = DatabaseFactory.getProvider();
    const storage = StorageFactory.getProvider();

    // 1. Resolve registered job from database
    const job = await db.getRenderJob(id);
    if (!job || !job.outputPath || job.status !== 'COMPLETED') {
      return new NextResponse('Video artifact not found or render incomplete', { status: 404 });
    }

    // 2. Resolve safe absolute file path
    const filePath = storage.getAbsolutePath(job.outputPath);
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Video file not found on disk', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(filePath, { start, end });
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
      });

      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': 'video/mp4',
        },
      });
    }

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
        'Content-Length': fileSize.toString(),
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error: any) {
    console.error('Error serving local video:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
