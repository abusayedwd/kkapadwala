import mongoose from 'mongoose';
import { paginate } from './plugins';

const crewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is must be Required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: false,
    },
    taskLink: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: false,
      enum: ['accepted', 'rejected', 'pending'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

crewSchema.plugin(paginate);

export default mongoose.model('Crew', crewSchema);
