# 🏭 Tata Steel Cortex: Autonomous Supply Chain Intelligence

![Cortex AI](https://img.shields.io/badge/AI_Engine-LangGraph_%7C_Gemini-blue?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-FastAPI_%7C_Docker-green?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-Next.js_%7C_React-black?style=for-the-badge)
![AWS](https://img.shields.io/badge/Cloud-AWS_ECS_%7C_Fargate-orange?style=for-the-badge)

Tata Steel Cortex is an enterprise-grade, AI-driven supply chain management dashboard. It autonomously monitors inventory telemetry, predicts stock deficits, rebalances procurement manifests, and dispatches critical alerts to regional managers using a cognitive LangGraph agent architecture.

## 🚀 Key Features

* **Autonomous Threat Telemetry:** Scans daily supply chain data to detect velocity warnings, safety stock underflows, and epidemic panic-buying triggers.
* **Cognitive Action Plans:** Utilizes a LangGraph-powered AI agent to generate structured, actionable mitigation strategies based on real-time data anomalies.
* **Automated Procurement Manifests:** Calculates dynamic reorder quantities and generates exportable CSV manifests for warehouse fulfillment.
* **Emergency Escalation (AWS SES):** Integrates directly with Amazon Simple Email Service to physically dispatch emergency emails to regional managers when critical velocity thresholds are breached.
* **Cloud Persistence:** Seamlessly synchronizes approved procurement orders to AWS DynamoDB for permanent record-keeping.

## 🧠 Architecture & Tech Stack

### Frontend (Client-Side)
* **Framework:** Next.js (React)
* **Styling:** Tailwind CSS (with JetBrains Mono & Plus Jakarta Sans)
* **Visualizations:** Recharts (Dynamic Bar Charts & Telemetry Overviews)
* **Hosting:** AWS Amplify

### Backend (Server-Side)
* **Framework:** FastAPI (Python)
* **Containerization:** Docker
* **Hosting:** AWS ECS (Elastic Container Service) with AWS Fargate (Serverless Compute)

### AI & Data Engine
* **Agent Framework:** LangGraph & LangChain
* **LLM:** Google Gemini (gemini-3.1-flash-lite)
* **Vector Database:** ChromaDB (Local embedded document retrieval via HuggingFace)
* **Cloud Database:** Amazon DynamoDB

---

## 🛠️ Local Setup & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/tata_steel_cortex.git](https://github.com/yourusername/tata_steel_cortex.git)
cd tata_steel_cortex