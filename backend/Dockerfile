# Ada2Physique backend — Cloud Run
FROM python:3.11-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1

COPY physique/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY physique/ ./physique/

EXPOSE 8080
CMD ["uvicorn", "physique.app:app", "--host", "0.0.0.0", "--port", "8080"]
