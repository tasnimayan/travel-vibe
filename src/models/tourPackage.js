const mongoose = require('mongoose');

module.exports.packageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  occupancy: { type: Number, required: true } ,
  features: [{ type: String, required: true }],
});

