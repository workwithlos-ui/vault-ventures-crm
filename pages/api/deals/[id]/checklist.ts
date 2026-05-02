import { getChecklist, createChecklistItem, initChecklistForDeal, initDb } from '@/lib/db';

import type { NextApiRequest, NextApiResponse } from 'next';

const DD_CHECKLIST_TEMPLATE = [
  { category: "Agreements", tasks: ["Purchase Agreement (Executed)", "Assignment of Purchase Agreement", "Entity Formation Documents", "Operating Agreement", "Escrow Instructions", "Title Commitment Review"] },
  { category: "Financials", tasks: ["Trailing 12 Month P&L", "Year-to-Date P&L", "Prior Year P&L (2 Years)", "Current Rent Roll", "Bank Statements (12 Months)", "Tax Returns (2 Years)"] },
  { category: "Financials From Seller", tasks: ["Seller Provided T12", "Seller Provided Rent Roll", "Seller Provided Tax Bills", "Seller Provided Insurance Dec Page", "Seller Provided Utility Bills"] },
  { category: "Financial Third Party", tasks: ["Third Party Appraisal", "Environmental Phase I", "Environmental Phase II (if needed)", "Survey/ALTA"] },
  { category: "Property Condition Third Party", tasks: ["Property Condition Assessment", "Roof Inspection", "HVAC Inspection", "Pest Inspection", "ADA Compliance Review"] },
  { category: "Property Condition Repairs Needed", tasks: ["Repair Estimate from Contractor", "CapEx Budget Finalized", "Repair Timeline Established", "Contractor Agreements Signed"] },
  { category: "Property Condition", tasks: ["Unit Walk-Through Complete", "Gate/Access System Test", "Security Camera Review", "Signage Assessment", "Parking/Driveway Condition", "Landscaping Assessment"] },
  { category: "Property Info From Seller", tasks: ["Facility Map/Site Plan", "Occupancy Report (Historical)", "Tenant Insurance Program Details", "Management Software Access/Data", "Vendor Contracts List", "Employee/Payroll Information"] },
  { category: "Legal", tasks: ["Title Search Clear", "Lien Search Clear", "Zoning Verification", "Certificate of Occupancy", "Business License Transfer", "Lease/Rental Agreement Templates Review"] },
  { category: "Financing", tasks: ["Loan Application Submitted", "Loan Approval/Commitment Letter", "Appraisal Ordered", "Insurance Binder", "Proof of Funds for Down Payment", "Closing Cost Estimate Review"] },
  { category: "Moving Towards Closing", tasks: ["Final Walk-Through Scheduled", "Closing Date Confirmed", "Wire Instructions Verified", "Entity Bank Account Opened", "Property Management Transition Plan", "Utility Transfer Arranged", "Insurance Policy Bound"] },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await initDb();
const { id } = req.query as { id: string };

    if (req.method === 'GET') {
      await initChecklistForDeal(id, DD_CHECKLIST_TEMPLATE);
      const items = await getChecklist(id);
      return res.status(200).json(items);
    }
    if (req.method === 'POST') {
      const itemId = await createChecklistItem(id, req.body);
      return res.status(200).json({ id: itemId, success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Checklist error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
