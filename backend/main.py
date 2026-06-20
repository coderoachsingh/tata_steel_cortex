import os
from dotenv import load_dotenv

# 🚨 CRITICAL: Load .env FIRST before importing LangGraph modules
load_dotenv()
from langchain_core.messages import HumanMessage, SystemMessage
from agent import cortex_graph

import pandas as pd
from uuid import uuid4
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import boto3

# Import your LangGraph agent
from langchain_core.messages import HumanMessage
from agent import cortex_graph

app = FastAPI(title="Tata Steel Cortex AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. MEMORY & DATABASE INITIALIZATION ---
print("Loading 76,000 rows into AI Memory...")
try:
    GLOBAL_DF = pd.read_csv("demand_forecasting.csv")
    GLOBAL_DF['Date'] = pd.to_datetime(GLOBAL_DF['Date']).dt.strftime('%Y-%m-%d')
    print("Memory loaded. Server is ready!")
except Exception as e:
    print(f"CRITICAL ERROR: Could not load CSV. Details: {e}")

try:
    dynamodb = boto3.resource(
        'dynamodb',
        region_name=os.getenv("AWS_REGION", "ap-south-1"), 
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )
    order_table = dynamodb.Table('TataSteelOrders')
except Exception as e:
    print(f"AWS Warning: Check your AWS credentials in .env. Details: {e}")

# --- 2. DATA MODELS ---
class AskRequest(BaseModel):
    target_date: str
    query: Optional[str] = Field(
        default="Analyze current supply chain threat telemetry and generate a structured Predictive Action Plan. Focus on isolating inventory deficits, mitigation timelines, and alternative logistics routing.",
        description="The reasoning prompt passed directly to the Cortex cognitive network."
    )

class GenerateOrdersRequest(BaseModel):
    target_date: str

class OrderItem(BaseModel):
    Store: str
    Product: str
    Inventory: int
    Demand: int
    Reorder_Qty: int

class SaveOrdersRequest(BaseModel):
    date: str
    orders: List[OrderItem]

# --- 3. CORE ENDPOINTS ---

@app.post("/api/generate_orders")
def generate_orders(request: GenerateOrdersRequest):
    print(f"\n--- SCANNING PREDICTIVE ALARMS FOR: {request.target_date} ---")
    try:
        day_data = GLOBAL_DF[GLOBAL_DF['Date'] == request.target_date]
        if day_data.empty: raise HTTPException(status_code=404, detail="No data.")
            
        orders, alarms = [], []
        for _, row in day_data.iterrows():
            inventory = int(row['Inventory Level'])
            demand = int(row['Demand'])
            store = str(row['Store ID'])
            product = str(row['Product ID'])
            epidemic = int(row['Epidemic'])
            safety_stock = int(demand * 1.5)
            
            if demand > inventory and inventory > 0:
                alarms.append({
                    "severity": "CRITICAL",
                    "message": f"🚨 VELOCITY WARNING: Store {store} is draining Product {product} at an alarming rate! Demand ({demand}) exceeds current stock ({inventory})."
                })
            elif inventory < safety_stock:
                alarms.append({
                    "severity": "WARNING",
                    "message": f"⚠️ UNDERFLOW: Store {store} Product {product} is below safety stock."
                })
            if epidemic == 1 and row['Category'] == "Groceries":
                alarms.append({
                    "severity": "CRITICAL",
                    "message": f"☣️ EPIDEMIC DETECTED: Region {row['Region']}. Expect massive panic-buying surges for Groceries."
                })
            if inventory < safety_stock:
                orders.append({
                    "Store": store, "Product": product, "Inventory": inventory,
                    "Demand": demand, "Reorder_Qty": safety_stock - inventory
                })
        return {"orders": orders, "alarms": alarms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ask")
def ask_agent(request: AskRequest):
    print(f"\n--- WAKING UP AI THREAT ANALYST: {request.target_date} ---")
    try:
        day_data = GLOBAL_DF[GLOBAL_DF['Date'] == request.target_date]
        if day_data.empty: raise HTTPException(status_code=404, detail="No data.")
        
        alarm_data = generate_orders(GenerateOrdersRequest(target_date=request.target_date))
        critical_alarms = [a["message"] for a in alarm_data["alarms"] if a["severity"] == "CRITICAL"]
        
        # 1. The strict system directive that FORCES tool usage
        system_prompt = SystemMessage(content="""
        You are Cortex, an advanced Supply Chain AI. Analyze the provided data and generate a Predictive Action Plan.
        
        CRITICAL DIRECTIVE: 
        If the data contains ANY anomalies or shortages marked as "CRITICAL" or "EPIDEMIC", you MUST autonomously execute the `send_emergency_email` tool to notify the warehouse managers BEFORE you output your final text summary. Do not ask for permission.
        """)
        
        # 2. The data payload
        user_prompt = HumanMessage(content=f"""
        Date: {request.target_date}
        
        System Alarms Triggered Today:
        {chr(10).join(critical_alarms) if critical_alarms else "No critical alarms."}
        
        Based ONLY on these alarms, write a highly urgent, professional 3-bullet action plan for the supply chain managers.
        """)
        
        print("Executing LangGraph Agent...")
        
        # 3. Fire the actual LangGraph agent instead of a raw HTTP request!
        result = cortex_graph.invoke({"messages": [system_prompt, user_prompt]})
        
        # 4. Extract the final markdown string from the agent's memory
        final_message = result["messages"][-1].content
        
        print("✅ Live AI Response Successfully Generated!")
        return {"summary": final_message}
        
    except Exception as e:
        print(f"🚨 CRITICAL AI ERROR REVEALED: {str(e)}")
        return {"summary": f"⚠️ Live AI connection offline. Displaying cached analysis."}

@app.post("/api/save_orders")
def save_orders(request: SaveOrdersRequest):
    print(f"\n--- AWS SYNC ACTIVATED FOR DATE: {request.date} ---")
    if not request.orders:
        raise HTTPException(status_code=400, detail="No orders selected for sync.")
    try:
        with order_table.batch_writer() as batch:
            for order in request.orders:
                batch.put_item(
                    Item={
                        'order_id': f"PO-{uuid4().hex[:8].upper()}",
                        'date': request.date,
                        'store_id': order.Store,
                        'product_id': order.Product,
                        'inventory_level': int(order.Inventory),
                        'projected_demand': int(order.Demand),
                        'reorder_qty': int(order.Reorder_Qty),
                        'status': 'APPROVED',
                        'created_at': str(pd.Timestamp.now())
                    }
                )
        print(f"Successfully synchronized {len(request.orders)} items to DynamoDB.")
        return {"status": "success", "message": f"Successfully synchronized {len(request.orders)} orders to AWS Cloud."}
    except Exception as e:
        print(f"DynamoDB Persistence Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)