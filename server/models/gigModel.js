import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const gigSchema= new mongoose.Schema(
  {
    name: { type: String },
    // what is the objective of this gig
    objective: { type: String },
    // expected budget
    budget: { type: Number },
    // expected target locations
    targetLocations: [{ type: String }],
    // gig creator
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    // what are the deliverables of this gig
    deliverables: [{
      task: { type: String },
      timeline: { type: Date },
      targetMetric: { type: String },
      status: { type: String },
      submittedOn: { type: Date },
      completedOn: { type: Date },
      additionalInfo: {},
    }],
    started: { type: Date },
    ended: { type: Date },
    details: {},
    outline: { type: String },
    story: { type: String }, 
    additionalInfo: {},
    reviews: [reviewSchema]
  },
  {
  timestamps: true,
  }
);

const Gig = mongoose.model("Gig", gigSchema);

export default Gig;
