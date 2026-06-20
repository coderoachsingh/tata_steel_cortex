import os
from dotenv import load_dotenv

# Load env immediately
load_dotenv()

from langchain_community.document_loaders import CSVLoader
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

def setup_retriever():
    """Loads supply chain data and builds a searchable vector store locally."""
    
    # Pointing to the correct CSV in your root folder
    loader = CSVLoader(file_path="demand_forecasting.csv")
    
    print("Reading CSV file...")
    docs = loader.load()
    
    # PRO-TIP: Embedding 76,000 rows on a standard CPU takes about 5-10 minutes. 
    # If you want the server to boot instantly for testing, uncomment the line below 
    # to only index the first 1000 rows:
    docs = docs[:1000] 
    
    print(f"Embedding {len(docs)} documents locally. This bypasses API quotas but may take a moment...")
    
    # 🚀 FIXED: Using local CPU embeddings. 100% free, no rate limits.
    vectorstore = Chroma.from_documents(
        documents=docs, 
        embedding=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    )
    
    return vectorstore.as_retriever(search_kwargs={"k": 5})