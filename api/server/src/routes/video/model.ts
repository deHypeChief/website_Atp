import mongoose from "mongoose";
import { Document } from "mongoose";

interface IVideo extends Document{
    title: string;
    link: string;
    info: string;
}

const videoSchema = new mongoose.Schema<IVideo>({
  title: { type: String, required: true, unique: true },
  link: { type: String, required: true },
  info: { type: String, required: true }
})

const Video = mongoose.model<IVideo>('Video', videoSchema)

export default Video;