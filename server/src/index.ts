// Configuring .env variables
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import env from "./config/env";

const PORT = env.PORT;

app.get("/", (req, res) => {
  res.send("Welcome to the Blogger API!");
});

app.get("/error", (req, res) => {
  throw new Error("This is a test error!");
});

// Starting the server
app.listen(PORT, () => {
  console.log(`Blogger server is running on port ${PORT}`);
});

// Handling errors and process events
process.on("unhandledRejection", (error: unknown) => {
  if (error instanceof Error) {
    console.error("Unhandled Rejection:", error.message);
  } else {
    console.error("Unhandled Rejection:", error);
  }
  process.exit(1);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error.message);
  process.exit(1);
});
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});
process.on("exit", (code) => {
  console.log(`Process exited with code: ${code}`);
});
