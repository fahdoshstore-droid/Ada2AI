# Ada2AI YOLO Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Download YOLO model
RUN if [ ! -f yolov8n.pt ]; then \
    curl -L -o yolov8n.pt "https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8n.pt"; \
    fi

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5001/health || exit 1

# Run with uvicorn (production)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5001", "--workers", "2"]
