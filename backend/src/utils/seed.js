import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';

dotenv.config();

const sampleCategories = [
  { name: 'Electronics', slug: 'electronics', description: 'Laptops, Cameras & Keyboards' },
  { name: 'Audio', slug: 'audio', description: 'Studio Acoustics, Noise-Cancelling & Hi-Fi' },
  { name: 'Wearables', slug: 'wearables', description: 'Smartwatches & Fitness Trackers' },
  { name: 'Footwear', slug: 'footwear', description: 'Sneakers, Sports & Casual Shoes' },
  { name: 'Gaming', slug: 'gaming', description: 'Keyboards, Mice & Gaming Accessories' },
  { name: 'Accessories', slug: 'accessories', description: 'Bags, Wallets & EDC Essentials' }
];

const richProductCatalog = [
  // 1. ELECTRONICS
  {
    name: 'MacBook Pro 14" M3 Pro Chip (18GB RAM, 512GB SSD Space Black)',
    slug: 'macbook-pro-14-m3-pro-chip-space-black',
    description: 'The most advanced chips ever built for a personal computer. Liquid Retina XDR display, up to 18 hours of battery life, and pro ports including MagSafe 3, HDMI, and Thunderbolt 4.',
    price: 199900,
    discountPercentage: 8,
    category: 'Electronics',
    brand: 'Apple',
    stock: 12,
    rating: 4.9,
    numReviews: 86,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Fujifilm X-T5 Mirrorless Digital Camera (Silver Body)',
    slug: 'fujifilm-x-t5-mirrorless-camera-silver',
    description: '40.2MP non-stacked X-Trans 5 HR sensor, 5-axis in-body image stabilization up to 7.0 stops, 6.2K/30p 4:2:2 10-bit internal video recording, and classic tactile dial operation.',
    price: 169999,
    discountPercentage: 5,
    category: 'Electronics',
    brand: 'Fujifilm',
    stock: 6,
    rating: 4.8,
    numReviews: 42,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Dell XPS 15 OLED InfinityEdge Laptop (i9, 32GB RAM, 1TB SSD)',
    slug: 'dell-xps-15-oled-laptop',
    description: 'Stunning 3.5K OLED touchscreen display with 100% DCI-P3 color gamut, NVIDIA GeForce RTX 4070 graphics, and machined aluminum chassis with carbon fiber palm rest.',
    price: 245000,
    discountPercentage: 12,
    category: 'Electronics',
    brand: 'Dell',
    stock: 4,
    rating: 4.7,
    numReviews: 31,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Sony Alpha 7 IV Full-Frame Hybrid Camera',
    slug: 'sony-alpha-7-iv-camera',
    description: '33MP full-frame Exmor R back-illuminated CMOS sensor with real-time Eye AF for humans, animals, and birds. 4K 60p 10-bit 4:2:2 recording capability.',
    price: 219990,
    discountPercentage: 10,
    category: 'Electronics',
    brand: 'Sony',
    stock: 8,
    rating: 4.9,
    numReviews: 54,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb39f?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // 2. AUDIO
  {
    name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    slug: 'sony-wh-1000xm5-wireless-noise-cancelling-headphones',
    description: 'Industry-leading noise cancellation with two processors and 8 microphones. Magnificent audio quality with 30 hours battery life and ultra-comfortable lightweight design.',
    price: 34999,
    discountPercentage: 15,
    category: 'Audio',
    brand: 'Sony',
    stock: 20,
    rating: 4.8,
    numReviews: 124,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Bose QuietComfort Ultra Wireless Noise Cancelling Earbuds',
    slug: 'bose-quietcomfort-ultra-earbuds',
    description: 'Groundbreaking spatial audio for immersive listening, world-class noise cancellation, and CustomTune technology that personalizes sound to the shape of your ears.',
    price: 25900,
    discountPercentage: 10,
    category: 'Audio',
    brand: 'Bose',
    stock: 15,
    rating: 4.7,
    numReviews: 92,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Marshall Stanmore III Bluetooth Wireless Home Speaker',
    slug: 'marshall-stanmore-iii-speaker',
    description: 'Classic vintage rock aesthetic with wider soundstage, dynamic loudness, and re-engineered acoustics for home room-filling stereophonic sound.',
    price: 38999,
    discountPercentage: 14,
    category: 'Audio',
    brand: 'Marshall',
    stock: 9,
    rating: 4.8,
    numReviews: 67,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Sennheiser Momentum 4 Wireless Audiophile Headphones',
    slug: 'sennheiser-momentum-4-wireless',
    description: 'Unmatched 60-hour battery life, 42mm transducer system delivering signature Sennheiser sound, and adaptive noise cancellation with transparent hearing mode.',
    price: 29990,
    discountPercentage: 18,
    category: 'Audio',
    brand: 'Sennheiser',
    stock: 3, // Low stock test case
    rating: 4.6,
    numReviews: 48,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // 3. WEARABLES
  {
    name: 'Apple Watch Series 9 GPS 45mm Midnight Aluminum Case',
    slug: 'apple-watch-series-9-gps-45mm',
    description: 'Smart, powerful, and indispensable. Features the S9 SiP, Double Tap gesture, brighter display, on-device Siri, and advanced health sensors including ECG and Blood Oxygen.',
    price: 44900,
    discountPercentage: 10,
    category: 'Wearables',
    brand: 'Apple',
    stock: 25,
    rating: 4.9,
    numReviews: 89,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Garmin Fenix 7 Pro Sapphire Solar GPS Multisport Watch',
    slug: 'garmin-fenix-7-pro-sapphire-solar',
    description: 'Solar-charging lens providing up to 22 days of battery in smartwatch mode. Built-in LED flashlight, Hill Score, Endurance Score, and TopoActive mapping.',
    price: 89990,
    discountPercentage: 5,
    category: 'Wearables',
    brand: 'Garmin',
    stock: 7,
    rating: 4.9,
    numReviews: 38,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Samsung Galaxy Watch6 Classic 47mm Bluetooth (Black)',
    slug: 'samsung-galaxy-watch6-classic-47mm',
    description: 'Rotating bezel design with sapphire crystal glass, advanced sleep coaching, body composition analysis (BIA), and personalized heart rate zones.',
    price: 36999,
    discountPercentage: 15,
    category: 'Wearables',
    brand: 'Samsung',
    stock: 14,
    rating: 4.6,
    numReviews: 61,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // 4. FOOTWEAR
  {
    name: 'Nike Air Max 270 React Running Shoes (Triple Black)',
    slug: 'nike-air-max-270-react-running-shoes',
    description: 'The Nike Air Max 270 delivers unmatched all-day comfort with Nike React foam technology and a large Max Air unit in the heel for lightweight, resilient cushioning.',
    price: 13995,
    discountPercentage: 20,
    category: 'Footwear',
    brand: 'Nike',
    stock: 35,
    rating: 4.6,
    numReviews: 210,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Adidas Ultraboost Light Performance Running Shoes',
    slug: 'adidas-ultraboost-light-shoes',
    description: 'Experience epic energy with the lightest Ultraboost ever. Features Light BOOST midsole cushioning, Continental rubber outsole, and Primeknit+ textile upper.',
    price: 18999,
    discountPercentage: 25,
    category: 'Footwear',
    brand: 'Adidas',
    stock: 18,
    rating: 4.8,
    numReviews: 145,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Puma Velocity Nitro 2 High-Distance Training Shoes',
    slug: 'puma-velocity-nitro-2-shoes',
    description: 'Nitro foam cushioning provides superior responsiveness in a featherlight package. PUMAGRIP durable rubber compound offers multi-surface traction.',
    price: 10999,
    discountPercentage: 30,
    category: 'Footwear',
    brand: 'Puma',
    stock: 22,
    rating: 4.5,
    numReviews: 73,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'New Balance 9060 Lifestyle Chunky Sneakers',
    slug: 'new-balance-9060-sneakers',
    description: 'Reinterprets familiar elements from classic 99X models with a warped sensibility inspired by the proudly futuristic, visible tech aesthetic of the Y2K era.',
    price: 15999,
    discountPercentage: 10,
    category: 'Footwear',
    brand: 'New Balance',
    stock: 0, // Sold out test case
    rating: 4.7,
    numReviews: 89,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // 5. GAMING
  {
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard RGB',
    slug: 'keychron-q1-pro-wireless-custom-keyboard',
    description: 'Full CNC machined 6063 aluminum body, hot-swappable Keychron K Pro mechanical switches, double-gasket design, and QMK/VIA key remapping support.',
    price: 18499,
    discountPercentage: 15,
    category: 'Gaming',
    brand: 'Keychron',
    stock: 16,
    rating: 4.9,
    numReviews: 112,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse',
    slug: 'logitech-g-pro-x-superlight-2-mouse',
    description: '60g ultra-lightweight design with HERO 2 sensor offering up to 32,000 DPI, LIGHTFORCE optical-mechanical switches, and 95 hours of continuous gameplay battery.',
    price: 14995,
    discountPercentage: 10,
    category: 'Gaming',
    brand: 'Logitech',
    stock: 24,
    rating: 4.8,
    numReviews: 167,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'SteelSeries Arctis Nova Pro Wireless Multi-System Headset',
    slug: 'steelseries-arctis-nova-pro-wireless',
    description: 'Almighty Audio with Nova Pro Acoustic System, Active Noise Cancellation, dual USB base station connections, and infinity power battery swap system.',
    price: 34999,
    discountPercentage: 12,
    category: 'Gaming',
    brand: 'SteelSeries',
    stock: 11,
    rating: 4.8,
    numReviews: 83,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Razer BlackWidow V4 Pro Mechanical Gaming Keyboard',
    slug: 'razer-blackwidow-v4-pro-keyboard',
    description: 'Razer Green Clicky Mechanical Switches, Command Dial with 8 dedicated macro keys, underglow lighting, magnetic plush leatherette wrist rest.',
    price: 21999,
    discountPercentage: 18,
    category: 'Gaming',
    brand: 'Razer',
    stock: 14,
    rating: 4.7,
    numReviews: 95,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // 6. ACCESSORIES
  {
    name: 'Bellroy Classic Backpack Plus 24L Workhorse Edition (Black)',
    slug: 'bellroy-classic-backpack-plus-24l',
    description: 'Dual-compartment design for tech commuters and weekend travelers. Dedicated 16" laptop sleeve, water-resistant Aquaguard zippers, and contoured lumbar support.',
    price: 16500,
    discountPercentage: 10,
    category: 'Accessories',
    brand: 'Bellroy',
    stock: 15,
    rating: 4.7,
    numReviews: 64,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Vanguard Minimalist Chronograph Leather Watch (316L Steel)',
    slug: 'vanguard-minimalist-chronograph-leather-watch',
    description: 'Crafted with sapphire crystal glass, 316L stainless steel case, and genuine Italian calf leather strap. Precise Japanese quartz movement with water resistance up to 5 ATM.',
    price: 8999,
    discountPercentage: 25,
    category: 'Accessories',
    brand: 'Vanguard',
    stock: 40,
    rating: 4.6,
    numReviews: 78,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Ekster Parliament Smart Bi-fold Leather Wallet (RFID Blocking)',
    slug: 'ekster-parliament-smart-wallet',
    description: 'Instant patented card access mechanism at the click of a button. Space-grade aluminum cardholder with RFID protection wrapped in top-grain leather.',
    price: 7499,
    discountPercentage: 20,
    category: 'Accessories',
    brand: 'Ekster',
    stock: 28,
    rating: 4.6,
    numReviews: 105,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: 'Nomad Base One Max MagSafe 3-in-1 Fast Wireless Charger',
    slug: 'nomad-base-one-max-magsafe-charger',
    description: 'Solid aluminum and premium glass chassis weighing 2 pounds. Official 15W MFi MagSafe charging for iPhone, Apple Watch Fast Charger, and AirPods pad.',
    price: 14999,
    discountPercentage: 10,
    category: 'Accessories',
    brand: 'Nomad',
    stock: 19,
    rating: 4.8,
    numReviews: 52,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_db';
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully!');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();

    console.log('Existing collections cleared.');

    // Seed Categories
    await Category.insertMany(sampleCategories);
    console.log(`Seeded ${sampleCategories.length} categories.`);

    // Seed Admin & Regular User
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@ecommerce.com',
      password: 'Admin@123456',
      role: 'admin',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    });

    const regularUser = await User.create({
      name: 'John Customer',
      email: 'user@ecommerce.com',
      password: 'User@123456',
      role: 'user',
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      addresses: [
        {
          fullName: 'John Customer',
          phone: '+91 9876543210',
          street: 'Flat 402, Lotus Grand Residences, 2nd Cross Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          country: 'India',
          isDefault: true
        }
      ]
    });

    console.log('Users created:');
    console.log('  Admin:    admin@ecommerce.com / Admin@123456');
    console.log('  Customer: user@ecommerce.com / User@123456');

    // Seed Rich Product Catalog
    const createdProducts = await Product.insertMany(richProductCatalog);
    console.log(`Seeded ${createdProducts.length} rich products across all 6 categories.`);

    // Seed Initial Test Order for verification
    const sampleProduct = createdProducts[0];
    await Order.create({
      orderNumber: 'ORD-20261003-7842',
      user: regularUser._id,
      orderItems: [
        {
          product: sampleProduct._id,
          name: sampleProduct.name,
          image: sampleProduct.images[0],
          price: Math.round(sampleProduct.price * (1 - sampleProduct.discountPercentage / 100)),
          quantity: 1,
          subtotal: Math.round(sampleProduct.price * (1 - sampleProduct.discountPercentage / 100))
        }
      ],
      shippingAddress: regularUser.addresses[0],
      paymentMethod: 'Razorpay',
      paymentStatus: 'Paid',
      paymentResult: {
        id: 'pay_9823472394RZP',
        status: 'CAPTURED',
        update_time: new Date().toISOString(),
        email_address: regularUser.email
      },
      pricing: {
        itemsPrice: sampleProduct.price,
        discountAmount: Math.round(sampleProduct.price * (sampleProduct.discountPercentage / 100)),
        shippingPrice: 0,
        taxPrice: Math.round(sampleProduct.price * 0.05),
        totalPrice: Math.round(sampleProduct.price * (1 - sampleProduct.discountPercentage / 100) * 1.05)
      },
      orderStatus: 'Shipped',
      timeline: [
        { status: 'Pending', timestamp: new Date(Date.now() - 86400000 * 2), note: 'Order placed via Razorpay checkout' },
        { status: 'Confirmed', timestamp: new Date(Date.now() - 86400000 * 2 + 3600000), note: 'Payment verified and captured' },
        { status: 'Packed', timestamp: new Date(Date.now() - 86400000 * 1), note: 'Package securely packed in warehouse' },
        { status: 'Shipped', timestamp: new Date(), note: 'In transit via BlueDart Express (Tracking: BLU-998811)' }
      ]
    });

    console.log('Sample test order seeded.');
    console.log('🎉 Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
