module.exports = {
  apps: [
    {
      name: 'church-frontend',
      cwd: '/var/www/church-management/frontend',
      script: 'node',
      args: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    },
    {
      name: 'church-backend',
      cwd: '/var/www/church-management/backend',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    }
  ],
  deploy: {
    production: {
      user: 'www-data',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/church-management.git',
      path: '/var/www/church-management',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/church-management/logs'
    }
  }
};
