import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: [120, 'Email cannot exceed 120 characters']
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [25, 'Phone number cannot exceed 25 characters']
    },
    subject: {
      type: String,
      trim: true,
      default: 'General Inquiry',
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Message body is required'],
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters']
    },
    status: {
      type: String,
      enum: ['UNREAD', 'READ', 'IN_PROGRESS', 'RESOLVED', 'new', 'unread', 'read', 'in_progress', 'resolved'],
      default: 'UNREAD',
      index: true
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    repliedAt: {
      type: Date,
      default: null
    },
    replyNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ email: 1, createdAt: -1 });

export const ContactMessage = mongoose.model('ContactMessage', ContactMessageSchema);
export default ContactMessage;
