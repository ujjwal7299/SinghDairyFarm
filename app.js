const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// MongoDB connection
mongoose.connect('mongodb+srv://ujjwal-test:Ujjwal123@cluster0.0jtgl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    initializeProducts();
  })
  .catch(err => {
    process.exit(1);
  });

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  unit: String,
  description: String,
  image: String,
  shelfLife: String,
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    fat: Number,
    calcium: Number
  },
  benefits: [String]
});

const Product = mongoose.model('Product', productSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  product: String,
  quantity: Number,
  name: String,
  phone: String,
  address: String,
  status: String,
  orderDate: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Initialize products if none exist
async function initializeProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany([
        {
          name: 'Fresh Milk',
          price: 40,
          unit: 'Liter',
          description: 'Pure, unadulterated milk from our healthy cows. Rich in nutrients and perfect for daily consumption.',
          image: 'milk.jpg',
          shelfLife: '2-3 days',
          nutritionalInfo: {
            calories: 150,
            protein: 8,
            fat: 3.5,
            calcium: 300
          },
          benefits: [
            'Rich in calcium',
            'High protein content',
            'Essential vitamins and minerals',
            'Natural source of energy'
          ]
        },
        {
          name: 'Curd',
          price: 40,
          unit: '500g',
          description: 'Fresh, creamy curd made from pure milk. Perfect for your daily diet.',
          image: 'curd.jpg',
          shelfLife: '5-7 days',
          nutritionalInfo: {
            calories: 120,
            protein: 10,
            fat: 4,
            calcium: 250
          },
          benefits: [
            'Good for digestion',
            'Rich in probiotics',
            'High in protein'
          ]
        },
        {
          name: 'Butter',
          price: 400,
          unit: 'Kg',
          description: 'Pure, creamy butter made from fresh cream. Perfect for cooking and spreading.',
          image: 'butter.jpg',
          shelfLife: '15-20 days',
          nutritionalInfo: {
            calories: 717,
            protein: 0.9,
            fat: 81,
            calcium: 24
          },
          benefits: [
            'Rich in healthy fats',
            'Contains essential vitamins',
            'Natural source of energy',
            'Great for cooking'
          ]
        }
      ]);
      console.log('Sample products initialized');
    }
  } catch (error) {
    console.error('Error initializing products:', error);
  }
}

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'singhdairy72@gmail.com',
    pass: 'kqmh tart gekj hymg'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Routes
app.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('index', { 
      title: 'Singh Dairy Farm',
      products: products 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading products');
  }
});

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('products', { 
      title: 'Our Products - Singh Dairy Farm',
      products: products 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading products');
  }
});

app.get(['/products/:name', '/moredetails/:name'], async (req, res) => {
  try {
    const productName = decodeURIComponent(req.params.name);
    const product = await Product.findOne({ 
      name: { $regex: new RegExp(`^${productName}$`, 'i') }
    });
    
    if (!product) {
      return res.status(404).render('error', { 
        message: 'Product not found. Please check the product name and try again.' 
      });
    }
    
    res.render('details', { 
      product: {
        name: product.name,
        price: product.price,
        unit: product.unit,
        description: product.description,
        image: product.image,
        shelfLife: product.shelfLife,
        nutritionalInfo: product.nutritionalInfo || {},
        benefits: product.benefits || []
      }
    });
  } catch (error) {
    res.status(500).render('error', { 
      message: 'Error fetching product details. Please try again later.' 
    });
  }
});

// Handle order submission
app.post('/products', async (req, res) => {
  try {
    const { product, quantity, name, phone, address } = req.body;
    
    // Validate required fields
    if (!product || !quantity || !name || !phone || !address) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Create email content
    const mailOptions = {
      from: 'singhdairy72@gmail.com',
      to: 'singhdairy72@gmail.com',
      subject: 'New Order Received - Singh Dairy Farm',
      html: `
        <h2>New Order Details</h2>
        <p><strong>Product:</strong> ${product}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>Phone Number:</strong> ${phone}</p>
        <p><strong>Delivery Address:</strong> ${address}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Save order to database
    const order = new Order({
      product,
      quantity,
      name,
      phone,
      address,
      status: 'pending'
    });
    await order.save();

    res.json({ 
      success: true, 
      message: 'Order placed successfully! We will contact you shortly to confirm the details.' 
    });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing order. Please try again.' 
    });
  }
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Us - Singh Dairy Farm' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us - Singh Dairy Farm' });
});

app.get('/farm-visit', (req, res) => {
  res.render('farm-visit', { 
    title: 'Farm Visit - Singh Dairy Farm',
    success: req.query.success === 'true',
    error: req.query.error === 'true'
  });
});

app.post('/farm-visit', async (req, res) => {
  try {
    const { name, email, phone, groupSize, date, time, requirements } = req.body;

    // Create email content
    const mailOptions = {
      from: 'singhdairy72@gmail.com',
      to: 'singhdairy72@gmail.com',
      subject: 'New Farm Visit Request - Singh Dairy Farm',
      html: `
        <h2>New Farm Visit Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Group Size:</strong> ${groupSize}</p>
        <p><strong>Preferred Date:</strong> ${date}</p>
        <p><strong>Preferred Time:</strong> ${time}</p>
        <p><strong>Special Requirements:</strong> ${requirements || 'None'}</p>
        <p><strong>Request Date:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.redirect('/farm-visit?success=true');
  } catch (error) {
    console.error('Error processing farm visit request:', error);
    res.redirect('/farm-visit?error=true');
  }
});

// Handle contact form submission
app.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Create email content
    const mailOptions = {
      from: 'singhdairy72@gmail.com',
      to: 'singhdairy72@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Message sent successfully! We will get back to you soon.' 
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending message. Please try again.' 
    });
  }
});

// Debug route to view all products
app.get('/debug/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
