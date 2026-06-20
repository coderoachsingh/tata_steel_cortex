import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

# 1. Force Python to read the .env file
load_dotenv() 

sender_email = os.getenv("GMAIL_ADDRESS")
sender_password = os.getenv("GMAIL_APP_PASSWORD")

print("\n--- DIAGNOSTICS ---")
print(f"Email loaded: {sender_email}")
# This will print *********** to prove the password loaded without showing it on screen
print(f"Password loaded: {'*' * len(sender_password) if sender_password else 'MISSING!'}")
print("-------------------\n")

if not sender_email or not sender_password:
    print("❌ HALTED: Cannot find credentials in .env file.")
    exit()

try:
    print("Connecting to Google SMTP...")
    msg = EmailMessage()
    msg.set_content("If you are reading this, the Python SMTP connection is working perfectly.")
    msg['Subject'] = "Cortex System Test"
    msg['From'] = sender_email
    msg['To'] = sender_email # Sending to yourself to test

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(sender_email, sender_password)
        smtp.send_message(msg)
        
    print("✅ SUCCESS! Check your inbox.")
except Exception as e:
    print(f"❌ CONNECTION FAILED: {str(e)}")