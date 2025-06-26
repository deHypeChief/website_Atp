import { Schema, model, Document } from 'mongoose';

// Base participant interface
interface IParticipant {
    userId: string;
    score?: number;
    winner?: boolean;
}

// Custom match structure
interface ICustomMatch {
    status: 'active' | 'completed';
    matchType: '1v1' | '2v2';
    participants: IParticipant[];
}

// Extending with Mongoose timestamps
interface ICustomMatchDocument extends Document, ICustomMatch {
    createdAt: Date;
    updatedAt: Date;
}

// Participant schema
const ParticipantSchema = new Schema<IParticipant>(
    {
        userId: { type: String, required: true },
        score: { type: Number },
        winner: { type: Boolean }
    },
    { _id: false } // prevent auto-generating _id for subdocs
);

// Custom match schema
const CustomMatchSchema = new Schema<ICustomMatchDocument>(
    {
        status: {
            type: String,
            enum: ['draft', 'active', 'completed'],
            required: true
        },
        matchType: {
            type: String,
            enum: ['1v1', '2v2'],
            required: true
        },
        participants: {
            type: [ParticipantSchema],
            validate: [
                (val: IParticipant[]) => val.length > 0 && val.length <= 4,
                'Participants must be between 1 and 4'
            ]
        }
    },
    {
        timestamps: true // ✅ enables createdAt and updatedAt
    }
);

// Model
const CustomMatch = model<ICustomMatchDocument>('CustomMatch', CustomMatchSchema);

export { CustomMatch, ICustomMatch, ICustomMatchDocument, IParticipant };
