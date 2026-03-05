module.exports = {
  apps: [
    {
      name: "healthcare-backend",
      cwd: __dirname,
      script: "npm",
      args: "run start --workspace backend",
      env: {
        NODE_ENV: "production",
        PORT: "5000"
      }
    },
    {
      name: "healthcare-frontend",
      cwd: __dirname,
      script: "npm",
      args: "run start --workspace frontend -- -p 3001",
      env: {
        NODE_ENV: "production",
        PORT: "3001"
      }
    }
  ]
};
