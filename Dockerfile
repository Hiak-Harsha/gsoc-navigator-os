# Multi-stage Docker build for GSoC Navigator OS
# Stage 1: Build Frontend SPA
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend-app
COPY frontend-app/package*.json ./
RUN npm install
COPY frontend-app/ ./
RUN npm run build

# Stage 2: Production Python Backend & Static Server
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy compiled frontend assets from Stage 1 into frontend-app/dist
COPY --from=frontend-builder /app/frontend-app/dist ./frontend-app/dist

# Expose port (Render/Railway default to PORT or 8000)
ENV PORT=8000
EXPOSE 8000

# Start server
WORKDIR /app/backend
CMD python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
