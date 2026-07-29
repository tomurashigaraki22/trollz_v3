import { query } from "@/lib/db";

const DEFAULT_ZONES = [
  {
    name: "Lagos Mainland",
    state: "Lagos",
    cities: "Yaba, Surulere, Mainland, Ebute Metta, Gbagada",
    baseFee: 1800,
    expressFee: 3200,
    extraSellerFee: 600,
    interZoneFee: 900,
    batchDiscount: 400,
    freeThreshold: 100000,
    standardMinDays: 1,
    standardMaxDays: 3,
    expressMinDays: 0,
    expressMaxDays: 1,
  },
  {
    name: "Lagos Island",
    state: "Lagos",
    cities: "Island, Victoria Island, Ikoyi, Lekki, Ajah",
    baseFee: 2200,
    expressFee: 3800,
    extraSellerFee: 700,
    interZoneFee: 1000,
    batchDiscount: 500,
    freeThreshold: 120000,
    standardMinDays: 1,
    standardMaxDays: 3,
    expressMinDays: 0,
    expressMaxDays: 1,
  },
  {
    name: "Nationwide",
    state: "",
    cities: "Nationwide, Other",
    baseFee: 3500,
    expressFee: 6500,
    extraSellerFee: 900,
    interZoneFee: 1500,
    batchDiscount: 600,
    freeThreshold: 180000,
    standardMinDays: 3,
    standardMaxDays: 7,
    expressMinDays: 1,
    expressMaxDays: 3,
  },
];

let deliverySchemaReady = false;

async function columnExists(table, column) {
  const rows = await query(
    "SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ? LIMIT 1",
    [table, column]
  );
  return rows.length > 0;
}

export async function ensureDeliverySchema() {
  if (deliverySchemaReady) return;

  await query(
    `CREATE TABLE IF NOT EXISTS delivery_zones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      state VARCHAR(120) NULL,
      cities TEXT NULL,
      base_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
      express_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
      extra_seller_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
      inter_zone_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
      batch_discount DECIMAL(12,2) NOT NULL DEFAULT 0,
      free_delivery_threshold DECIMAL(12,2) NOT NULL DEFAULT 0,
      standard_min_days INT NOT NULL DEFAULT 1,
      standard_max_days INT NOT NULL DEFAULT 3,
      express_min_days INT NOT NULL DEFAULT 0,
      express_max_days INT NOT NULL DEFAULT 1,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );

  await query(
    `CREATE TABLE IF NOT EXISTS seller_delivery_settings (
      seller_id INT PRIMARY KEY,
      pickup_zone_id INT NULL,
      pickup_address TEXT NULL,
      handling_time_days INT NOT NULL DEFAULT 1,
      same_day_pickup TINYINT(1) NOT NULL DEFAULT 0,
      dropoff_supported TINYINT(1) NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );

  if (!(await columnExists("user_addresses", "delivery_zone_id"))) {
    await query("ALTER TABLE user_addresses ADD COLUMN delivery_zone_id INT NULL");
  }

  const [{ count }] = await query("SELECT COUNT(*) AS count FROM delivery_zones");
  if (Number(count) === 0) {
    for (const zone of DEFAULT_ZONES) {
      await saveDeliveryZone(zone);
    }
  }

  deliverySchemaReady = true;
}

export async function getDeliveryZones({ activeOnly = false } = {}) {
  await ensureDeliverySchema();
  return query(
    `SELECT * FROM delivery_zones ${activeOnly ? "WHERE is_active = 1" : ""} ORDER BY name`
  );
}

export async function saveDeliveryZone(zone) {
  await query(
    `INSERT INTO delivery_zones
      (name, state, cities, base_fee, express_fee, extra_seller_fee, inter_zone_fee,
       batch_discount, free_delivery_threshold, standard_min_days, standard_max_days,
       express_min_days, express_max_days, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [
      zone.name,
      zone.state ?? "",
      zone.cities ?? "",
      zone.baseFee ?? 0,
      zone.expressFee ?? 0,
      zone.extraSellerFee ?? 0,
      zone.interZoneFee ?? 0,
      zone.batchDiscount ?? 0,
      zone.freeThreshold ?? 0,
      zone.standardMinDays ?? 1,
      zone.standardMaxDays ?? 3,
      zone.expressMinDays ?? 0,
      zone.expressMaxDays ?? 1,
      zone.isActive === false ? 0 : 1,
    ]
  );
}

export async function updateDeliveryZone(id, zone) {
  await ensureDeliverySchema();
  await query(
    `UPDATE delivery_zones SET
      name = ?, state = ?, cities = ?, base_fee = ?, express_fee = ?,
      extra_seller_fee = ?, inter_zone_fee = ?, batch_discount = ?,
      free_delivery_threshold = ?, standard_min_days = ?, standard_max_days = ?,
      express_min_days = ?, express_max_days = ?, is_active = ?
     WHERE id = ?`,
    [
      zone.name,
      zone.state ?? "",
      zone.cities ?? "",
      zone.baseFee ?? 0,
      zone.expressFee ?? 0,
      zone.extraSellerFee ?? 0,
      zone.interZoneFee ?? 0,
      zone.batchDiscount ?? 0,
      zone.freeThreshold ?? 0,
      zone.standardMinDays ?? 1,
      zone.standardMaxDays ?? 3,
      zone.expressMinDays ?? 0,
      zone.expressMaxDays ?? 1,
      zone.isActive ? 1 : 0,
      id,
    ]
  );
}

export async function setSellerDeliverySettings(sellerId, settings) {
  await ensureDeliverySchema();
  await query(
    `INSERT INTO seller_delivery_settings
      (seller_id, pickup_zone_id, pickup_address, handling_time_days, same_day_pickup, dropoff_supported)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      pickup_zone_id = VALUES(pickup_zone_id),
      pickup_address = VALUES(pickup_address),
      handling_time_days = VALUES(handling_time_days),
      same_day_pickup = VALUES(same_day_pickup),
      dropoff_supported = VALUES(dropoff_supported)`,
    [
      sellerId,
      settings.pickupZoneId ?? null,
      settings.pickupAddress ?? "",
      settings.handlingTimeDays ?? 1,
      settings.sameDayPickup ? 1 : 0,
      settings.dropoffSupported ? 1 : 0,
    ]
  );
}

function matchesZone(zone, address) {
  const city = String(address?.city || "").toLowerCase();
  const state = String(address?.state || "").toLowerCase();
  const names = `${zone.name || ""},${zone.cities || ""},${zone.state || ""}`.toLowerCase();
  return Boolean(city && names.includes(city)) || Boolean(state && zone.state && String(zone.state).toLowerCase() === state);
}

export async function resolveDeliveryZone(address, explicitZoneId = null) {
  const zones = await getDeliveryZones({ activeOnly: true });
  if (explicitZoneId) {
    const found = zones.find((zone) => Number(zone.id) === Number(explicitZoneId));
    if (found) return found;
  }
  return zones.find((zone) => matchesZone(zone, address)) ?? zones.find((zone) => zone.name === "Nationwide") ?? zones[0];
}

async function getSellerGroups(productIds) {
  if (productIds.length === 0) return [];
  const rows = await query(
    `SELECT DISTINCT
       sp.seller_id,
       sp.storefront_product_id,
       sds.pickup_zone_id,
       COALESCE(sds.handling_time_days, 1) AS handling_time_days
     FROM seller_products sp
     LEFT JOIN seller_delivery_settings sds ON sds.seller_id = sp.seller_id
     WHERE sp.storefront_product_id IN (${productIds.map(() => "?").join(",")})`,
    productIds
  );
  const grouped = new Map();
  for (const row of rows) {
    grouped.set(row.seller_id, {
      sellerId: row.seller_id,
      pickupZoneId: row.pickup_zone_id,
      handlingTimeDays: Number(row.handling_time_days || 1),
    });
  }
  return [...grouped.values()];
}

export async function calculateDeliveryOptions({ address, deliveryZoneId, lines, subtotal }) {
  await ensureDeliverySchema();
  const zone = await resolveDeliveryZone(address, deliveryZoneId);
  if (!zone) return [];

  const productIds = [...new Set((lines ?? []).map((line) => line.productId || line.product?.id).filter(Boolean))];
  const sellers = await getSellerGroups(productIds);
  const sellerCount = Math.max(1, sellers.length || 1);
  const maxHandlingDays = Math.max(0, ...sellers.map((seller) => seller.handlingTimeDays));
  const extraSellerFee = Math.max(0, sellerCount - 1) * Number(zone.extra_seller_fee || 0);
  const interZoneCount = sellers.filter(
    (seller) => seller.pickupZoneId && Number(seller.pickupZoneId) !== Number(zone.id)
  ).length;
  const interZoneFee = interZoneCount * Number(zone.inter_zone_fee || 0);
  const qualifiesFree = Number(zone.free_delivery_threshold || 0) > 0 && Number(subtotal || 0) >= Number(zone.free_delivery_threshold);

  const standardRaw = Number(zone.base_fee || 0) + extraSellerFee + interZoneFee - Number(zone.batch_discount || 0);
  const expressRaw = Number(zone.express_fee || zone.base_fee || 0) + extraSellerFee + interZoneFee;

  return [
    {
      mode: "standard",
      label: "Standard Delivery",
      description: "Cheaper, batch-friendly delivery when orders are moving to the same area.",
      fee: qualifiesFree ? 0 : Math.max(0, standardRaw),
      zoneId: zone.id,
      zoneName: zone.name,
      sellerCount,
      minDays: maxHandlingDays + Number(zone.standard_min_days || 1),
      maxDays: maxHandlingDays + Number(zone.standard_max_days || 3),
      batchDiscount: Number(zone.batch_discount || 0),
    },
    {
      mode: "express",
      label: "Express Delivery",
      description: "Faster pickup and delivery, less batching.",
      fee: Math.max(0, expressRaw),
      zoneId: zone.id,
      zoneName: zone.name,
      sellerCount,
      minDays: maxHandlingDays + Number(zone.express_min_days || 0),
      maxDays: maxHandlingDays + Number(zone.express_max_days || 1),
      batchDiscount: 0,
    },
  ];
}
