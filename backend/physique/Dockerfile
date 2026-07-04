# Ada2Physique backend — Cloud Run / Docker
FROM python:3.11-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy only the physique package + shared db client it reuses.
COPY physique ./physique

EXPOSE 8080
CMD ["uvicorn", "physique.app:app", "--host", "0.0.0.0", "--port", "8080"]
