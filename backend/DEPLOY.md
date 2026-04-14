# Ada2AI YOLO Backend - Deployment Guide

## High Availability Architecture

```
                         ┌─────────────────────────────────────┐
                         │              Nginx                  │
                         │         Load Balancer              │
                         │    (Health Checks + Rate Limiting) │
                         └─────────────────┬─────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
              ┌──────────┐          ┌──────────┐          ┌──────────┐
              │  YOLO-1  │          │  YOLO-2  │          │  YOLO-3  │
              │ :5001    │          │ :5002    │          │ :5003    │
              └────┬─────┘          └────┬─────┘          └────┬─────┘
                   │                     │                     │
                   └─────────────────────┼─────────────────────┘
                                         │
                    ┌────────────────────┼─────────────────────┐
                    │                    │                     │
                    ▼                    ▼                     │
              ┌──────────┐          ┌──────────┐                 │
              │  Redis   │◄────────│ Celery   │                 │
              │  Queue   │          │ Worker   │                 │
              └──────────┘          └──────────┘                 │
                                                               │
                                                               ▼
                                                        ┌──────────┐
                                                        │ Supabase │
                                                        │   DB     │
                                                        └──────────┘
```

## Quick Start

### 1. Prerequisites

```bash
# Install Docker
brew install --cask docker

# Verify Docker
docker --version
docker-compose --version
```

### 2. Configure Environment

```bash
cd ~/Ada2AI/backend

# Copy environment template
cp .env.example .env

# Edit with your API keys
nano .env
```

**Required in .env:**
```bash
ANTHROPIC_API_KEY=sk-ant-...  # For Claude Vision
```

### 3. Start All Services

```bash
# Start everything (3 YOLO + Redis + Celery + Nginx)
docker-compose up -d

# Or with GPU support
CUDA_ENABLED=true docker-compose up -d
```

### 4. Verify Health

```bash
# Run health check script
./health_check.sh

# Or manual check
curl http://localhost/health
```

**Expected output:**
```json
{"status":"healthy"}
```

### 5. Test Video Analysis

```bash
# Test frame detection
curl -X POST http://localhost/detect/frame \
  -F "file=@test_frame.jpg"

# Test video analysis (requires video file)
curl -X POST http://localhost/analyze/single \
  -F "file=@your_video.mp4"
```

## Service Endpoints

| Service | Port | Purpose |
|---------|------|---------|
| Load Balancer | 80 | Main entry point |
| YOLO-1 | 5001 | Direct access (dev) |
| YOLO-2 | 5002 | Direct access (dev) |
| YOLO-3 | 5003 | Direct access (dev) |
| Redis | 6379 | Queue backend |
| Redis Commander | 8081 | Queue monitoring (dev only) |

## API Documentation

Once running, visit:
- Swagger UI: http://localhost/docs
- ReDoc: http://localhost/redoc

## Scaling

### Add More YOLO Instances

Edit `docker-compose.yml` and add more services:

```yaml
yolo-4:
  # ... same config as yolo-1
  ports:
    - "5004:5001"
```

Then update `nginx.conf` upstream:

```nginx
upstream yolo_backend {
    least_conn;
    server yolo-1:5001 weight=5;
    server yolo-2:5001 weight=5;
    server yolo-3:5001 weight=5;
    server yolo-4:5001 weight=5;  # Add this
}
```

### GPU Support

```bash
# Check GPU availability
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi

# Start with GPU
docker-compose up -d
```

## Monitoring

### Redis Queue Monitoring

```bash
# Start Redis Commander (UI for Redis)
docker-compose --profile dev up -d redis-commander

# Access at http://localhost:8081
# User: admin
# Password: admin123 (change in .env)
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f yolo-1

# Nginx
docker-compose logs -f nginx
```

## Troubleshooting

### YOLO container won't start

```bash
# Check logs
docker-compose logs yolo-1

# Common issue: Port already in use
docker ps | grep 5001
```

### Out of memory

```bash
# Check memory usage
docker stats

# Reduce YOLO instances to 2
docker-compose up -d --scale yolo-3=0
```

### Redis connection failed

```bash
# Restart Redis
docker-compose restart redis

# Check Redis health
docker exec ada2ai-redis redis-cli ping
```

## Production Deployment

### Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/ada2ai-yolo

# Deploy to Cloud Run
gcloud run deploy ada2ai-yolo \
  --image gcr.io/PROJECT_ID/ada2ai-yolo \
  --port 5001 \
  --min-instances 3 \
  --max-instances 10 \
  --concurrency 80
```

### AWS ECS

```bash
# Build and push to ECR
aws ecr create-repository --repository-name ada2ai-yolo

# Use ECS Task Definition (see aws-task.json)
aws ecs register-task-definition --cli-input-json file://aws-task.json
```

## Backup & Recovery

### Redis Data

```bash
# Backup
docker exec ada2ai-redis redis-cli BGSAVE
docker cp ada2ai-redis:/data/dump.rdb ./backup/

# Restore
docker cp ./backup/dump.rdb ada2ai-redis:/data/
docker exec ada2ai-redis redis-cli DEBUG RESTORE
```

## Security

### Firewall

```bash
# Only allow ports 80, 443 from internet
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 5001/tcp  # Block direct YOLO access
```

### SSL (Let's Encrypt)

```bash
# Get SSL certificate
certbot --nginx -d api.ada2ai.com

# Auto-renewal
crontab -e
# Add: 0 0 * * * certbot renew
```

## Performance Tuning

### Nginx Worker Connections

```nginx
# In nginx.conf
worker_connections 4096;
worker_rlimit_nofile 65535;
```

### YOLO Model

```python
# Use larger model for better accuracy (slower)
yolo = YOLO("yolov8m.pt")  # medium
yolo = YOLO("yolov8l.pt")  # large
```

## Support

For issues, check:
1. `docker-compose logs`
2. `docker-compose ps`
3. `health_check.sh`
