import { NextRequest, NextResponse } from 'next/server';

const RAPID_API_HOST = 'instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com';
const RAPID_API_URL = 'https://instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com/get-info-rapidapi';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing or invalid URL' }, { status: 400 });
    }

    const trimmedUrl = url.trim();

    if (!trimmedUrl.includes('tiktok.com')) {
      return NextResponse.json({ success: false, error: 'Invalid TikTok URL format' }, { status: 400 });
    }

    const apiKey = process.env.RAPID_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch(`${RAPID_API_URL}?url=${encodeURIComponent(trimmedUrl)}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': RAPID_API_HOST,
      },
    });

    const result = await response.json();

    const videoUrl = result.url ||
      result.video_url ||
      result.download_url ||
      result.media?.url ||
      result.items?.[0]?.video_url ||
      result.items?.[0]?.url;

    if (videoUrl) {
      return NextResponse.json({ success: true, videoUrl });
    }

    return NextResponse.json({
      success: false,
      error: 'Could not retrieve video. The video may be private or the link is invalid.',
    }, { status: 404 });

  } catch (error) {
    console.error('TikTok download API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch video. Please try again.' }, { status: 500 });
  }
}
