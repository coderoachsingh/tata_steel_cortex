import os
import boto3
from langchain_core.tools import tool

@tool
def send_emergency_email(region: str, severity: str, message: str) -> str:
    """
    Sends an urgent email alert to regional warehouse managers.
    Call this tool autonomously whenever a CRITICAL epidemic or velocity warning is detected in the data.
    """
    # Using your email for both sender and recipient since it's the verified AWS SES identity
    recipient = "arman105singh@gmail.com"
    subject = f"URGENT: {severity} Supply Chain Threat Detected - {region} Region"
    
    try:
        print("\n" + "="*60)
        print("🚀 INITIATING LIVE AWS SES DISPATCH...")
        
        # Connect to native AWS SES service
        ses_client = boto3.client('ses', region_name=os.getenv("AWS_REGION", "ap-south-1"))
        
        ses_client.send_email(
            Source=recipient,
            Destination={'ToAddresses': [recipient]},
            Message={
                'Subject': {'Data': subject},
                'Body': {'Text': {'Data': message}}
            }
        )
            
        print(f"✅ SUCCESS: Live email physically dispatched via AWS SES to {recipient}")
        print("="*60 + "\n")
        
        return f"Success: Emergency notification securely dispatched via AWS SES to {recipient}."
        
    except Exception as e:
        print(f"❌ AWS SES DISPATCH FAILED: {str(e)}")
        return f"System Failure: Could not dispatch email via SES. Error: {str(e)}"