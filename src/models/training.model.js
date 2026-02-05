const mongoose = require("mongoose");

const warriorSchema = new mongoose.Schema(
  {
    name: String,
    weaponName: String,
    durability: Number,
    gold: Number,
    state: { type: String, enum: ["training", "finished"] },
  },
  { _id: false },
);

const trainingSchema = new mongoose.Schema({
  epicDate: String,
  warriors: [warriorSchema],
});

const Training = mongoose.model("Training", trainingSchema);

module.exports = Training;
