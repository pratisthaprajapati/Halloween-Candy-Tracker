from typing import Dict
import csv
import os

CSV_FILE = "candies.csv"

def read_inventory():
    inventory = {}
    if os.path.exists(CSV_FILE):
        with open(CSV_FILE, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                inventory[row['ID']] = {
                    'name': row['Name'],
                    'quantity': int(row['Quantity'])
                }
    return inventory

print(read_inventory())