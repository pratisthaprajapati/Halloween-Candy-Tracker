from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any
import uvicorn
import os, csv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    
)

CSV_FILE = "candies.csv"

class CandyRequest(BaseModel):
    quantities: Dict[str, int]

class InventoryUpdate(BaseModel):
    updates: Dict[str, int]

def read_inventory() -> List[Dict[str, Any]]:
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, "w", newline="") as f:
            writer = csv.writer(f); writer.writerow(["ID","Name","Quantity"])
        return []
    out = []
    with open(CSV_FILE, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                out.append({"id": int(row["ID"]), "name": row["Name"], "quantity": int(row["Quantity"])})
            except Exception:
                continue
    return out

def write_inventory(items: List[Dict[str, Any]]):
    with open(CSV_FILE, "w", newline="") as f:
        writer = csv.writer(f); writer.writerow(["ID","Name","Quantity"])
        for it in items:
            writer.writerow([it["id"], it["name"], it["quantity"]])

@app.get("/inventory")
def get_inventory():
    return read_inventory()

@app.get("/inventory/{candy_id}")
def get_candy(candy_id: int):
    inv = read_inventory()
    for it in inv:
        if it["id"] == candy_id:
            return it
    raise HTTPException(status_code=404, detail="Candy not found")

@app.patch("/inventory")
def patch_inventory(payload: InventoryUpdate):
    inv = read_inventory()
    id_map = {it["id"]: it for it in inv}
    for k, v in payload.updates.items():
        try:
            cid = int(k)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid id: {k}")
        if cid not in id_map:
            raise HTTPException(status_code=404, detail=f"ID {cid} not found")
        if v < 0:
            raise HTTPException(status_code=400, detail="Quantity must be >= 0")
        id_map[cid]["quantity"] = v
    # preserve original order
    new_list = [id_map[it["id"]] for it in inv]
    write_inventory(new_list)
    return {"updated": payload.updates}

@app.patch("/request")
def request_candies(req: CandyRequest):
    inv = read_inventory()
    name_map = {it["name"].lower(): it for it in inv}
    distributed = {}
    for name, qty in req.quantities.items():
        key = name.lower()
        if key not in name_map:
            raise HTTPException(status_code=400, detail=f"Unknown candy: {name}")
        if qty < 0:
            raise HTTPException(status_code=400, detail="Quantity must be >= 0")
        available = name_map[key]["quantity"]
        give = min(available, qty)
        name_map[key]["quantity"] = available - give
        distributed[name] = give
    write_inventory(inv)
    return {"distributed": distributed, "inventory": inv}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)