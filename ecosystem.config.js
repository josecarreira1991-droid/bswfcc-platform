/**
 * PM2 Ecosystem Config — BSWFCC Platform
 *
 * Deploy on VPS 187.77.210.204:
 *   1. npm install -g pm2
 *   2. Copy .env to workers/.env (same vars as Next.js)
 *   3. pm2 start ecosystem.config.js
 *   4. pm2 save && pm2 startup
 *
 * Monitor: pm2 monit | pm2 logs
 */

module.exports = {
  apps: [
    {
      name: "market-sync",
      script: "workers/market-sync.js",
      cron_restart: "0 */6 * * *", // Every 6 hours
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "networking-scores",
      script: "workers/networking-scores.js",
      cron_restart: "0 2 * * *", // Daily at 2 AM
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "notification-worker",
      script: "workers/notification-worker.js",
      cron_restart: "0 8 * * *", // Daily at 8 AM EST
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
