import { NextResponse } from 'next/server';
import { CROPS_DATA } from '@/data/crops';

export async function GET() {
  return NextResponse.json({ success: true, crops: CROPS_DATA });
}
