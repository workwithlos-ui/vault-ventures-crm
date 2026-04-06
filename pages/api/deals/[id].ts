import { getDealById, updateDeal, deleteDeal, initDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
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
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!verifyToken(token)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.query;
    if (req.method === 'GET') {
      const deal = await getDealById(id as string) as any;
      if (!deal) return res.status(404).json({ error: 'Not found' });
      const normalized = {
        ...deal,
        propertyName: deal.companyName || deal.sellerName || `Deal #${deal.id}`,
        sellerAskingPrice: deal.askingPrice,
        sellerPhone: deal.phone,
        sellerEmail: deal.email,
        address: deal.propertyAddress,
        units: deal.nccUnits,
        buildingSqFt: deal.grossSqft,
        occupancyRate: deal.currentOccupancy,
        noi: deal.yearlyNOI,
        marketNotes: deal.callNotes,
        valueAddNotes: deal.valueAddStrategy,
      };
      return res.status(200).json(normalized);
    }
    if (req.method === 'PUT') {
      const mapped = mapDealFields(req.body);
      await updateDeal(id as string, mapped);
      return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
      await deleteDeal(id as string);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Deal error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message });
  }
}
