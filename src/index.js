const mongoose = require("mongoose");
require("dotenv").config();

async function start() {
  const mongoDbUri = process.env.MONGODB_URI || "";
  await mongoose.connect(mongoDbUri);
}

start();
