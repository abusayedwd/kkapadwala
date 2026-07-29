import mongoose, { Schema } from 'mongoose';

const serviceSchema = new Schema({
  name: String,
  price: Number,
});

const categorySchema = new Schema({
  id: String,
  name: String,
  service: [serviceSchema],
});

const mainSchema = new Schema({
  id: String,
  name: String,
  description: [String],
  Categories: [categorySchema],
});

export default mongoose.model('Service', mainSchema);
