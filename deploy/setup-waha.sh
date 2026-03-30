#!/bin/bash
# ============================================
# BSWFCC — Waha WhatsApp Gateway Setup
# Run on VPS 187.77.210.204
# ============================================
#
# Prerequisites:
# - Docker and Docker Compose installed
# - Supabase already running on this VPS
# - A WhatsApp Business number from BSWFCC diretoria
#
# Usage:
#   ssh root@187.77.210.204
#   bash /opt/bswfcc/deploy/setup-waha.sh
#

set -e

WAHA_DIR="/opt/waha"
WAHA_PORT=3001

echo "=== BSWFCC Waha WhatsApp Setup ==="
echo ""

# Create directory
mkdir -p "$WAHA_DIR"

# Generate API key if not exists
if [ ! -f "$WAHA_DIR/.api_key" ]; then
  API_KEY=$(openssl rand -hex 24)
  echo "$API_KEY" > "$WAHA_DIR/.api_key"
  echo "Generated API key: $API_KEY"
  echo "Save this in your .env.local as WAHA_API_KEY"
else
  API_KEY=$(cat "$WAHA_DIR/.api_key")
  echo "Using existing API key: $API_KEY"
fi

# Create docker-compose.yml
cat > "$WAHA_DIR/docker-compose.yml" <<COMPOSE
version: '3.8'

services:
  waha:
    image: devlikeapro/waha:latest
    container_name: bswfcc-waha
    restart: unless-stopped
    ports:
      - "${WAHA_PORT}:3000"
    environment:
      - WHATSAPP_API_KEY=${API_KEY}
      - WHATSAPP_DEFAULT_ENGINE=WEBJS
      - WHATSAPP_RESTART_ALL_SESSIONS=true
      - WHATSAPP_START_SESSION=bswfcc
      - WAHA_PRINT_QR=true
      - WAHA_LOG_LEVEL=info
    volumes:
      - waha-data:/app/.wwebjs_auth
      - waha-files:/tmp/whatsapp-files

volumes:
  waha-data:
  waha-files:
COMPOSE

echo ""
echo "Docker Compose created at: $WAHA_DIR/docker-compose.yml"
echo ""

# Start Waha
echo "Starting Waha container..."
cd "$WAHA_DIR"
docker compose up -d

echo ""
echo "=== Waha started on port $WAHA_PORT ==="
echo ""
echo "Next steps:"
echo "1. Check status: curl http://localhost:${WAHA_PORT}/api/sessions/bswfcc"
echo "2. Get QR code: curl http://localhost:${WAHA_PORT}/api/bswfcc/auth/qr"
echo "3. Scan QR code with the BSWFCC WhatsApp Business number"
echo ""
echo "Environment variables for .env.local:"
echo "  WAHA_API_URL=http://187.77.210.204:${WAHA_PORT}"
echo "  WAHA_API_KEY=${API_KEY}"
echo "  WAHA_SESSION_NAME=bswfcc"
echo ""
echo "Webhook URL (configure in Vercel):"
echo "  https://bswfcc.quantrexnow.io/api/webhooks/waha"
echo ""
