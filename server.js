const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
const inwardRoutes = require("./routes/inwardRoutes");
app.use("/api/inwards", inwardRoutes);
const legalEntityRoutes = require("./routes/legalEntityRoutes");
app.use("/api/legal-entities", legalEntityRoutes);
const customerVendorRoutes = require("./routes/customerVendorRoutes");
app.use("/api/customer-vendors",customerVendorRoutes);
const vehicleRoutes = require("./routes/vehicleRoutes");
app.use("/api/vehicles",vehicleRoutes);
const warehouseRoutes =require("./routes/warehouseRoutes");
app.use( "/api/warehouses",warehouseRoutes);
const siteRoutes = require("./routes/dpcRoutes");
app.use("/api/Dpcs", siteRoutes);
const itemRoutes = require("./routes/itemRoutes");
app.use("/api/items", itemRoutes);
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
const authRoutes = require("./routes/authRoutes");
const outwardRoutes=require("./routes/outwardRoutes");
const monthlyReportRoutes=
require("./routes/monthlyReportRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/outwards", outwardRoutes);
app.use(

"/api/monthly-report",

monthlyReportRoutes

);
app.get("/", (req, res) => {
  res.send("Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});