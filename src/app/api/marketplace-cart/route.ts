
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "orz_shared_cart_id";
const COOKIE_DOMAIN = ".orizzoncart.name.ng";
const MAX_QUANTITY = 99;

function getCartId(request: NextRequest) {
  const existing = request.cookies.get(COOKIE_NAME)?.value;

  // Only accept a UUID, never arbitrary cookie contents.
  if (existing && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(existing)) {
    return { cartId: existing, isNew: false };
  }

  return { cartId: randomUUID(), isNew: true };
}

function attachCartCookie(response: NextResponse, request: NextRequest, cartId: string) {
  const hostname = request.nextUrl.hostname;
  const options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    path: string;
    maxAge: number;
    domain?: string;
  } = {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  };

  // Share the cookie only across OrizzonCart's configured parent domain.
  // Do not set a domain for localhost development.
  if (
    hostname === "orizzoncart.name.ng" ||
    hostname.endsWith(".orizzoncart.name.ng")
  ) {
    options.domain = COOKIE_DOMAIN;
  }

  response.cookies.set(COOKIE_NAME, cartId, options);
  return response;
}

function safeQuantity(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.max(1, Math.min(MAX_QUANTITY, Math.floor(number)));
}

async function readCart(cartId: string) {
  const admin = createAdminClient();

  const { data: rows, error } = await admin
    .from("marketplace_cart_items")
    .select("id, cart_id, merchant_id, product_id, quantity")
    .eq("cart_id", cartId);

  if (error) throw error;
  if (!rows?.length) return [];

  const productIds = [...new Set(rows.map((row) => row.product_id))];
  const merchantIds = [...new Set(rows.map((row) => row.merchant_id))];

  const [{ data: products, error: productError }, { data: merchants, error: merchantError }] =
    await Promise.all([
      admin
        .from("products")
        .select("id, name, price, images, is_digital, is_active, merchant_id")
        .in("id", productIds),
      admin
        .from("merchants")
        .select("id, store_name, store_slug")
        .in("id", merchantIds),
    ]);

  if (productError) throw productError;
  if (merchantError) throw merchantError;

  const productById = new Map((products || []).map((p) => [String(p.id), p]));
  const merchantById = new Map((merchants || []).map((m) => [String(m.id), m]));

  return rows.flatMap((row) => {
    const product = productById.get(String(row.product_id));
    const merchant = merchantById.get(String(row.merchant_id));

    // Do not display deleted, inactive, or mismatched products.
    if (
      !product ||
      !merchant ||
      product.is_active !== true ||
      String(product.merchant_id) !== String(row.merchant_id)
    ) {
      return [];
    }

    return [{
      id: row.id,
      product_id: String(row.product_id),
      merchant_id: String(row.merchant_id),
      merchant_name: merchant.store_name || merchant.store_slug || "Store",
      merchant_slug: merchant.store_slug || "",
      name: product.name,
      price: Number(product.price || 0),
      image: product.images,
      is_digital: Boolean(product.is_digital),
      quantity: row.quantity,
      line_total: Number(product.price || 0) * row.quantity,
    }];
  });
}

export async function GET(request: NextRequest) {
  try {
    const { cartId, isNew } = getCartId(request);
    const items = await readCart(cartId);
    const response = NextResponse.json({ items });

    return isNew
      ? attachCartCookie(response, request, cartId)
      : response;
  } catch (error) {
    console.error("Shared cart GET failed:", error);
    return NextResponse.json(
      { error: "Could not load your cart." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = String(body.slug || "").trim();
    const productId = String(body.product_id || "").trim();
    const quantityToAdd = safeQuantity(body.quantity);

    if (!slug || !productId) {
      return NextResponse.json(
        { error: "Store slug and product ID are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: merchant, error: merchantError } = await admin
      .from("merchants")
      .select("id, store_slug")
      .eq("store_slug", slug)
      .maybeSingle();

    if (merchantError) throw merchantError;
    if (!merchant) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const { data: product, error: productError } = await admin
      .from("products")
      .select("id, merchant_id, is_active")
      .eq("id", productId)
      .eq("merchant_id", merchant.id)
      .maybeSingle();

    if (productError) throw productError;
    if (!product || product.is_active !== true) {
      return NextResponse.json(
        { error: "This product is unavailable." },
        { status: 404 }
      );
    }

    const { cartId, isNew } = getCartId(request);

    const { data: existing, error: existingError } = await admin
      .from("marketplace_cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("merchant_id", String(merchant.id))
      .eq("product_id", productId)
      .maybeSingle();

    if (existingError) throw existingError;

    const newQuantity = Math.min(
      MAX_QUANTITY,
      (existing?.quantity || 0) + quantityToAdd
    );

    const { error: saveError } = await admin
      .from("marketplace_cart_items")
      .upsert(
        {
          cart_id: cartId,
          merchant_id: String(merchant.id),
          product_id: productId,
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "cart_id,merchant_id,product_id" }
      );

    if (saveError) throw saveError;

    const items = await readCart(cartId);
    const response = NextResponse.json({ items });

    return isNew
      ? attachCartCookie(response, request, cartId)
      : response;
  } catch (error) {
    console.error("Shared cart POST failed:", error);
    return NextResponse.json(
      { error: "Could not add this product to your cart." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const productId = String(body.product_id || "").trim();
    const merchantId = String(body.merchant_id || "").trim();
    const quantity = Number(body.quantity);

    if (!productId || !merchantId || !Number.isFinite(quantity)) {
      return NextResponse.json(
        { error: "Product, store, and valid quantity are required." },
        { status: 400 }
      );
    }

    const { cartId, isNew } = getCartId(request);
    const admin = createAdminClient();

    if (quantity <= 0) {
      const { error } = await admin
        .from("marketplace_cart_items")
        .delete()
        .eq("cart_id", cartId)
        .eq("merchant_id", merchantId)
        .eq("product_id", productId);

      if (error) throw error;
    } else {
      const { error } = await admin
        .from("marketplace_cart_items")
        .update({
          quantity: safeQuantity(quantity),
          updated_at: new Date().toISOString(),
        })
        .eq("cart_id", cartId)
        .eq("merchant_id", merchantId)
        .eq("product_id", productId);

      if (error) throw error;
    }

    const items = await readCart(cartId);
    const response = NextResponse.json({ items });

    return isNew
      ? attachCartCookie(response, request, cartId)
      : response;
  } catch (error) {
    console.error("Shared cart PATCH failed:", error);
    return NextResponse.json(
      { error: "Could not update your cart." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const productId = String(body.product_id || "").trim();
    const merchantId = String(body.merchant_id || "").trim();

    if (!productId || !merchantId) {
      return NextResponse.json(
        { error: "Product and store are required." },
        { status: 400 }
      );
    }

    const { cartId, isNew } = getCartId(request);
    const admin = createAdminClient();

    const { error } = await admin
      .from("marketplace_cart_items")
      .delete()
      .eq("cart_id", cartId)
      .eq("merchant_id", merchantId)
      .eq("product_id", productId);

    if (error) throw error;

    const items = await readCart(cartId);
    const response = NextResponse.json({ items });

    return isNew
      ? attachCartCookie(response, request, cartId)
      : response;
  } catch (error) {
    console.error("Shared cart DELETE failed:", error);
    return NextResponse.json(
      { error: "Could not remove this product." },
      { status: 500 }
    );
  }
}
