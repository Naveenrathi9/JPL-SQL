const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./.env" });
const { sequelize } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

const requestRoutes = require("./routes/requestRoutes");
const authRoutes = require("./routes/authRoutes");
app.use("/api", requestRoutes);
app.use("/api", authRoutes);

const path = require('path');
const authMiddleware = require('./middleware/authMiddleware');

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  try {
    await sequelize.sync();
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
  }
});
