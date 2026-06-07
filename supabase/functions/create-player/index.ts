import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'مطلوب تسجيل الدخول' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Client with caller's token — verify they are admin
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'مطلوب تسجيل الدخول' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('user_type, sport')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.user_type !== 'coach' || profile?.sport !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'ممنوع — صلاحية المدير فقط' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Admin verified — use service_role for creation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const { firstName, email, position, age, dominantFoot, jerseyNumber } = body

    // Validation
    if (!firstName || !email) {
      return new Response(
        JSON.stringify({ error: 'الاسم والبريد الإلكتروني مطلوبان' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate temporary password
    const tempPassword = `R${Math.random().toString(36).slice(2, 8).toUpperCase()}@2026`

    // Create Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: firstName, user_type: 'player' }
    })

    if (authError) {
      // Check for duplicate email
      if (authError.message?.includes('already registered')) {
        return new Response(
          JSON.stringify({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = authData.user.id

    // Update profile
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({
        user_type: 'player',
        full_name: firstName,
      })
      .eq('id', userId)

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError.message)
    }

    // Create player record
    const { error: playerError } = await supabaseAdmin
      .from('players')
      .insert({
        user_id: userId,
        name: firstName,
        club: 'الروضة',
        position: position || '',
        age: age ? parseInt(String(age)) : null,
        dominant_foot: dominantFoot || 'right',
        jersey_number: jerseyNumber ? parseInt(String(jerseyNumber)) : null,
      })

    if (playerError) {
      console.error('Player insert error:', playerError.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        email,
        tempPassword,
        message: 'تم إنشاء حساب اللاعب بنجاح'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message ?? 'خطأ غير متوقع' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})