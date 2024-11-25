import express from "express";
import cors from "cors";
import OrderToCash from "./routes/order-to-cash/index.js";
import Payments from "./routes/payments/index.js"
import Procurement from "./routes/procurement/index.js"

const app = express();

app.use(cors({ origin: "*" }));

// Use the api/v1 prefix for all routes
app.use("/api/v1", OrderToCash);
app.use("/api/v1", Payments);
app.use("/api/v1", Procurement);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
