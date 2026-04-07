#!/usr/bin/env python3
"""Seed 3 realistic demo deals + contacts via the live API.
All values match actual TiDB column types exactly."""
import urllib.request, json, urllib.error

BASE = "https://vault-ventures-crm.vercel.app"

def api(method, path, data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(f"{BASE}{path}", data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

# Login
status, resp = api("POST", "/api/auth/login", {"password": "vaultventures2024"})
token = resp["token"]
print(f"Logged in: {status}")

# Clean existing
status, deals = api("GET", "/api/deals", token=token)
if isinstance(deals, list):
    for d in deals:
        api("DELETE", f"/api/deals/{d['id']}", token=token)
    print(f"Cleaned {len(deals)} existing deals")

status, contacts = api("GET", "/api/contacts", token=token)
if isinstance(contacts, list):
    for c in contacts:
        api("DELETE", f"/api/contacts/{c['id']}", token=token)
    print(f"Cleaned {len(contacts)} existing contacts")

# ============ DEAL 1: STRONG / ATTRACTIVE ============
# parcelSize=decimal, ageOfRoof/ageOfAC=int, roomForExpansion/electronicGate/fenced/etc=varchar(10-20)
# floodZone=varchar(10), sellerFinancing=varchar(20)
deal1 = {
    "sellerName": "Robert Chen",
    "companyName": "Magnolia Self Storage",
    "phone": "832-555-0147",
    "email": "rchen@magnoliastorage.com",
    "website": "magnoliastorage.com",
    "leadSource": "Broker Referral",
    "leadRating": "Hot",
    "propertyAddress": "4521 FM 1960 West",
    "city": "Houston",
    "state": "TX",
    "zip": "77069",
    "numberOfBuildings": 6,
    "yearBuilt": 2008,
    "grossSqft": 62000,
    "netRentableSqft": 58500,
    "nccUnits": 420,
    "climateControlUnits": 180,
    "uncoveredParking": 0,
    "coveredParking": 0,
    "parcelSize": 4.2,
    "roomForExpansion": "Yes",
    "electronicGate": "Yes",
    "gateSystem": "PTI Storlogix",
    "fenced": "Yes",
    "roadSignage": "Yes",
    "fullyLit": "Yes",
    "drivewayType": "Concrete",
    "securityCameras": "Yes",
    "utilities": "City water/sewer, electric",
    "floodZone": "Zone X",
    "uhaulRentals": "Yes",
    "tenantInsurance": "Yes",
    "sellsMerchandise": "Yes",
    "ageOfRoof": 8,
    "ageOfAC": 5,
    "whoManaging": "Owner-operator",
    "managementSoftware": "SiteLink",
    "currentOccupancy": 91,
    "whySelling": "Retirement - owner is 68, wants to travel. Well-maintained property.",
    "monthlyGrossIncome": 52800,
    "financialOccupancy": 87,
    "yearlyTaxes": 38500,
    "yearlyInsurance": 18200,
    "payroll": 62000,
    "yearlyNOI": 385000,
    "askingPrice": 4850000,
    "sellerFinancing": "Yes",
    "hasRentRoll": 1,
    "hasPL": 1,
    "hasOccupancyReport": 1,
    "hasFacilityMap": 1,
    "population1mi": 18500,
    "population3mi": 85000,
    "population5mi": 210000,
    "ssFacilities1mi": 2,
    "ssFacilities3mi": 7,
    "ssFacilities5mi": 14,
    "avgRentCC": 145,
    "avgRentNCC": 85,
    "medianHHIncome1mi": 78000,
    "medianHHIncome3mi": 72000,
    "medianHHIncome5mi": 68000,
    "valueAddStrategy": "Raise NCC rents $10-15/unit (below market), add boat/RV parking on 1.5 acre expansion land, implement dynamic pricing via SiteLink, add truck rentals",
    "callNotes": "Seller very motivated - retiring at 68. Property well-maintained, 6 buildings in good condition. Strong cash flow at $385K NOI. Rents 10-15% below market on NCC units. 1.5 acres undeveloped land is major upside for RV/boat parking. Broker says seller will accept $4.5M with seller carry. All financials provided. Phase 1 ESA clean.",
    "uwCapRateLow": 6.5,
    "uwCapRateMid": 7.0,
    "uwCapRateHigh": 7.5,
    "uwEconomicOccupancy": 88,
    "uwExpenseRatio": 38,
    "stage": "due_diligence",
    "stageOrder": 1,
}
s, r = api("POST", "/api/deals", deal1, token=token)
deal1_id = r.get("id")
print(f"Deal 1 (Magnolia - Strong): id={deal1_id}, status={s}")
if s != 200:
    print(f"  ERROR: {r}")

# ============ DEAL 2: BORDERLINE / NEGOTIATION ============
deal2 = {
    "sellerName": "Patricia Williams",
    "companyName": "Sunbelt Storage Solutions",
    "phone": "214-555-0283",
    "email": "pwilliams@sunbeltstorage.net",
    "leadSource": "Cold Call",
    "leadRating": "Warm",
    "propertyAddress": "8900 N Central Expy",
    "city": "Dallas",
    "state": "TX",
    "zip": "75231",
    "numberOfBuildings": 4,
    "yearBuilt": 1998,
    "grossSqft": 38000,
    "netRentableSqft": 34500,
    "nccUnits": 260,
    "climateControlUnits": 60,
    "uncoveredParking": 0,
    "coveredParking": 0,
    "parcelSize": 2.1,
    "roomForExpansion": "No",
    "electronicGate": "Yes",
    "gateSystem": "OpenTech",
    "fenced": "Yes",
    "roadSignage": "Yes",
    "fullyLit": "Partial",
    "drivewayType": "Asphalt",
    "securityCameras": "Partial",
    "utilities": "City water/sewer, electric",
    "floodZone": "Zone AE",
    "uhaulRentals": "No",
    "tenantInsurance": "No",
    "sellsMerchandise": "No",
    "ageOfRoof": 18,
    "ageOfAC": 12,
    "whoManaging": "Third-party",
    "managementSoftware": "Easy Storage",
    "currentOccupancy": 74,
    "whySelling": "Partnership dissolution - one partner wants out",
    "monthlyGrossIncome": 28500,
    "financialOccupancy": 71,
    "yearlyTaxes": 32000,
    "yearlyInsurance": 22000,
    "payroll": 48000,
    "yearlyNOI": 168000,
    "askingPrice": 3200000,
    "sellerFinancing": "No",
    "hasRentRoll": 1,
    "hasPL": 0,
    "hasOccupancyReport": 1,
    "hasFacilityMap": 0,
    "population1mi": 22000,
    "population3mi": 95000,
    "population5mi": 280000,
    "ssFacilities1mi": 5,
    "ssFacilities3mi": 12,
    "ssFacilities5mi": 22,
    "avgRentCC": 155,
    "avgRentNCC": 95,
    "medianHHIncome1mi": 62000,
    "medianHHIncome3mi": 58000,
    "medianHHIncome5mi": 55000,
    "valueAddStrategy": "Improve occupancy from 74% to 88%+, add tenant insurance and U-Haul, fix deferred maintenance, rebrand with LED signage, implement dynamic pricing",
    "callNotes": "Seller overpricing at $3.2M given 74% occupancy and deferred maintenance. Roof replacement ~$120K needed within 3-5 years. Flood zone AE increases insurance costs. Good Dallas location but needs significant capex. No P&L provided yet. Counter at $2.4M max. Missing facility map.",
    "uwCapRateLow": 7.0,
    "uwCapRateMid": 7.5,
    "uwCapRateHigh": 8.0,
    "uwEconomicOccupancy": 72,
    "uwExpenseRatio": 45,
    "stage": "under_loi",
    "stageOrder": 1,
}
s, r = api("POST", "/api/deals", deal2, token=token)
deal2_id = r.get("id")
print(f"Deal 2 (Sunbelt - Borderline): id={deal2_id}, status={s}")
if s != 200:
    print(f"  ERROR: {r}")

# ============ DEAL 3: WEAK / RISKY / STALE ============
deal3 = {
    "sellerName": "James Hartley",
    "companyName": "Hartley Mini Storage",
    "phone": "903-555-0419",
    "email": "jhartley@hartleystorage.com",
    "leadSource": "LoopNet",
    "leadRating": "Cold",
    "propertyAddress": "12200 County Rd 4110",
    "city": "Tyler",
    "state": "TX",
    "zip": "75704",
    "numberOfBuildings": 3,
    "yearBuilt": 1985,
    "grossSqft": 22000,
    "netRentableSqft": 19800,
    "nccUnits": 150,
    "climateControlUnits": 0,
    "uncoveredParking": 0,
    "coveredParking": 0,
    "parcelSize": 3.0,
    "roomForExpansion": "Unclear",
    "electronicGate": "No",
    "fenced": "Partial",
    "roadSignage": "No",
    "fullyLit": "No",
    "drivewayType": "Gravel",
    "securityCameras": "No",
    "utilities": "Well water, septic, electric",
    "floodZone": "Zone A",
    "uhaulRentals": "No",
    "tenantInsurance": "No",
    "sellsMerchandise": "No",
    "ageOfRoof": 25,
    "ageOfAC": 0,
    "whoManaging": "Owner part-time",
    "managementSoftware": "Paper/Excel",
    "currentOccupancy": 58,
    "whySelling": "Health issues, cannot maintain property",
    "monthlyGrossIncome": 9800,
    "financialOccupancy": 52,
    "yearlyTaxes": 8500,
    "yearlyInsurance": 14000,
    "payroll": 0,
    "yearlyNOI": 62000,
    "askingPrice": 1800000,
    "sellerFinancing": "Yes",
    "hasRentRoll": 0,
    "hasPL": 0,
    "hasOccupancyReport": 0,
    "hasFacilityMap": 0,
    "population1mi": 3200,
    "population3mi": 12000,
    "population5mi": 28000,
    "ssFacilities1mi": 1,
    "ssFacilities3mi": 3,
    "ssFacilities5mi": 6,
    "avgRentCC": 0,
    "avgRentNCC": 55,
    "medianHHIncome1mi": 42000,
    "medianHHIncome3mi": 38000,
    "medianHHIncome5mi": 36000,
    "callNotes": "Seller unrealistic on price at $1.8M. Property in poor condition - roof leaking in Building C, gravel driveways, no security. No financial records available. Rural location with limited demand (pop 3,200 in 1mi). Flood zone A is dealbreaker for most lenders. Would need to pass unless price drops to $500K range. Last contact was 6 weeks ago - seller stopped returning calls.",
    "uwCapRateLow": 8.0,
    "uwCapRateMid": 9.0,
    "uwCapRateHigh": 10.0,
    "uwEconomicOccupancy": 55,
    "uwExpenseRatio": 50,
    "stage": "initial_contact",
    "stageOrder": 1,
}
s, r = api("POST", "/api/deals", deal3, token=token)
deal3_id = r.get("id")
print(f"Deal 3 (Hartley - Weak/Stale): id={deal3_id}, status={s}")
if s != 200:
    print(f"  ERROR: {r}")

# ============ SEED CONTACTS ============
contacts_data = [
    {"name": "Robert Chen", "phone": "832-555-0147", "email": "rchen@magnoliastorage.com", "company": "Magnolia Self Storage", "title": "Owner/Operator"},
    {"name": "Patricia Williams", "phone": "214-555-0283", "email": "pwilliams@sunbeltstorage.net", "company": "Sunbelt Storage Solutions", "title": "Managing Partner"},
    {"name": "James Hartley", "phone": "903-555-0419", "email": "jhartley@hartleystorage.com", "company": "Hartley Mini Storage", "title": "Owner"},
    {"name": "David Park", "phone": "713-555-0892", "email": "dpark@storagecapital.com", "company": "Storage Capital Advisors", "title": "Senior Broker"},
    {"name": "Maria Santos", "phone": "512-555-0634", "email": "msantos@texascommbank.com", "company": "Texas Commercial Bank", "title": "VP Commercial Lending"},
]
for c in contacts_data:
    s, r = api("POST", "/api/contacts", c, token=token)
    print(f"  Contact '{c['name']}': id={r.get('id')}, status={s}")

# ============ SEED UNIT MIX for Deal 1 (Magnolia) ============
if deal1_id:
    unit_mix = [
        {"unitType": "5x5 NCC", "unitCount": 40, "width": 5, "depth": 5, "area": 25, "currentRent": 45, "marketRent": 55, "occupied": 38, "vacant": 2},
        {"unitType": "5x10 NCC", "unitCount": 80, "width": 5, "depth": 10, "area": 50, "currentRent": 65, "marketRent": 80, "occupied": 74, "vacant": 6},
        {"unitType": "10x10 NCC", "unitCount": 100, "width": 10, "depth": 10, "area": 100, "currentRent": 95, "marketRent": 110, "occupied": 90, "vacant": 10},
        {"unitType": "10x15 NCC", "unitCount": 60, "width": 10, "depth": 15, "area": 150, "currentRent": 120, "marketRent": 135, "occupied": 55, "vacant": 5},
        {"unitType": "10x20 NCC", "unitCount": 40, "width": 10, "depth": 20, "area": 200, "currentRent": 145, "marketRent": 160, "occupied": 36, "vacant": 4},
        {"unitType": "10x30 NCC", "unitCount": 20, "width": 10, "depth": 30, "area": 300, "currentRent": 195, "marketRent": 210, "occupied": 18, "vacant": 2},
        {"unitType": "5x10 CC", "unitCount": 50, "width": 5, "depth": 10, "area": 50, "currentRent": 95, "marketRent": 105, "occupied": 47, "vacant": 3},
        {"unitType": "10x10 CC", "unitCount": 70, "width": 10, "depth": 10, "area": 100, "currentRent": 145, "marketRent": 155, "occupied": 64, "vacant": 6},
        {"unitType": "10x15 CC", "unitCount": 40, "width": 10, "depth": 15, "area": 150, "currentRent": 185, "marketRent": 200, "occupied": 36, "vacant": 4},
        {"unitType": "10x20 CC", "unitCount": 20, "width": 10, "depth": 20, "area": 200, "currentRent": 225, "marketRent": 245, "occupied": 18, "vacant": 2},
    ]
    for i, um in enumerate(unit_mix):
        um["sortOrder"] = i
        s, r = api("POST", f"/api/deals/{deal1_id}/unit-mix", um, token=token)
    print(f"  Seeded {len(unit_mix)} unit mix rows for Deal 1")

# ============ SEED CHECKLIST for Deal 1 ============
if deal1_id:
    s, r = api("GET", f"/api/deals/{deal1_id}/checklist", token=token)
    if isinstance(r, list) and len(r) > 0:
        items = r
        for i, item in enumerate(items):
            if i < 8:
                api("PUT", f"/api/deals/{deal1_id}/checklist/{item['id']}", {"status": "Complete"}, token=token)
            elif i < 14:
                api("PUT", f"/api/deals/{deal1_id}/checklist/{item['id']}", {"status": "In Progress"}, token=token)
            elif i < 17:
                api("PUT", f"/api/deals/{deal1_id}/checklist/{item['id']}", {"status": "Blocked", "notes": "Waiting on seller docs"}, token=token)
        print(f"  Updated {min(17, len(items))} checklist items for Deal 1")

print("\n=== SEEDING COMPLETE ===")
print(f"Deal 1 (Strong): id={deal1_id} - Magnolia Self Storage, Houston TX")
print(f"Deal 2 (Borderline): id={deal2_id} - Sunbelt Storage Solutions, Dallas TX")
print(f"Deal 3 (Weak): id={deal3_id} - Hartley Mini Storage, Tyler TX")
