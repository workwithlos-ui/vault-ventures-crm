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

export async function initDb() {
  await query(`CREATE TABLE IF NOT EXISTS deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propertyName VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    county VARCHAR(100),
    sellerName VARCHAR(255),
    sellerPhone VARCHAR(50),
    sellerEmail VARCHAR(255),
    sellerAskingPrice DECIMAL(15,2),
    stage VARCHAR(100) DEFAULT 'new_opportunity',
    leadSource VARCHAR(100),
    leadRating VARCHAR(20),
    units INT,
    yearBuilt INT,
    lotSize VARCHAR(100),
    buildingSqFt INT,
    occupancyRate DECIMAL(5,2),
    avgRent DECIMAL(10,2),
    purchasePrice DECIMAL(15,2),
    grossRevenue DECIMAL(15,2),
    noi DECIMAL(15,2),
    capRate DECIMAL(5,2),
    notes TEXT,
    valueAddNotes TEXT,
    managementSoftware VARCHAR(100),
    gateSystem VARCHAR(100),
    hasClimateControl TINYINT(1) DEFAULT 0,
    hasOutdoorParking TINYINT(1) DEFAULT 0,
    hasCoveredParking TINYINT(1) DEFAULT 0,
    hasRvBoat TINYINT(1) DEFAULT 0,
    driveways VARCHAR(100),
    managementType VARCHAR(100),
    onSiteManager TINYINT(1) DEFAULT 0,
    securityCameras TINYINT(1) DEFAULT 0,
    fencing TINYINT(1) DEFAULT 0,
    lighting TINYINT(1) DEFAULT 0,
    marketPopulation INT,
    medianHHI INT,
    competitorCount INT,
    avgMarketRate DECIMAL(10,2),
    marketNotes TEXT,
    closingDate DATE,
    finalPurchasePrice DECIMAL(15,2),
    financingStructure VARCHAR(255),
    entityTakingTitle VARCHAR(255),
    propertyManagementAssigned VARCHAR(255),
    firstMonthNOIActual DECIMAL(15,2),
    firstMonthNOIProjected DECIMAL(15,2),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

  await query(`CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    type VARCHAR(100),
    company VARCHAR(255),
    notes TEXT,
    dealId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

  await query(`CREATE TABLE IF NOT EXISTS unit_mix (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dealId INT NOT NULL,
    unitType VARCHAR(100),
    size INT,
    count INT,
    currentRate DECIMAL(10,2),
    marketRate DECIMAL(10,2),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await query(`CREATE TABLE IF NOT EXISTS checklist_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dealId INT NOT NULL,
    category VARCHAR(255),
    task VARCHAR(500),
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Not Started',
    notes TEXT,
    fileUrl VARCHAR(500),
    fileName VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
}

// Deals
export async function getDeals() {
  return query('SELECT * FROM deals ORDER BY createdAt DESC');
}

export async function getDealById(id: string | number) {
  const results = await query('SELECT * FROM deals WHERE id = ?', [id]);
  return (results as any[])[0] || null;
}

export async function createDeal(data: any) {
  const result = await query(
    `INSERT INTO deals (propertyName, address, city, state, zip, county, sellerName, sellerPhone, sellerEmail, sellerAskingPrice, stage, leadSource, leadRating, units, yearBuilt, lotSize, buildingSqFt, occupancyRate, avgRent, purchasePrice, grossRevenue, noi, capRate, notes, valueAddNotes, managementSoftware, gateSystem, hasClimateControl, hasOutdoorParking, hasCoveredParking, hasRvBoat, driveways, managementType, onSiteManager, securityCameras, fencing, lighting, marketPopulation, medianHHI, competitorCount, avgMarketRate, marketNotes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.propertyName || null, data.address || null, data.city || null, data.state || null,
      data.zip || null, data.county || null, data.sellerName || null, data.sellerPhone || null,
      data.sellerEmail || null, data.sellerAskingPrice || null, data.stage || 'new_opportunity',
      data.leadSource || null, data.leadRating || null, data.units || null, data.yearBuilt || null,
      data.lotSize || null, data.buildingSqFt || null, data.occupancyRate || null, data.avgRent || null,
      data.purchasePrice || null, data.grossRevenue || null, data.noi || null, data.capRate || null,
      data.notes || null, data.valueAddNotes || null, data.managementSoftware || null,
      data.gateSystem || null, data.hasClimateControl ? 1 : 0, data.hasOutdoorParking ? 1 : 0,
      data.hasCoveredParking ? 1 : 0, data.hasRvBoat ? 1 : 0, data.driveways || null,
      data.managementType || null, data.onSiteManager ? 1 : 0, data.securityCameras ? 1 : 0,
      data.fencing ? 1 : 0, data.lighting ? 1 : 0, data.marketPopulation || null,
      data.medianHHI || null, data.competitorCount || null, data.avgMarketRate || null, data.marketNotes || null,
    ]
  );
  return (result as any).insertId;
}

export async function updateDeal(id: string | number, data: any) {
  const fields: string[] = [];
  const values: any[] = [];
  const allowed = [
    'propertyName','address','city','state','zip','county','sellerName','sellerPhone','sellerEmail',
    'sellerAskingPrice','stage','leadSource','leadRating','units','yearBuilt','lotSize','buildingSqFt',
    'occupancyRate','avgRent','purchasePrice','grossRevenue','noi','capRate','notes','valueAddNotes',
    'managementSoftware','gateSystem','hasClimateControl','hasOutdoorParking','hasCoveredParking',
    'hasRvBoat','driveways','managementType','onSiteManager','securityCameras','fencing','lighting',
    'marketPopulation','medianHHI','competitorCount','avgMarketRate','marketNotes',
    'closingDate','finalPurchasePrice','financingStructure','entityTakingTitle',
    'propertyManagementAssigned','firstMonthNOIActual','firstMonthNOIProjected'
  ];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return;
  values.push(id);
  await query(`UPDATE deals SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteDeal(id: string | number) {
  await query('DELETE FROM deals WHERE id = ?', [id]);
}

// Contacts
export async function getContacts() {
  return query('SELECT * FROM contacts ORDER BY name');
}

export async function getContactsByDeal(dealId: string | number) {
  return query('SELECT * FROM contacts WHERE dealId = ? ORDER BY name', [dealId]);
}

export async function createContact(data: any) {
  const result = await query(
    `INSERT INTO contacts (name, phone, email, type, company, notes, dealId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.phone || null, data.email || null, data.type || null, data.company || null, data.notes || null, data.dealId || null]
  );
  return (result as any).insertId;
}

export async function updateContact(id: string | number, data: any) {
  await query(
    `UPDATE contacts SET name=?, phone=?, email=?, type=?, company=?, notes=? WHERE id=?`,
    [data.name, data.phone || null, data.email || null, data.type || null, data.company || null, data.notes || null, id]
  );
}

export async function deleteContact(id: string | number) {
  await query('DELETE FROM contacts WHERE id = ?', [id]);
}

// Unit Mix
export async function getUnitMix(dealId: string | number) {
  return query('SELECT * FROM unit_mix WHERE dealId = ? ORDER BY id', [dealId]);
}

export async function saveUnitMix(dealId: string | number, rows: any[]) {
  await query('DELETE FROM unit_mix WHERE dealId = ?', [dealId]);
  for (const row of rows) {
    await query(
      `INSERT INTO unit_mix (dealId, unitType, size, count, currentRate, marketRate) VALUES (?, ?, ?, ?, ?, ?)`,
      [dealId, row.unitType, row.size || null, row.count || null, row.currentRate || null, row.marketRate || null]
    );
  }
}

// Checklist
export async function getChecklist(dealId: string | number) {
  return query('SELECT * FROM checklist_items WHERE dealId = ? ORDER BY category, id', [dealId]);
}

export async function createChecklistItem(dealId: string | number, data: any) {
  const result = await query(
    `INSERT INTO checklist_items (dealId, category, task, priority, status, notes) VALUES (?, ?, ?, ?, ?, ?)`,
    [dealId, data.category, data.task, data.priority || 'Medium', data.status || 'Not Started', data.notes || null]
  );
  return (result as any).insertId;
}

export async function updateChecklistItem(id: string | number, data: any) {
  await query(
    `UPDATE checklist_items SET status=?, priority=?, notes=?, fileUrl=?, fileName=? WHERE id=?`,
    [data.status, data.priority, data.notes || null, data.fileUrl || null, data.fileName || null, id]
  );
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
