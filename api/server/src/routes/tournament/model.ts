import mongoose from "mongoose";
import { Document } from "mongoose";

interface ITour extends Document{
    name: string;
    category: string;
    location: string;
    date: Date;
    time: string;
    tournamentImgURL: string;
    price: string;
}

const tourSchema = new mongoose.Schema<ITour>({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, default: "9:00 AM"},
  tournamentImgURL: { type: String, required: true },
  price: { type: String, required: true },
})

const Tournament = mongoose.model<ITour>('Tournament', tourSchema)

export default Tournament;
