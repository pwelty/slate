FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY src/ ./src/
COPY scripts/ ./scripts/

# Create directories
RUN mkdir -p /app/config /app/dist

# Make entrypoint executable
RUN chmod +x scripts/docker-entrypoint.py

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=5173
ENV HOSTNAME=0.0.0.0
ENV THEME=dark

# Expose the port
EXPOSE 5173

# Run both auto-rebuild and server
CMD ["python", "scripts/docker-entrypoint.py"]