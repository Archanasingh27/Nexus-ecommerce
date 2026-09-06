import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  street: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  country: { type: String, default: 'United States' },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'delivery', 'vendor'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: addressSchema,
      default: () => ({}),
    },
    // Vendor specific fields
    vendorStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    storeName: {
      type: String,
      default: '',
      trim: true,
    },
    storeDescription: {
      type: String,
      default: '',
    },
    storeLogo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=200&auto=format&fit=crop&q=80',
    },
    storeBanner: {
      type: String,
      default: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1200&auto=format&fit=crop&q=80',
    },
    businessEmail: {
      type: String,
      default: '',
    },
    businessPhone: {
      type: String,
      default: '',
    },
    taxId: {
      type: String,
      default: '',
    },
    commissionRate: {
      type: Number,
      default: 10, // Default 10% platform commission
    },
    vendorEarnings: {
      pending: { type: Number, default: 0 },
      withdrawn: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    bankDetails: {
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      bankName: { type: String, default: '' },
      routingOrIfsc: { type: String, default: '' },
    },
    // Delivery Partner specific fields
    isAvailable: {
      type: Boolean,
      default: true,
    },
    vehicleType: {
      type: String,
      enum: ['Bike', 'Scooter', 'Bicycle', 'Van', 'Other'],
      default: 'Bike',
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    serviceCity: {
      type: String,
      default: '',
    },
    servicePincodes: [{
      type: String,
    }],
    currentLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now },
    },
    earnings: {
      today: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Match entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
