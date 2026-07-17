import mongoose from 'mongoose';

const { Schema } = mongoose;

const FaqSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const ContentSchema = new Schema(
  {
    description: {
      type: String,
      default: '',
    },
    whyChoose: {
      type: String,
      default: '',
    },
    howToDownload: {
      type: String,
      default: '',
    },
    additionalInfo: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const SeoSchema = new Schema(
  {
    metaTitle: {
      type: String,
      default: '',
    },
    metaDescription: {
      type: String,
      default: '',
    },
    keywords: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const AppSchema = new Schema({
  position: {
    type: Number,
    default: 0,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
  },
  logo: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
    default: [],
  },
  bonus: {
    type: String,
    default: '₹51',
  },
  minWithdraw: {
    type: Number,
    default: 100,
  },
  appSize: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    default: '1.0.0',
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  downloads: {
    type: String,
    required: true,
  },
  isNewApp: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  referLink: {
    type: String,
    required: true,
  },
  content: {
    type: ContentSchema,
    default: () => ({}),
  },
  faq: {
    type: [FaqSchema],
    default: [],
  },
  seo: {
    type: SeoSchema,
    default: () => ({}),
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update lastUpdated on every save (e.g. admin panel edits)
AppSchema.pre('save', function () {
  this.lastUpdated = Date.now();
});

export default mongoose.models.App || mongoose.model('App', AppSchema);
