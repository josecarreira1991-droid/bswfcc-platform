#!/bin/bash
set -euo pipefail

# =========================================
# BSWFCC — Supabase Self-Hosted Setup
# VPS: 187.77.210.204 (Hostinger KVM 4)
# Isolated in /opt/bswfcc-supabase/
# =========================================

PROJECT_DIR="/opt/bswfcc-supabase"
SITE_URL="https://bswfcc-platform.vercel.app"

echo ""
echo "========================================="
echo " BSWFCC — Supabase Self-Hosted Setup"
echo "========================================="
echo ""

# ─── Step 1: Prerequisites ───
echo "[1/7] Installing prerequisites..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq > /dev/null 2>&1
apt-get install -y -qq git curl jq python3 python3-pip > /dev/null 2>&1

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "  Installing Docker..."
    curl -fsSL https://get.docker.com | sh > /dev/null 2>&1
    systemctl enable --now docker
fi

# Ensure docker compose plugin is available
if ! docker compose version &> /dev/null; then
    echo "  Installing Docker Compose plugin..."
    apt-get install -y -qq docker-compose-plugin > /dev/null 2>&1
fi

echo "  Docker $(docker --version | cut -d' ' -f3) ready."

# ─── Step 2: Clone Supabase Docker ───
echo "[2/7] Setting up Supabase Docker config..."
mkdir -p $PROJECT_DIR

if [ -d "$PROJECT_DIR/docker-compose.yml" ] || [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
    echo "  Supabase config already exists, skipping clone."
else
    git clone --depth 1 https://github.com/supabase/supabase /tmp/supabase-clone 2>/dev/null
    cp -r /tmp/supabase-clone/docker/* $PROJECT_DIR/
    cp -r /tmp/supabase-clone/docker/.* $PROJECT_DIR/ 2>/dev/null || true
    rm -rf /tmp/supabase-clone
    echo "  Supabase Docker files copied."
fi

cd $PROJECT_DIR

# ─── Step 3: Generate Secrets ───
echo "[3/7] Generating cryptographic secrets..."

POSTGRES_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -hex 32)
DASHBOARD_USERNAME="bswfcc-admin"
DASHBOARD_PASSWORD=$(openssl rand -hex 16)
SECRET_KEY_BASE=$(openssl rand -hex 32)
VAULT_ENC_KEY=$(openssl rand -hex 16)
PG_META_CRYPTO_KEY=$(openssl rand -hex 16)
LOGFLARE_PUBLIC=$(openssl rand -hex 24)
LOGFLARE_PRIVATE=$(openssl rand -hex 24)
POOLER_TENANT_ID="bswfcc-$(openssl rand -hex 4)"

# Generate JWT tokens using Python
pip3 install --break-system-packages PyJWT > /dev/null 2>&1 || pip3 install PyJWT > /dev/null 2>&1

ANON_KEY=$(python3 -c "
import jwt, time
payload = {
    'role': 'anon',
    'iss': 'supabase',
    'iat': 1641769200,
    'exp': 1956297600
}
print(jwt.encode(payload, '${JWT_SECRET}', algorithm='HS256'))
")

SERVICE_ROLE_KEY=$(python3 -c "
import jwt, time
payload = {
    'role': 'service_role',
    'iss': 'supabase',
    'iat': 1641769200,
    'exp': 1956297600
}
print(jwt.encode(payload, '${JWT_SECRET}', algorithm='HS256'))
")

echo "  JWT tokens generated."

# ─── Step 4: Configure .env ───
echo "[4/7] Configuring environment..."

cp .env.example .env

# Core secrets
sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|" .env
sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
sed -i "0,/ANON_KEY=.*/s|ANON_KEY=.*|ANON_KEY=${ANON_KEY}|" .env
sed -i "0,/SERVICE_ROLE_KEY=.*/s|SERVICE_ROLE_KEY=.*|SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}|" .env

# Dashboard
sed -i "s|DASHBOARD_USERNAME=.*|DASHBOARD_USERNAME=${DASHBOARD_USERNAME}|" .env
sed -i "s|DASHBOARD_PASSWORD=.*|DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD}|" .env

# Other secrets
sed -i "s|SECRET_KEY_BASE=.*|SECRET_KEY_BASE=${SECRET_KEY_BASE}|" .env
sed -i "s|VAULT_ENC_KEY=.*|VAULT_ENC_KEY=${VAULT_ENC_KEY}|" .env
sed -i "s|PG_META_CRYPTO_KEY=.*|PG_META_CRYPTO_KEY=${PG_META_CRYPTO_KEY}|" .env
sed -i "s|LOGFLARE_PUBLIC_ACCESS_TOKEN=.*|LOGFLARE_PUBLIC_ACCESS_TOKEN=${LOGFLARE_PUBLIC}|" .env
sed -i "s|LOGFLARE_PRIVATE_ACCESS_TOKEN=.*|LOGFLARE_PRIVATE_ACCESS_TOKEN=${LOGFLARE_PRIVATE}|" .env
sed -i "s|POOLER_TENANT_ID=.*|POOLER_TENANT_ID=${POOLER_TENANT_ID}|" .env

# URLs
VPS_IP=$(hostname -I | awk '{print $1}')
sed -i "s|SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=http://${VPS_IP}:8000|" .env
sed -i "s|API_EXTERNAL_URL=.*|API_EXTERNAL_URL=http://${VPS_IP}:8000|" .env
sed -i "s|SITE_URL=.*|SITE_URL=${SITE_URL}|" .env
sed -i "s|ADDITIONAL_REDIRECT_URLS=.*|ADDITIONAL_REDIRECT_URLS=${SITE_URL}/**|" .env

# Enable email auto-confirm (no SMTP configured)
sed -i "s|ENABLE_EMAIL_AUTOCONFIRM=.*|ENABLE_EMAIL_AUTOCONFIRM=true|" .env

echo "  Environment configured."

# ─── Step 5: Start Supabase ───
echo "[5/7] Pulling Docker images (this may take 3-5 minutes)..."
docker compose pull --quiet 2>/dev/null || docker compose pull

echo "  Starting Supabase services..."
docker compose up -d

echo "  Waiting for services to initialize (60s)..."
sleep 60

# Verify core services
echo "  Checking services..."
RUNNING=$(docker compose ps --format '{{.Name}} {{.Status}}' | grep -c "running" || true)
echo "  ${RUNNING} containers running."

# ─── Step 6: Run BSWFCC Migration ───
echo "[6/7] Running BSWFCC database migration..."

# Download migration from GitHub
curl -sSL "https://raw.githubusercontent.com/josecarreira1991-droid/bswfcc-platform/main/supabase/migrations/001_initial_schema.sql" \
  -o /tmp/bswfcc_migration.sql

# Wait for Postgres to be fully ready
for i in {1..10}; do
    if docker compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
        break
    fi
    echo "  Waiting for Postgres... ($i/10)"
    sleep 5
done

# Execute migration
docker compose exec -T db psql -U postgres -d postgres < /tmp/bswfcc_migration.sql
rm /tmp/bswfcc_migration.sql

echo "  Migration complete — 5 tables, 11 directors, 22 market data records."

# ─── Step 7: Save Credentials ───
echo "[7/7] Saving credentials..."

CREDS_FILE="${PROJECT_DIR}/CREDENTIALS.txt"
cat > "${CREDS_FILE}" << CREDS
=========================================
 BSWFCC Supabase — Credentials
 Generated: $(date -u '+%Y-%m-%d %H:%M UTC')
=========================================

SUPABASE_URL=http://${VPS_IP}:8000
ANON_KEY=${ANON_KEY}
SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}

Dashboard: http://${VPS_IP}:3000
Dashboard User: ${DASHBOARD_USERNAME}
Dashboard Pass: ${DASHBOARD_PASSWORD}

PostgreSQL:
  Host: ${VPS_IP}
  Port: 5432 (via Supavisor)
  User: postgres
  Password: ${POSTGRES_PASSWORD}
  Database: postgres

JWT Secret: ${JWT_SECRET}

=========================================
 Vercel Environment Variables (copy these):
=========================================
NEXT_PUBLIC_SUPABASE_URL=http://${VPS_IP}:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
=========================================
CREDS

chmod 600 "${CREDS_FILE}"

echo ""
echo "========================================="
echo " BSWFCC Supabase — READY!"
echo "========================================="
echo ""
echo " API URL:        http://${VPS_IP}:8000"
echo " Dashboard:      http://${VPS_IP}:3000"
echo " Dashboard User: ${DASHBOARD_USERNAME}"
echo " Dashboard Pass: ${DASHBOARD_PASSWORD}"
echo ""
echo " ANON_KEY:       ${ANON_KEY}"
echo " SERVICE_KEY:    ${SERVICE_ROLE_KEY:0:40}..."
echo ""
echo " Credentials saved to: ${CREDS_FILE}"
echo "========================================="
