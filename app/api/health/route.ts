import { NextResponse } from 'next/server'

/**
 * Health check endpoint
 * ใช้สำหรับ:
 * 1. ตรวจสอบว่าแอปทำงานปกติ
 * 2. Ping ทุก 3 วัน → ป้องกัน Supabase pause project (inactive 7 วัน)
 *    ตั้ง cron ที่ uptime service เช่น UptimeRobot (ฟรี) ping /api/health ทุก 3 วัน
 */
export async function GET() {
  return NextResponse.json(
    {
      status:    'ok',
      timestamp: new Date().toISOString(),
      version:   '0.1.0',
    },
    {
      status: 200,
      headers: {
        // ✅ ไม่ cache health check
        'Cache-Control': 'no-store, no-cache',
      },
    }
  )
}
