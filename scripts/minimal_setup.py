import json
from pathlib import Path

data = [
    {
        "name": "Kanya Sumangala Yojana",
        "category": "Welfare",
        "state": "Uttar Pradesh",
        "benefits": "Financial assistance of ₹15,000 to girls from birth till graduation.",
        "eligibility": "Residents of UP, family income below 3 lakhs.",
        "documents": "Birth certificate, Aadhar, Income certificate.",
        "official_link": "https://mksy.up.gov.in/",
        "language": "hi"
    },
    {
        "name": "Ayushman Bharat",
        "category": "Health",
        "state": "National",
        "benefits": "Health cover of ₹5 lakhs per family per year.",
        "eligibility": "Low-income families as per SECC data.",
        "documents": "Aadhar card, Ration card.",
        "official_link": "https://pmjay.gov.in/",
        "language": "hi"
    }
]

data_dir = Path("backend/data")
data_dir.mkdir(parents=True, exist_ok=True)

with open(data_dir / "schemes.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Created minimal schemes.json for testing.")
