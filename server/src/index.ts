// Configuring .env variables
import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = process.env.PORT;

// Starting the server
app.listen(PORT, () => {
  console.log(`Blogger server is running on port ${PORT}`);
});
