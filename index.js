import express from "express";
import cors from "cors";
import OrderToCash from "./routes/order-to-cash/index.js";

const app = express();

app.use(cors({ origin: "*" }));

// Use the api/v1 prefix for all routes
app.use("/api/v1", OrderToCash);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
