import mongoose, { Document, Schema } from 'mongoose';

interface INewsletterSubscriber extends Document {
  email: string;
  subscribedAt: Date;
}

const newsletterSubscriberSchema = new mongoose.Schema<INewsletterSubscriber>({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid email format',
    },
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

const NewsletterSubscriber = mongoose.model<INewsletterSubscriber>('NewsletterSubscriber', newsletterSubscriberSchema);

export default NewsletterSubscriber;
