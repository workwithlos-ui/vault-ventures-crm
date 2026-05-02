import { getDeals, createDeal, initDb } from '@/lib/db';

import type { NextApiRequest, NextApiResponse } from 'next';

function mapDealFields(data: any) {
  const mapped: any = { ...data };
  if (data.propertyName && !data.sellerName) mapped.sellerName = data.propertyName;
  if (data.address && !data.propertyAddress) mapped.propertyAddress = data.address;
  if (data.sellerAskingPrice && !data.askingPrice) mapped.askingPrice = data.sellerAskingPrice;
  if (data.sellerPhone && !data.phone) mapped.phone = data.sellerPhone;
  if (data.sellerEmail && !data.email) mapped.email = data.sellerEmail;
  if (data.units && !data.nccUnits) mapped.nccUnits = data.units;
  if (data.buildingSqFt && !data.grossSqft) mapped.grossSqft = data.buildingSqFt;
  if (data.occupancyRate && !data.currentOccupancy) mapped.currentOccupancy = data.occupancyRate;
  if (data.noi && !data.yearlyNOI) mapped.yearlyNOI = data.noi;
  if (data.marketNotes && !data.callNotes) mapped.callNotes = data.marketNotes;
  if (data.valueAddNotes && !data.valueAddStrategy) mapped.valueAddStrategy = data.valueAddNotes;
  if (data.notes && !data.callNotes) mapped.callNotes = data.notes;
  const stageMap: Record<string, string> = {
    '1': 'new_opportunity', '2': 'initial_contact', '3': 'under_loi',
    '4': 'due_diligence', '5': 'under_contract', '6': 'closed',
    'new_opportunity': 'new_opportunity', 'initial_contact': 'initial_contact',
    'under_loi': 'under_loi', 'due_diligence': 'due_diligence',
    'under_contract': 'under_contract', 'closed': 'closed',
    'dead_deal': 'dead_deal', 'passed': 'passed',
  };
  if (data.stage) mapped.stage = stageMap[data.stage] || data.stage;
  return mapped;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initDb();
if (req.method === 'GET') {
      const deals = await getDeals() as any[];
      // Normalize DB fields to frontend-expected field names
      const normalized = deals.map(d => ({
        ...d,
        propertyName: d.companyName || d.sellerName || `Deal #${d.id}`,
        sellerAskingPrice: d.askingPrice,
        sellerPhone: d.phone,
        sellerEmail: d.email,
        address: d.propertyAddress,
        units: d.nccUnits,
        buildingSqFt: d.grossSqft,
        occupancyRate: d.currentOccupancy,
        noi: d.yearlyNOI,
        marketNotes: d.callNotes,
        valueAddNotes: d.valueAddStrategy,
      }));
      return res.status(200).json(normalized);
    }
    if (req.method === 'POST') {
      const mapped = mapDealFields(req.body);
      const id = await createDeal(mapped);
      return res.status(200).json({ id, success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Deals error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message });
  }
}
