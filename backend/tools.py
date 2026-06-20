import os
from dotenv import load_dotenv
import os
import smtplib
from email.message import EmailMessage
# ... your existing imports like load_dotenv, etc.

# Load env immediately
load_dotenv()

from langchain_community.document_loaders import CSVLoader
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.tools import tool

def setup_retriever():
    """Loads supply chain data and builds a searchable vector store locally."""
    loader = CSVLoader(file_path="demand_forecasting.csv")
    
    print("Reading CSV file...")
    docs = loader.load()
    docs = docs[:1000] # Keeping the 1000 limit for fast boot times
    
    print(f"Embedding {len(docs)} documents locally. This bypasses API quotas but may take a moment...")
    
    vectorstore = Chroma.from_documents(
        documents=docs, 
        embedding=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    )
    
    return vectorstore.as_retriever(search_kwargs={"k": 5})

# Initialize the vector database
cortex_retriever = setup_retriever()

@tool
def search_inventory_history(query: str) -> str:
    """
    Searches the historical supply chain database for inventory context, 
    previous epidemic impacts, and demand trends.
    """
    docs = cortex_retriever.invoke(query)
    return "\n\n".join([doc.page_content for doc in docs])


@tool
def send_emergency_email(region: str, severity: str, message: str) -> str:
    """
    Sends an urgent email alert to regional warehouse managers.
    Call this tool autonomously whenever a CRITICAL epidemic or velocity warning is detected in the data.
    """
    recipient = "arman105singh@gmail.com"
    sender_email = os.getenv("GMAIL_ADDRESS")
    sender_password = os.getenv("GMAIL_APP_PASSWORD")

    # Safety check
    if not sender_email or not sender_password:
        return "Error: Email credentials missing from .env file."

    subject = f"URGENT: {severity} Supply Chain Threat Detected - {region} Region"
    
    # Construct the actual email payload
    msg = EmailMessage()
    msg.set_content(message)
    msg['Subject'] = subject
    msg['From'] = f"Cortex System AI <{sender_email}>"
    msg['To'] = recipient

    # Connect to Google's SMTP servers and fire the email
    try:
        print("\n" + "="*60)
        print("🚀 INITIATING LIVE SMTP DISPATCH...")
        
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
            
        print(f"✅ SUCCESS: Live email physically dispatched to {recipient}")
        print("="*60 + "\n")
        
        return f"Success: Emergency notification securely dispatched to {recipient}."
        
    except Exception as e:
        print(f"❌ SMTP DISPATCH FAILED: {str(e)}")
        return f"System Failure: Could not dispatch email. Error: {str(e)}"