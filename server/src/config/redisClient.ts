// redisClient.js
import { createClient } from "redis";
import env from "./env";

const client = createClient({
  url: env.REDIS_URL, // e.g., 'redis://username:password@host:port'
  pingInterval: 30000, // Send a ping every 30 seconds
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
});

client.on("error", (err) => console.error("Redis Client Error", err));

client
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch((err) => {
    console.error("Failed to connect to Redis due to:", err.message);
  });

export default client;
