require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopkart';

const sampleProducts = [
  {
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with active noise cancellation, 30-hour battery life, and high-fidelity sound.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    stock: 25,
  },
  {
    name: 'RGB Mechanical Gaming Keyboard',
    description: 'Hot-swappable mechanical switches with customizable RGB per-key backlighting and detachable USB-C cable.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    stock: 12,
  },
  {
    name: 'Wireless Ergonomic Optical Mouse',
    description: 'Precision wireless mouse with adjustable DPI sensor, dual Bluetooth/2.4G connectivity, and ergonomic grip.',
    price: 1499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    stock: 18,
  },
  {
    name: 'Ultra-Clear 4K Computer Monitor 27"',
    description: 'IPS display with 99% sRGB color gamut, HDR400, ultra-thin bezels, and eye-care blue light filter.',
    price: 18999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    stock: 8,
  },
  {
    name: 'Classic Vintage Leather Jacket',
    description: 'Premium handcrafted genuine leather jacket with soft inner lining, sturdy brass zippers, and storm collar.',
    price: 6499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    stock: 15,
  },
  {
    name: 'Slim-Fit Breathable Cotton Shirt',
    description: '100% combed cotton formal and casual button-down shirt with wrinkle-free finish and modern tailored fit.',
    price: 1299,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    stock: 40,
  },
  {
    name: 'Athletic Running Sneakers',
    description: 'Lightweight breathable mesh sneakers with responsive foam cushioning and high-traction rubber outsole.',
    price: 3499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    stock: 20,
  },
  {
    name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    description: 'Best-selling guide by Robert C. Martin on software engineering principles, refactoring, and code quality.',
    price: 899,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=800&q=80',
    stock: 30,
  },
  {
    name: 'Designing Data-Intensive Applications',
    description: 'The definitive handbook by Martin Kleppmann on scalable data systems, storage engines, and distributed architectures.',
    price: 1450,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
    stock: 22,
  },
  {
    name: 'Minimalist Ceramic Desk Lamp',
    description: 'Modern dimmable warm LED desk lamp with touch controls, wireless phone charging base, and matte ceramic finish.',
    price: 2199,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    stock: 14,
  },
  {
    name: 'Stainless Steel French Press Coffee Maker',
    description: 'Double-wall insulated stainless steel French press with 4-level filtration system for barista-quality brew.',
    price: 1799,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    stock: 16,
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding.');

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const created = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${created.length} products into ShopKart!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedProducts();
}

module.exports = { sampleProducts };
