import mongoose from 'mongoose';

const advertisementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Ad title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    tag: {
      type: String,
      default: '⚡ EXCLUSIVE OFFER',
      trim: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'simple'],
      default: 'image',
    },
    placement: {
      type: String,
      enum: ['category_feed', 'promo_banner', 'hero_slide', 'global_bar'],
      default: 'category_feed',
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    posterUrl: {
      type: String,
      default: '',
    },
    layout: {
      type: String,
      enum: ['split-media', 'backdrop-glass', 'simple-card'],
      default: 'split-media',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    categorySlug: {
      type: String,
      default: '',
    },
    badgeText: {
      type: String,
      default: '',
    },
    perk: {
      type: String,
      default: '',
    },
    couponCode: {
      type: String,
      default: '',
    },
    perks: {
      type: [String],
      default: [],
    },
    highlightBadge: {
      label: { type: String, default: '' },
      value: { type: String, default: '' },
    },
    buttonText: {
      type: String,
      default: 'Explore Offer',
    },
    link: {
      type: String,
      default: '/shop',
    },
    bgGradient: {
      type: String,
      default: 'bg-gradient-to-r from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]',
    },
    borderColor: {
      type: String,
      default: 'border-emerald-200',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Advertisement = mongoose.model('Advertisement', advertisementSchema);
export default Advertisement;
