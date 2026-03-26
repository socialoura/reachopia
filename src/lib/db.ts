import { neon } from "@neondatabase/serverless";

// Lazy-init: avoid crashing at build time when DATABASE_URL is not set
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sql: any;
function getSql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}
const sql = new Proxy(function () {} as any, {
  apply(_t, _this, args) {
    return (getSql() as any)(...args);
  },
}) as any;

// ─── Schema Initialization ───────────────────────────────

export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) UNIQUE NOT NULL,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        platform VARCHAR(50) NOT NULL,
        service VARCHAR(100) NOT NULL DEFAULT 'Followers',
        followers INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        cost DECIMAL(10, 2) DEFAULT 0,
        payment_status VARCHAR(50) DEFAULT 'completed',
        payment_intent_id VARCHAR(255),
        order_status VARCHAR(50) DEFAULT 'pending',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS pricing (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_platform ON orders(platform)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status)`;

    console.log("[DB] Database initialized successfully");
  } catch (error) {
    console.error("[DB] Initialization error:", error);
  }
}

// ─── Orders ──────────────────────────────────────────────

export interface DBOrder {
  id: number;
  order_id: string;
  username: string;
  email: string | null;
  platform: string;
  service: string;
  followers: number;
  price: number;
  amount: number;
  cost: number;
  payment_status: string;
  payment_intent_id: string | null;
  order_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  customer_total_orders?: number;
  customer_order_number?: number;
}

export async function createOrder(data: {
  orderId: string;
  username: string;
  email: string;
  platform: string;
  service: string;
  followers: number;
  price: number;
  paymentIntentId?: string;
}): Promise<{ id: number; order_id: string }> {
  const result = await sql`
    INSERT INTO orders (order_id, username, email, platform, service, followers, price, amount, payment_intent_id)
    VALUES (${data.orderId}, ${data.username}, ${data.email}, ${data.platform}, ${data.service}, ${data.followers}, ${data.price}, ${data.price}, ${data.paymentIntentId || null})
    RETURNING id, order_id
  `;
  return result[0] as { id: number; order_id: string };
}

export async function getAllOrders(): Promise<DBOrder[]> {
  const result = await sql`
    SELECT *,
      COUNT(*) OVER (PARTITION BY LOWER(COALESCE(email, username))) AS customer_total_orders,
      ROW_NUMBER() OVER (PARTITION BY LOWER(COALESCE(email, username)) ORDER BY created_at ASC) AS customer_order_number
    FROM orders
    ORDER BY created_at DESC
  `;
  return result as unknown as DBOrder[];
}

export async function getOrderStats() {
  const totalResult = await sql`SELECT COUNT(*)::int AS total FROM orders`;
  const revenueResult = await sql`SELECT COALESCE(SUM(amount), 0) AS revenue FROM orders`;
  const todayResult = await sql`
    SELECT COUNT(*)::int AS today FROM orders
    WHERE created_at >= CURRENT_DATE
  `;
  const last24hResult = await sql`
    SELECT COUNT(*)::int AS recent FROM orders
    WHERE created_at >= NOW() - INTERVAL '24 hours'
  `;
  const monthlyResult = await sql`
    SELECT
      TO_CHAR(created_at, 'YYYY-MM') AS month,
      COUNT(*)::int AS orders,
      COALESCE(SUM(amount), 0)::float AS revenue
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '12 months'
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    ORDER BY month ASC
  `;
  const platformResult = await sql`
    SELECT platform, COUNT(*)::int AS count, COALESCE(SUM(amount), 0)::float AS revenue
    FROM orders
    GROUP BY platform
  `;

  return {
    totalOrders: totalResult[0]?.total || 0,
    totalRevenue: parseFloat(revenueResult[0]?.revenue || "0"),
    todayOrders: todayResult[0]?.today || 0,
    last24h: last24hResult[0]?.recent || 0,
    monthly: monthlyResult as unknown as Array<{ month: string; orders: number; revenue: number }>,
    byPlatform: platformResult as unknown as Array<{ platform: string; count: number; revenue: number }>,
  };
}

export async function updateOrderStatus(orderId: number, status: string) {
  await sql`
    UPDATE orders SET order_status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${orderId}
  `;
}

export async function updateOrderNotes(orderId: number, notes: string) {
  await sql`
    UPDATE orders SET notes = ${notes}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${orderId}
  `;
}

export async function updateOrderCost(orderId: number, cost: number) {
  await sql`
    UPDATE orders SET cost = ${cost}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${orderId}
  `;
}

// ─── Pricing ─────────────────────────────────────────────

export interface PricingTier {
  followers: string;
  price: string;
}

export interface DownsellConfig {
  reachAmount: number;
  price: number;
  currency: string;
  ctaLabel: string;
  enabled: boolean;
}

export interface PricingData {
  instagram: PricingTier[];
  tiktok: PricingTier[];
  downsell?: DownsellConfig;
}

const DEFAULT_DOWNSELL: DownsellConfig = {
  reachAmount: 100,
  price: 1.90,
  currency: "$",
  ctaLabel: "Claim My Trial Pack",
  enabled: true,
};

const DEFAULT_PRICING: PricingData = {
  instagram: [
    { followers: "100", price: "1.90" },
    { followers: "250", price: "3.90" },
    { followers: "500", price: "5.90" },
    { followers: "1000", price: "9.90" },
    { followers: "2500", price: "19.90" },
    { followers: "5000", price: "34.90" },
    { followers: "10000", price: "59.90" },
    { followers: "25000", price: "80.00" },
  ],
  tiktok: [
    { followers: "100", price: "2.90" },
    { followers: "250", price: "5.90" },
    { followers: "500", price: "9.90" },
    { followers: "1000", price: "16.90" },
    { followers: "2500", price: "34.90" },
    { followers: "5000", price: "64.90" },
    { followers: "10000", price: "99.90" },
    { followers: "25000", price: "175.00" },
  ],
  downsell: DEFAULT_DOWNSELL,
};

export function getDefaultDownsell(): DownsellConfig {
  return DEFAULT_DOWNSELL;
}

export function getDefaultPricing(): PricingData {
  return DEFAULT_PRICING;
}

export async function getPricing(): Promise<PricingData> {
  try {
    const result = await sql`
      SELECT data FROM pricing WHERE id = 'pricing-data'
    `;
    if (result.length > 0) {
      return result[0].data as PricingData;
    }
    return DEFAULT_PRICING;
  } catch {
    return DEFAULT_PRICING;
  }
}

export async function setPricing(data: PricingData) {
  await sql`
    INSERT INTO pricing (id, data)
    VALUES ('pricing-data', ${JSON.stringify(data)}::jsonb)
    ON CONFLICT (id)
    DO UPDATE SET data = ${JSON.stringify(data)}::jsonb, updated_at = CURRENT_TIMESTAMP
  `;
}

// ─── Admin Auth ──────────────────────────────────────────

export async function getAdminByUsername(username: string) {
  const result = await sql`
    SELECT * FROM admin_users WHERE username = ${username}
  `;
  if (result.length > 0) {
    return result[0] as { id: number; username: string; password: string };
  }
  return null;
}

export function generateAdminToken(username: string): string {
  return Buffer.from(
    JSON.stringify({
      username,
      role: "admin",
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })
  ).toString("base64");
}

export function verifyAdminToken(token: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());
    return decoded.exp > Date.now() && decoded.role === "admin";
  } catch {
    return false;
  }
}

export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  return authHeader?.replace("Bearer ", "") || null;
}
