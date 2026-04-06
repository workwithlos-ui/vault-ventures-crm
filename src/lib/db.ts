import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query(sql: string, values?: any[]) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, values);
    return results;
  } finally {
    connection.release();
  }
}

export async function getDeals() {
  return query('SELECT * FROM deals ORDER BY createdAt DESC');
}

export async function getDealById(id: string) {
  const results = await query('SELECT * FROM deals WHERE id = ?', [id]);
  return (results as any[])[0];
}

export async function createDeal(data: any) {
  const result = await query(
    `INSERT INTO deals (sellerName, sellerPhone, sellerEmail, propertyName, address, city, state, zip, units, yearBuilt, occupancyRate, avgRent, purchasePrice, stage, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      data.sellerName,
      data.sellerPhone,
      data.sellerEmail,
      data.propertyName,
      data.address,
      data.city,
      data.state,
      data.zip,
      data.units,
      data.yearBuilt,
      data.occupancyRate,
      data.avgRent,
      data.purchasePrice,
      data.stage || 'New Opportunity',
    ]
  );
  return (result as any).insertId;
}

export async function updateDeal(id: string, data: any) {
  await query(
    `UPDATE deals SET sellerName=?, propertyName=?, purchasePrice=?, stage=?, updatedAt=NOW() WHERE id=?`,
    [data.sellerName, data.propertyName, data.purchasePrice, data.stage, id]
  );
}

export async function getContacts() {
  return query('SELECT * FROM contacts ORDER BY name');
}

export async function createContact(data: any) {
  const result = await query(
    `INSERT INTO contacts (name, phone, email, type, createdAt) VALUES (?, ?, ?, ?, NOW())`,
    [data.name, data.phone, data.email, data.type]
  );
  return (result as any).insertId;
}
