import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initializeAdmin } from "./data/adminSeed.js";

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await initializeAdmin();

  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
