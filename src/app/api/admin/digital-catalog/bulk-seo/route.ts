import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';
import { generateSeoDescription } from '@/lib/seo-descriptions';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const force = Boolean(body.force); // true = overwrite even good descriptions
    const syncProducts = body.syncProducts !== false; // default true
    const minLength = typeof body.minLength === 'number' ? body.minLength : 80;

    const admin = createAdminClient();

    // Fetch all catalog items
    const { data: catalog, error: fetchError } = await admin
      .from('digital_catalog')
      .select('id, title, description, category, suggested_price');

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!catalog?.length) {
      return NextResponse.json({ updated: 0, message: 'No catalog products found' });
    }

    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Update in batches to stay safe
    const BATCH = 25;
    for (let i = 0; i < catalog.length; i += BATCH) {
      const batch = catalog.slice(i, i + BATCH);

      await Promise.all(
        batch.map(async (item) => {
          const newDescription = generateSeoDescription(item, { force, minLength });
          const old = (item.description || '').trim();

          if (newDescription === old) {
            skipped += 1;
            return;
          }

          const { error } = await admin
            .from('digital_catalog')
            .update({ description: newDescription })
            .eq('id', item.id);

          if (error) {
            errors.push(`${item.title}: ${error.message}`);
            return;
          }

          updated += 1;

          // Optionally push the new description to already-sourced merchant products
          if (syncProducts) {
            await admin
              .from('products')
              .update({ description: newDescription })
              .eq('catalog_id', item.id);
          }
        })
      );
    }

    return NextResponse.json({
      ok: true,
      total: catalog.length,
      updated,
      skipped,
      errors: errors.slice(0, 10), // limit noise
      message: `Updated \( {updated} catalog descriptions \){syncProducts ? ' (+ synced to sourced products)' : ''}. Skipped ${skipped}.`,
    });
  } catch (err: any) {
    console.error('bulk-seo error:', err);
    return NextResponse.json(
      { error: err.message || 'Bulk SEO update failed' },
      { status: 500 }
    );
  }
}