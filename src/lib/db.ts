import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function query(sql: string, values?: any[]) {
  const connection = await getPool().getConnection();
  try {
    const [results] = await connection.execute(sql, values);
    return results;
  } finally {
    connection.release();
  }
}

// No-op initDb since tables already exist in TiDB
export async function initDb() {
  // Tables already exist from Drizzle migrations
}

// ============ DEALS ============

export async function getDeals() {
  return query('SELECT * FROM deals ORDER BY createdAt DESC');
}

export async function getDealById(id: string | number) {
  const rows = await query('SELECT * FROM deals WHERE id = ?', [id]) as any[];
  return rows[0] || null;
}

export async function createDeal(data: any) {
  const result = await query(
    `INSERT INTO deals (
      userId,
      sellerName, sellerTitle, companyName, phone, email, website,
      leadSource, leadRating, propertyAddress, city, state, zip,
      numberOfBuildings, yearBuilt, grossSqft, netRentableSqft,
      nccUnits, climateControlUnits, uncoveredParking, coveredParking,
      parcelSize, roomForExpansion, electronicGate, gateSystem,
      fenced, roadSignage, fullyLit, drivewayType, securityCameras,
      utilities, floodZone, uhaulRentals, tenantInsurance, sellsMerchandise,
      ageOfRoof, ageOfAC, whoManaging, managementSoftware,
      currentOccupancy, whySelling, monthlyGrossIncome, financialOccupancy,
      yearlyTaxes, yearlyInsurance, payroll, yearlyNOI, askingPrice,
      sellerFinancing, hasRentRoll, hasPL, hasOccupancyReport, hasFacilityMap,
      population1mi, population3mi, population5mi,
      ssFacilities1mi, ssFacilities3mi, ssFacilities5mi,
      avgRentCC, avgRentNCC,
      medianHHIncome1mi, medianHHIncome3mi, medianHHIncome5mi, medianHHIncome10mi,
      valueAddStrategy, photoLink, distanceToAirport, taxParcelNumbers, callNotes,
      uwCapRateLow, uwCapRateMid, uwCapRateHigh, uwEconomicOccupancy,
      uwOtherIncome, uwExpenseRatio, uwNotes,
      stage, stageOrder
    ) VALUES (
      ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?
    )`,
    [
      data.userId || 1,
      data.sellerName || null, data.sellerTitle || null, data.companyName || null,
      data.phone || null, data.email || null, data.website || null,
      data.leadSource || null, data.leadRating || null,
      data.propertyAddress || data.address || null,
      data.city || null, data.state || null, data.zip || null,
      data.numberOfBuildings || null, data.yearBuilt || null,
      data.grossSqft || null, data.netRentableSqft || null,
      data.nccUnits || data.units || null, data.climateControlUnits || null,
      data.uncoveredParking || null, data.coveredParking || null,
      data.parcelSize || null, data.roomForExpansion || null,
      data.electronicGate || null, data.gateSystem || null,
      data.fenced || null, data.roadSignage || null,
      data.fullyLit || null, data.drivewayType || null, data.securityCameras || null,
      data.utilities || null, data.floodZone || null,
      data.uhaulRentals || null, data.tenantInsurance || null, data.sellsMerchandise || null,
      data.ageOfRoof || null, data.ageOfAC || null,
      data.whoManaging || null, data.managementSoftware || null,
      data.currentOccupancy || null, data.whySelling || null,
      data.monthlyGrossIncome || null, data.financialOccupancy || null,
      data.yearlyTaxes || null, data.yearlyInsurance || null,
      data.payroll || null, data.yearlyNOI || null,
      data.askingPrice || data.sellerAskingPrice || null,
      data.sellerFinancing || null,
      data.hasRentRoll ? 1 : 0, data.hasPL ? 1 : 0,
      data.hasOccupancyReport ? 1 : 0, data.hasFacilityMap ? 1 : 0,
      data.population1mi || null, data.population3mi || null, data.population5mi || null,
      data.ssFacilities1mi || null, data.ssFacilities3mi || null, data.ssFacilities5mi || null,
      data.avgRentCC || null, data.avgRentNCC || null,
      data.medianHHIncome1mi || null, data.medianHHIncome3mi || null,
      data.medianHHIncome5mi || null, data.medianHHIncome10mi || null,
      data.valueAddStrategy || null, data.photoLink || null,
      data.distanceToAirport || null, data.taxParcelNumbers || null, data.callNotes || null,
      data.uwCapRateLow || null, data.uwCapRateMid || null,
      data.uwCapRateHigh || null, data.uwEconomicOccupancy || null,
      data.uwOtherIncome || null, data.uwExpenseRatio || null, data.uwNotes || null,
      data.stage || 'new_opportunity', data.stageOrder || 0,
    ]
  );
  return (result as any).insertId;
}

export async function updateDeal(id: string | number, data: any) {
  const fields: string[] = [];
  const values: any[] = [];
  const allowed = [
    'sellerName', 'sellerTitle', 'companyName', 'phone', 'email', 'website',
    'leadSource', 'leadRating', 'propertyAddress', 'city', 'state', 'zip',
    'numberOfBuildings', 'yearBuilt', 'grossSqft', 'netRentableSqft',
    'nccUnits', 'climateControlUnits', 'uncoveredParking', 'coveredParking',
    'parcelSize', 'roomForExpansion', 'electronicGate', 'gateSystem',
    'fenced', 'roadSignage', 'fullyLit', 'drivewayType', 'securityCameras',
    'utilities', 'floodZone', 'uhaulRentals', 'tenantInsurance', 'sellsMerchandise',
    'ageOfRoof', 'ageOfAC', 'whoManaging', 'managementSoftware',
    'currentOccupancy', 'whySelling', 'monthlyGrossIncome', 'financialOccupancy',
    'yearlyTaxes', 'yearlyInsurance', 'payroll', 'yearlyNOI', 'askingPrice',
    'sellerFinancing', 'hasRentRoll', 'hasPL', 'hasOccupancyReport', 'hasFacilityMap',
    'population1mi', 'population3mi', 'population5mi',
    'ssFacilities1mi', 'ssFacilities3mi', 'ssFacilities5mi',
    'totalSsSqft1mi', 'totalSsSqft3mi', 'totalSsSqft5mi',
    'avgRentCC', 'avgRentNCC',
    'medianHHIncome1mi', 'medianHHIncome3mi', 'medianHHIncome5mi', 'medianHHIncome10mi',
    'avgHHIncome1mi', 'avgHHIncome3mi', 'avgHHIncome5mi', 'avgHHIncome10mi',
    'valueAddStrategy', 'photoLink', 'distanceToAirport', 'taxParcelNumbers', 'callNotes',
    'uwCapRateLow', 'uwCapRateMid', 'uwCapRateHigh', 'uwEconomicOccupancy',
    'uwOtherIncome', 'uwExpenseRatio', 'uwNotes',
    'finalPurchasePrice', 'closingDate', 'financingStructure', 'entityTakingTitle',
    'propertyManagement', 'firstMonthNOIActual', 'firstMonthNOIProjected',
    'lastAiAnalysis', 'lastAiSummary', 'aiOfferRationale',
    'stage', 'stageOrder',
  ];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (data.address !== undefined && data.propertyAddress === undefined) {
    fields.push('propertyAddress = ?');
    values.push(data.address);
  }
  if (data.units !== undefined && data.nccUnits === undefined) {
    fields.push('nccUnits = ?');
    values.push(data.units);
  }
  if (data.sellerAskingPrice !== undefined && data.askingPrice === undefined) {
    fields.push('askingPrice = ?');
    values.push(data.sellerAskingPrice);
  }
  if (fields.length === 0) return;
  values.push(id);
  await query(`UPDATE deals SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteDeal(id: string | number) {
  await query('DELETE FROM deals WHERE id = ?', [id]);
}

// ============ CONTACTS ============

export async function getContacts() {
  return query('SELECT * FROM contacts ORDER BY createdAt DESC');
}

export async function getContactById(id: string | number) {
  const rows = await query('SELECT * FROM contacts WHERE id = ?', [id]) as any[];
  return rows[0] || null;
}

export async function createContact(data: any) {
  const result = await query(
    'INSERT INTO contacts (userId, name, title, company, phone, email, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [data.userId || 1, data.name || null, data.title || null, data.company || null, data.phone || null, data.email || null, data.notes || null]
  );
  return (result as any).insertId;
}

export async function updateContact(id: string | number, data: any) {
  const fields: string[] = [];
  const values: any[] = [];
  const allowed = ['name', 'title', 'company', 'phone', 'email', 'notes'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return;
  values.push(id);
  await query(`UPDATE contacts SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteContact(id: string | number) {
  await query('DELETE FROM contacts WHERE id = ?', [id]);
}

// ============ UNIT MIX ============

export async function getUnitMix(dealId: string | number) {
  return query('SELECT * FROM unit_mix WHERE dealId = ? ORDER BY sortOrder ASC', [dealId]);
}

export async function createUnitMixItem(dealId: string | number, data: any) {
  const result = await query(
    'INSERT INTO unit_mix (dealId, unitCount, unitType, width, depth, area, currentRent, marketRent, occupied, vacant, damaged, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      dealId,
      data.unitCount || data.count || null,
      data.unitType || null,
      data.width || null,
      data.depth || null,
      data.area || data.size || null,
      data.currentRent || data.currentRate || null,
      data.marketRent || data.marketRate || null,
      data.occupied || null,
      data.vacant || null,
      data.damaged || null,
      data.sortOrder || 0,
    ]
  );
  return (result as any).insertId;
}

export async function updateUnitMixItem(id: string | number, data: any) {
  const fields: string[] = [];
  const values: any[] = [];
  const allowed = ['unitCount', 'unitType', 'width', 'depth', 'area', 'currentRent', 'marketRent', 'occupied', 'vacant', 'damaged', 'sortOrder'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return;
  values.push(id);
  await query(`UPDATE unit_mix SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteUnitMixItem(id: string | number) {
  await query('DELETE FROM unit_mix WHERE id = ?', [id]);
}

export async function saveUnitMix(dealId: string | number, rows: any[]) {
  await query('DELETE FROM unit_mix WHERE dealId = ?', [dealId]);
  for (const row of rows) {
    await createUnitMixItem(dealId, row);
  }
}

// ============ CHECKLIST ============

export async function getChecklist(dealId: string | number) {
  return query('SELECT * FROM checklist_items WHERE dealId = ? ORDER BY id ASC', [dealId]);
}

export async function createChecklistItem(dealId: string | number, data: any) {
  const result = await query(
    'INSERT INTO checklist_items (dealId, category, task, priority, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [dealId, data.category || null, data.task || null, data.priority || 'Medium', data.status || 'Not Started', data.notes || null]
  );
  return (result as any).insertId;
}

export async function updateChecklistItem(id: string | number, data: any) {
  const fields: string[] = [];
  const values: any[] = [];
  const allowed = ['category', 'task', 'priority', 'status', 'notes', 'fileUrl', 'fileName'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return;
  values.push(id);
  await query(`UPDATE checklist_items SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function initChecklistForDeal(dealId: string | number, template: { category: string; tasks: readonly string[] }[]) {
  const existing = await getChecklist(dealId) as any[];
  if (existing.length > 0) return;
  for (const cat of template) {
    for (const task of cat.tasks) {
      await createChecklistItem(dealId, { category: cat.category, task, priority: 'Medium', status: 'Not Started' });
    }
  }
}

// ============ DASHBOARD ============

export async function getDashboardStats() {
  const [totalDeals] = await query('SELECT COUNT(*) as count FROM deals') as any[];
  const [activeDeals] = await query("SELECT COUNT(*) as count FROM deals WHERE stage NOT IN ('closed', 'dead_deal', 'passed')") as any[];
  const [closedDeals] = await query("SELECT COUNT(*) as count FROM deals WHERE stage = 'closed'") as any[];
  const [totalContacts] = await query('SELECT COUNT(*) as count FROM contacts') as any[];
  const recentDealsRaw = await query('SELECT id, sellerName, companyName, city, state, askingPrice, stage, leadRating, createdAt FROM deals ORDER BY createdAt DESC LIMIT 5') as any[];
  const recentDeals = (recentDealsRaw as any[]).map(d => ({
    ...d,
    propertyName: d.companyName || d.sellerName || `Deal #${d.id}`,
    sellerAskingPrice: d.askingPrice,
  }));
  const stageBreakdown = await query('SELECT stage, COUNT(*) as count FROM deals GROUP BY stage') as any[];

  return {
    totalDeals: totalDeals.count,
    activeDeals: activeDeals.count,
    closedDeals: closedDeals.count,
    totalContacts: totalContacts.count,
    recentDeals,
    stageBreakdown,
  };
}
