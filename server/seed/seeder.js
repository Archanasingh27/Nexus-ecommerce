import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Advertisement from '../models/Advertisement.js';
import Coupon from '../models/Coupon.js';
import { categoriesData, usersData, getProductsData, getAdvertisementsData } from './seedData.js';
import { connectDB, disconnectDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Clearing old collections...');
    await Order.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    await Advertisement.deleteMany();
    await Coupon.deleteMany();

    console.log('[Seeder] Inserting Demo Coupons...');
    const demoCoupons = [
      {
        code: 'INDORE50',
        description: 'Get 50% discount up to ₹500 on all orders across Indore city.',
        discountType: 'percentage',
        discountValue: 50,
        minOrderAmount: 299,
        maxDiscountAmount: 500,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
        usageLimit: 1000,
        isActive: true,
      },
      {
        code: 'WELCOME100',
        description: 'Flat ₹100 OFF for new customers on orders above ₹499.',
        discountType: 'fixed',
        discountValue: 100,
        minOrderAmount: 499,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
        usageLimit: 500,
        isActive: true,
      },
      {
        code: 'NEXUS20',
        description: '20% Mega Savings on Hardware, Decor & Construction Supplies.',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 999,
        maxDiscountAmount: 1500,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
        usageLimit: 300,
        isActive: true,
      },
      {
        code: 'FLAT200',
        description: 'Instant ₹200 savings on orders above ₹1,499.',
        discountType: 'fixed',
        discountValue: 200,
        minOrderAmount: 1499,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
        usageLimit: 200,
        isActive: true,
      },
    ];
    await Coupon.insertMany(demoCoupons);

    console.log('[Seeder] Inserting Users...');
    const createdUsers = await User.create(usersData);
    const adminUser = createdUsers[0];
    const customer1 = createdUsers[1];
    const customer2 = createdUsers[2];
    const rider1 = createdUsers[3];
    const rider2 = createdUsers[4];
    const vendor1 = createdUsers[5]; // Rajesh Agrawal (Apex Hardware & Tools)
    const vendor2 = createdUsers[6]; // Sunita Kapoor (Prime Interiors & Lighting)
    const vendor3 = createdUsers[7]; // Manish Chouksey (BuildCraft Materials Co.)

    console.log('[Seeder] Inserting Categories...');
    const createdCategories = await Category.insertMany(categoriesData);

    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    console.log('[Seeder] Inserting Advertisements (Image, Video, Simple)...');
    const rawAds = getAdvertisementsData(categoryMap);
    await Advertisement.insertMany(rawAds);

    console.log('[Seeder] Inserting Products with 100% Vendor Ownership...');
    const rawProducts = getProductsData(categoryMap);

    // Distribute products cleanly among specialized authorized vendors
    const productsWithReviews = rawProducts.map((p) => {
      let assignedVendor = vendor1;

      // Category-based vendor mapping
      if (p.category.toString() === categoryMap['civil-interiors']?.toString()) {
        assignedVendor = vendor3; // BuildCraft Materials Co.
      } else if (p.category.toString() === categoryMap['furniture-architectural-hardware']?.toString()) {
        assignedVendor = vendor1; // Apex Hardware & Tools
      } else if (p.category.toString() === categoryMap['electrical']?.toString()) {
        assignedVendor = vendor2; // Prime Interiors & Lighting
      } else if (p.category.toString() === categoryMap['plumbing-sanitary-bath']?.toString()) {
        // Pipes & Tanks to BuildCraft, Luxury Sanitary to Prime Interiors or Apex
        if (p.subcategory === 'sanitary-bath-fittings') {
          assignedVendor = vendor2; // Prime Interiors
        } else {
          assignedVendor = vendor1; // Apex Hardware
        }
      }

      const reviews = [
        {
          user: customer1._id,
          userName: customer1.name,
          userAvatar: customer1.avatar,
          rating: p.rating >= 4.8 ? 5 : 4,
          comment: `Top quality ${p.name} from ${assignedVendor.storeName}. High grade construction standard and genuine warranty!`,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        },
        {
          user: customer2._id,
          userName: customer2.name,
          userAvatar: customer2.avatar,
          rating: 5,
          comment: `Delivered on site promptly by ${assignedVendor.storeName}. Packaging was intact and quality is top-notch.`,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        },
      ];

      return {
        ...p,
        vendor: assignedVendor._id,
        vendorName: assignedVendor.name,
        vendorStoreName: assignedVendor.storeName,
        approvalStatus: 'approved',
        reviews,
        numReviews: reviews.length,
      };
    });

    const createdProducts = await Product.insertMany(productsWithReviews);

    // Update item counts in categories
    for (const cat of createdCategories) {
      const count = await Product.countDocuments({ category: cat._id });
      await Category.findByIdAndUpdate(cat._id, { itemCount: count });
    }

    console.log('[Seeder] Generating realistic historical orders with multi-vendor routing...');
    const statuses = ['Delivered', 'Delivered', 'Out for Delivery', 'Picked Up', 'Ready for Pickup', 'Packed', 'Confirmed', 'Pending'];
    const dummyOrders = [];

    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const orderDate = new Date();
      orderDate.setDate(now.getDate() - (14 - i));

      const customer = i % 2 === 0 ? customer1 : customer2;
      const product1 = createdProducts[i % createdProducts.length];
      const product2 = createdProducts[(i + 3) % createdProducts.length];

      const qty1 = (i % 2) + 1;
      const qty2 = (i % 3 === 0) ? 1 : 0;
      const status = statuses[i % statuses.length];

      const items = [
        {
          product: product1._id,
          name: product1.name,
          image: product1.images[0],
          price: product1.price,
          quantity: qty1,
          vendor: product1.vendor || vendor1._id,
          vendorName: product1.vendorName || vendor1.name,
          vendorStoreName: product1.vendorStoreName || vendor1.storeName,
          itemStatus: status,
        },
      ];

      if (qty2 > 0) {
        items.push({
          product: product2._id,
          name: product2.name,
          image: product2.images[0],
          price: product2.price,
          quantity: qty2,
          vendor: product2.vendor || vendor2._id,
          vendorName: product2.vendorName || vendor2.name,
          vendorStoreName: product2.vendorStoreName || vendor2.storeName,
          itemStatus: status,
        });
      }

      const vendorsSubList = [];
      const vSet = new Set();
      items.forEach((it) => {
        if (it.vendor && !vSet.has(it.vendor.toString())) {
          vSet.add(it.vendor.toString());
          vendorsSubList.push({
            vendor: it.vendor,
            storeName: it.vendorStoreName,
            vendorPhone: '+91 98260 55443',
            vendorAddress: {
              street: 'Plot 18, Commercial Hub, Scheme 54',
              city: 'Indore',
              state: 'Madhya Pradesh',
              postalCode: '452010',
            },
            status: status === 'Delivered' ? 'Delivered' : (status === 'Out for Delivery' ? 'Picked Up' : status),
            confirmedAt: orderDate,
            packedAt: status !== 'Pending' && status !== 'Confirmed' ? orderDate : null,
            readyForPickupAt: ['Ready for Pickup', 'Picked Up', 'Out for Delivery', 'Delivered'].includes(status) ? orderDate : null,
            pickedUpAt: ['Picked Up', 'Out for Delivery', 'Delivered'].includes(status) ? orderDate : null,
            deliveredAt: status === 'Delivered' ? orderDate : null,
          });
        }
      });

      const itemsPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const taxPrice = Math.round(itemsPrice * 0.08 * 100) / 100;
      const shippingPrice = itemsPrice > 100 ? 0 : 15;
      const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

      const isDeliveredOrInTransit = ['Delivered', 'Out for Delivery', 'Picked Up'].includes(status);

      dummyOrders.push({
        user: customer._id,
        orderNumber: 'NX-' + (840210 + i),
        orderItems: items,
        vendors: vendorsSubList,
        shippingAddress: {
          fullName: customer.name,
          phone: customer.phone,
          street: customer.address.street,
          city: customer.address.city,
          state: customer.address.state,
          postalCode: customer.address.postalCode,
          country: customer.address.country,
        },
        paymentMethod: i % 3 === 0 ? 'PayPal' : (i % 2 === 0 ? 'Cash on Delivery' : 'Credit/Debit Card'),
        itemsPrice,
        taxPrice,
        shippingPrice,
        discountPrice: 0,
        totalPrice,
        isPaid: status === 'Delivered' || (i % 2 !== 0 && status !== 'Pending'),
        paidAt: status !== 'Pending' ? orderDate : null,
        status,
        confirmedAt: orderDate,
        packedAt: status !== 'Pending' && status !== 'Confirmed' ? orderDate : null,
        readyForPickupAt: ['Ready for Pickup', 'Picked Up', 'Out for Delivery', 'Delivered'].includes(status) ? orderDate : null,
        pickedUpAt: isDeliveredOrInTransit ? orderDate : null,
        outForDeliveryAt: ['Out for Delivery', 'Delivered'].includes(status) ? orderDate : null,
        deliveredAt: status === 'Delivered' ? orderDate : null,
        deliveryPartner: isDeliveredOrInTransit ? rider1._id : null,
        deliveryStatus: status === 'Delivered' ? 'DELIVERED' : (status === 'Out for Delivery' ? 'OUT_FOR_DELIVERY' : (status === 'Picked Up' ? 'PICKED_UP' : 'UNASSIGNED')),
        trackingNumber: 'TRK9482' + (1000 + i),
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    await Order.insertMany(dummyOrders);

  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    throw error;
  }
};

const runSeederScript = async () => {
  await connectDB();
  await seedDatabase();
  await disconnectDB();
  process.exit();
};

if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
  runSeederScript();
}
