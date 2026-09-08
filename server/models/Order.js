import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  vendorName: {
    type: String,
    default: 'Nexus Official',
  },
  vendorStoreName: {
    type: String,
    default: 'Nexus Direct Store',
  },
  itemStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Packed', 'Ready for Pickup', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected'],
    default: 'Pending',
  },
});

const vendorSubOrderSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  storeName: { type: String, default: '' },
  vendorPhone: { type: String, default: '' },
  vendorAddress: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Packed', 'Ready for Pickup', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected'],
    default: 'Pending',
  },
  confirmedAt: { type: Date },
  packedAt: { type: Date },
  readyForPickupAt: { type: Date },
  pickedUpAt: { type: Date },
  deliveredAt: { type: Date },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    groupOrderNumber: {
      type: String,
      default: '',
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    vendorName: {
      type: String,
      default: '',
    },
    vendorStoreName: {
      type: String,
      default: '',
    },
    vendorAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    orderItems: [orderItemSchema],
    vendors: [vendorSubOrderSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Razorpay', 'Credit/Debit Card', 'PayPal', 'Cash on Delivery', 'Apple Pay', 'Google Pay', 'UPI / NetBanking'],
      default: 'Razorpay',
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      updateTime: { type: String },
      emailAddress: { type: String },
      razorpay_order_id: { type: String },
      razorpay_payment_id: { type: String },
      razorpay_signature: { type: String },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    discountPrice: {
      type: Number,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Packed', 'Partially Ready', 'Ready for Pickup', 'Shipped', 'Assigned', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'],
      default: 'Pending',
    },
    confirmedAt: { type: Date },
    packedAt: { type: Date },
    readyForPickupAt: { type: Date },
    pickedUpAt: { type: Date },
    outForDeliveryAt: { type: Date },
    deliveredAt: {
      type: Date,
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    // Delivery Boy Tracking fields
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deliveryStatus: {
      type: String,
      enum: ['UNASSIGNED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'UNASSIGNED',
    },
    assignedAt: {
      type: Date,
    },
    rejectedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    deliveryFee: {
      type: Number,
      default: 40,
    },
    deliveryOption: {
      type: String,
      enum: ['instant', '4hour', 'nextday'],
      default: '4hour',
    },
    deliveryOptionName: {
      type: String,
      default: '4-Hour Delivery',
    },
    estimatedDeliveryTime: {
      type: String,
      default: 'Within 4 Hours',
    },
    deliveryNotes: {
      type: String,
      default: '',
    },
    deliveryOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
    otpVerifiedAt: {
      type: Date,
    },
    // Return & Refund Tracking fields
    returnRequest: {
      isRequested: { type: Boolean, default: false },
      requestedAt: { type: Date },
      reason: { type: String, default: '' },
      comments: { type: String, default: '' },
      returnType: { type: String, enum: ['Refund', 'Replacement'], default: 'Refund' },
      status: {
        type: String,
        enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'PICKED_UP', 'REFUNDED'],
        default: 'NONE',
      },
      reviewedAt: { type: Date },
      adminComments: { type: String, default: '' },
      refundAmount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
