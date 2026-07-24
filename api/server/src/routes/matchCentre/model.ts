import mongoose, { Document, Schema } from "mongoose";

export type MatchCentreStatus = "scheduled" | "live" | "finished";
export type DrawStatus = "upcoming" | "live" | "completed";

interface IScoreMatch {
  playerOne: mongoose.Types.ObjectId;
  playerTwo: mongoose.Types.ObjectId;
  court: string;
  status: MatchCentreStatus;
  scoreOne: number[];
  scoreTwo: number[];
}

interface IMatchCentre extends Document {
  tournament: mongoose.Types.ObjectId;
  stage: string;
  status: DrawStatus;
  published: boolean;
  matches: IScoreMatch[];
}

const scoreMatchSchema = new Schema<IScoreMatch>({
  playerOne: { type: Schema.Types.ObjectId, ref: "User", required: true },
  playerTwo: { type: Schema.Types.ObjectId, ref: "User", required: true },
  court: { type: String, trim: true, default: "FT" },
  status: { type: String, enum: ["scheduled", "live", "finished"], default: "scheduled" },
  scoreOne: { type: [Number], default: [] },
  scoreTwo: { type: [Number], default: [] },
}, { _id: true });

const matchCentreSchema = new Schema<IMatchCentre>({
  tournament: { type: Schema.Types.ObjectId, ref: "Tournament", required: true, unique: true, index: true },
  stage: { type: String, trim: true, default: "Main draw" },
  status: { type: String, enum: ["upcoming", "live", "completed"], default: "upcoming" },
  published: { type: Boolean, default: false },
  matches: { type: [scoreMatchSchema], default: [] },
}, { timestamps: true });

const MatchCentre = mongoose.model<IMatchCentre>("MatchCentre", matchCentreSchema);

export default MatchCentre;
