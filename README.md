<div align="center">
  <img src="https://kianhuatmetal.com/blog/wp-content/uploads/2024/10/Robot-770x305.jpg" alt="Tata Steel Cortex AI" style="border-radius: 12px; margin-bottom: 20px;" />
  
  <h1>🏭 Tata Steel Cortex</h1>
  <p><strong>Autonomous Supply Chain Intelligence</strong></p>

  ![Cortex AI](https://img.shields.io/badge/AI_Engine-LangGraph_%7C_Gemini-blue?style=for-the-badge)
  ![Backend](https://img.shields.io/badge/Backend-FastAPI_%7C_Docker-green?style=for-the-badge)
  ![Frontend](https://img.shields.io/badge/Frontend-Next.js_%7C_React-black?style=for-the-badge)
  ![AWS](https://img.shields.io/badge/Cloud-AWS_ECS_%7C_Fargate-orange?style=for-the-badge)
</div>

<br/>

> **Meet Cortex.** The AI nervous system for enterprise supply chains. 
> 
> Cortex isn't just a static dashboard; it is an autonomous cognitive agent built on LangGraph and Google Gemini. It lives in the cloud, continuously monitoring global warehouse telemetry, predicting critical stock deficits before they happen, and autonomously drafting mitigation strategies. From ingesting raw vector data to pushing synchronized procurement manifests into AWS DynamoDB, Cortex represents the next generation of AI-driven logistics.

---

## 🚀 Key Features

* **Autonomous Threat Telemetry:** Scans daily supply chain data to detect velocity warnings, safety stock underflows, and epidemic panic-buying triggers.
* **Cognitive Action Plans:** Utilizes a LangGraph-powered AI agent to generate structured, actionable mitigation strategies based on real-time data anomalies.
* **Automated Procurement Manifests:** Calculates dynamic reorder quantities and generates exportable CSV manifests for warehouse fulfillment.
* **Emergency Escalation (AWS SES):** Integrates directly with Amazon Simple Email Service to physically dispatch emergency emails to regional managers when critical velocity thresholds are breached.
* **Cloud Persistence:** Seamlessly synchronizes approved procurement orders to AWS DynamoDB for permanent record-keeping.

## 🧠 Architecture & Tech Stack

### Frontend (Client-Side)
* ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) **Framework**
* ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) **Core UI Library**
* ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) **Styling Engine**
* ![AWS Amplify](https://img.shields.io/badge/AWS_Amplify-FF9900?style=for-the-badge&logo=aws-amplify&logoColor=white) **Edge Hosting**
* **Visualizations:** Recharts (Dynamic Bar Charts & Telemetry)

### Backend (Server-Side)
* ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white) **API Framework**
* ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) **Language**
* ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) **Containerization**
* ![AWS ECS](https://img.shields.io/badge/AWS_ECS_%7C_Fargate-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white) **Serverless Compute Engine**

### AI & Data Engine
* ![LangChain](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white) **Cognitive Agent Framework**
* ![Google Gemini](https://img.shields.io/badge/Gemini_Flash--Lite-4285F4?style=for-the-badge&logo=google&logoColor=white) **LLM Reasoner**
* ![HuggingFace](https://img.shields.io/badge/HuggingFace-F9AB00?style=for-the-badge&logo=huggingface&logoColor=white) **Local Embedding Models**
* ![Amazon DynamoDB](https://img.shields.io/badge/Amazon_DynamoDB-4053D6?style=for-the-badge&logo=amazon-dynamodb&logoColor=white) **Cloud NoSQL Database**
* **Vector Database:** ChromaDB (Local Document Retrieval)

---

## 🛠️ Local Setup & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/tata_steel_cortex.git](https://github.com/yourusername/tata_steel_cortex.git)
cd tata_steel_cortex