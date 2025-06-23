import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  githubId?: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github' | 'local';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    googleId: { 
      type: String, 
      sparse: true // Removed unique: true here
    },
    githubId: { 
      type: String, 
      sparse: true // Removed unique: true here
    },
    email: { 
      type: String, 
      required: true, 
      unique: true // Keep unique here as it's your primary identifier
    },
    name: { type: String, required: true },
    avatar: { type: String },
    provider: { 
      type: String, 
      required: true, 
      enum: ['google', 'github', 'local'] 
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Define compound indexes explicitly
// / All indexes defined explicitly
// UserSchema.index({ email: 1 }, { unique: true });
// UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
// UserSchema.index({ githubId: 1 }, { unique: true, sparse: true });

export default mongoose.model<IUser>('User', UserSchema);