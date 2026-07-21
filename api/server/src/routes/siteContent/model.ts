import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: "Student Member" },
  reviewContent: { type: String, required: true },
  imageUrl: { type: String, default: "" },
}, { timestamps: true });

const siteContentSchema = new mongoose.Schema({
  key: { type: String, default: "main", unique: true },
  pages: {
    homePageTitle: String, homePageAboutTitle: String, homePageAboutText: String,
    homePageAboutImg: String, homePageCoachTitle: String, homePageCoachText: String,
    homePageCoachImg: String, aboutStoryHeader: String, aboutStoryText: String,
    aboutVisionHeader: String, aboutVisionText: String, aboutMissionHeader: String,
    aboutMissionText: String, teamText: String, aboutPageImg: String,
    footerImages: [String],
  },
  links: {
    facebookLink: String, instagramLink: String, linkedinLink: String, xLink: String,
    youtubeLink: String, privacyLink: String, termsLink: String, cookieLink: String,
  },
  reviews: [reviewSchema],
  gallery: [String],
  sponsors: [String],
}, { timestamps: true });

export default mongoose.model("SiteContent", siteContentSchema);
