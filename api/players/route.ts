import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 0);
    const limit = 20;
    const offset = page * limit;

    const { data, error, count } = await supabase
      .from('players')
      .select('id, name, name_ar, age, position, rating, sport, region, badge, badge_color, photo_url, is_active', { count: 'exact' })
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('rating', { ascending: false });

    if (error) {
      console.error("[SportID players] GET error:", error.message);
      return Response.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
    }

    // Return as flat array for backward compat + pagination metadata
    return Response.json({
      success: true,
      data: data, // flat array for frontend compat
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || data.length) / limit)
      },
      error: null
    });
  } catch (e: any) {
    console.error("[SportID players] Unhandled error:", e);
    return Response.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, age, position, sport, region } = body;

    if (!name || !age || !position) {
      return Response.json({ success: false, data: null, error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('players')
      .insert({ name, age, position, sport, region, rating: 50, is_active: true })
      .select()
      .single();

    if (error) {
      console.error("[SportID players] POST error:", error.message);
      return Response.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
    }

    return Response.json({ success: true, data, error: null }, { status: 201 });
  } catch (e: any) {
    console.error("[SportID players] Unhandled error:", e);
    return Response.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}