import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const startServer = async () => {
  await prisma.$connect();
  app.listen(env.PORT, () => {
    // Keep startup logs small and actionable for local debugging.
    // eslint-disable-next-line no-console
    console.log(`Backend running at http://localhost:${env.PORT}`);
  });
};

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
