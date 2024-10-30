import mongoose, { ObjectId } from "mongoose";
import { Document } from "mongoose";


// Extend the Document interface for the Match model
interface IMatch extends Document {
    tournament: ObjectId; 
    user: ObjectId; 
    tourCheck: boolean;
    flutterPaymentId: string; 
    won: boolean;
    medal: "gold" | "silver" | "bronze" | "null"; 
    token: string;
}


// Define the match schema
const matchSchema = new mongoose.Schema<IMatch>({
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tourCheck: { type: Boolean, default: false },
    flutterPaymentId: { type: String, required: true },
    won: { type: Boolean, default: false},
    medal: { type: String, enum: ["gold", "silver", "bronze", "null"], default: "null" },
    token: { type: String, unique: true },
});

// Pre-save middleware to generate token
matchSchema.pre<IMatch>('save', async function(next) {
    const prefix = 'ATP-';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    // Function to generate a random token
    const generateToken = () => {
        let token = '';
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            token += characters[randomIndex];
        }
        return prefix + token;
    };

    let uniqueToken;
    let tokenExists = true;

    // Keep generating a token until a unique one is found
    while (tokenExists) {
        uniqueToken = generateToken();
        tokenExists = await this.model('Match').exists({ token: uniqueToken }) as boolean;
    }

    this.token = uniqueToken as string; // Set the generated token to the match document
    next(); // Proceed to save the match document
});

// Create the model
const Match = mongoose.model<IMatch>('Match', matchSchema);

export default Match;
