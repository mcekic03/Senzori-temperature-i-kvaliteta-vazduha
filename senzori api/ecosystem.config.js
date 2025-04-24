module.exports = {
    apps: [{
      name: "SenzoriServer",
      script: "main.js",
      instances: "max",  // Pokreće onoliko instanci koliko jezgra ima procesor
      watch: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      env: {
        NODE_ENV: "production"
      }
    }]
  };
  