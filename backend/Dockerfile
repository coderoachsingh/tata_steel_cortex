# 1. Start with a lightweight, official Python 3.11 image
FROM python:3.11-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy just the requirements file first (this makes future rebuilds faster)
COPY requirements.txt .

# 4. Install the dependencies (using --no-cache-dir keeps the final image size small!)
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your application code
COPY . .

# 6. Expose the port that FastAPI runs on
EXPOSE 8000

# 7. The exact command to start the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]