module.exports = {
  apps: [{
    name: "ada2ai",
    script: "dist/index.js",
    env_file: ".env",
    env: {
      "NODE_ENV": "production",
    }
  }]
};
