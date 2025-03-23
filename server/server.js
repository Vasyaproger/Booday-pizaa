const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Настройка CORS
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Настройка Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Только PNG, JPG, JPEG и WebP форматы поддерживаются'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Схемы
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const Admin = mongoose.model('Admin', AdminSchema);

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

const BranchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
});
const Branch = mongoose.model('Branch', BranchSchema);

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String },
  subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }],
});
const Category = mongoose.model('Category', CategorySchema);

const SubcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
});
const Subcategory = mongoose.model('Subcategory', SubcategorySchema);

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  prices: {
    small: { type: Number },
    medium: { type: Number },
    large: { type: Number },
  },
  price: { type: Number },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
});
const Product = mongoose.model('Product', ProductSchema);

// Настройка транспортера для отправки email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Генерация логина и пароля
const generateCredentials = () => {
  const username = `admin_${Math.random().toString(36).substring(2, 8)}`;
  const password = Math.random().toString(36).substring(2, 10);
  return { username, password };
};

// Middleware для проверки токена
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Токен отсутствует' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Неверный токен' });
  }
};

// Функция для генерации и сохранения админа при старте
const initializeAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const { username, password } = generateCredentials();
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = new Admin({ username, password: hashedPassword });
      await admin.save();
      console.log(`Generated Admin Credentials:`);
      console.log(`Username: ${username}`);
      console.log(`Password: ${password}`);
    } else {
      console.log('Admin already exists in the database.');
    }
  } catch (err) {
    console.error('Error initializing admin:', err);
  }
};

// Маршруты для админов
app.post('/api/admin/register', authMiddleware, async (req, res) => {
  try {
    const { username, password } = generateCredentials();
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();
    res.json({ username, password });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при регистрации' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/admin/users', authMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find({}, 'username');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/api/admin/promo', authMiddleware, async (req, res) => {
  const { promoCode } = req.body;
  res.json({ message: `Промокод ${promoCode} отправлен` });
});

// Маршруты для пользователей
app.post('/api/auth/register', async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    // Проверка, существует ли пользователь
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split('@')[0]; // Генерируем username из email
    const user = new User({
      username,
      password: hashedPassword,
      name: username,
      email,
      phone,
    });
    await user.save();

    res.status(201).json({ message: 'Регистрация успешна', name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Пользователь не найден' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный пароль' });
    }

    res.status(200).json({ message: 'Вход успешен', name: user.name });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, 'username name email phone');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json({ message: 'Пользователь удален' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/api/users/promo', authMiddleware, async (req, res) => {
  const { promoCode, username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Ваш промокод',
      text: `Здравствуйте, ${user.name}!\n\nВаш промокод: ${promoCode}\n\nС уважением,\nКоманда приложения`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: `Промокод ${promoCode} отправлен на ${user.email}` });
  } catch (err) {
    console.error('Ошибка при отправке промокода:', err);
    res.status(500).json({ message: 'Ошибка при отправке промокода' });
  }
});

// Маршруты для филиалов
app.post('/api/admin/branch', authMiddleware, async (req, res) => {
  const { name, city } = req.body;
  try {
    const branch = new Branch({ name, city });
    await branch.save();
    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении филиала' });
  }
});

app.put('/api/admin/branch/:id', authMiddleware, async (req, res) => {
  const { name, city } = req.body;
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { name, city },
      { new: true }
    );
    if (!branch) return res.status(404).json({ message: 'Филиал не найден' });
    res.json(branch);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении филиала' });
  }
});

app.delete('/api/admin/branch/:id', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ branch: req.params.id });
    if (products.length > 0) {
      return res.status(400).json({ message: 'Нельзя удалить филиал, у которого есть продукты' });
    }

    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Филиал не найден' });
    res.json({ message: 'Филиал удален' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении филиала' });
  }
});

app.get('/api/admin/branches', authMiddleware, async (req, res) => {
  try {
    const branches = await Branch.find();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении филиалов' });
  }
});

// Маршруты для категорий
app.post('/api/admin/category', authMiddleware, async (req, res) => {
  const { name, emoji } = req.body;
  try {
    const category = new Category({ name, emoji });
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении категории' });
  }
});

app.put('/api/admin/category/:id', authMiddleware, async (req, res) => {
  const { name, emoji } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, emoji },
      { new: true }
    );
    if (!category) return res.status(404).json({ message: 'Категория не найдена' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении категории' });
  }
});

app.delete('/api/admin/category/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Категория не найдена' });

    if (category.subcategories.length > 0) {
      return res.status(400).json({ message: 'Нельзя удалить категорию, у которой есть подкатегории' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Категория удалена' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении категории' });
  }
});

app.get('/api/admin/categories', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find().populate('subcategories');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении категорий' });
  }
});

// Маршруты для подкатегорий
app.post('/api/admin/subcategory', authMiddleware, async (req, res) => {
  const { name, categoryId } = req.body;
  try {
    const subcategory = new Subcategory({ name, category: categoryId });
    await subcategory.save();
    await Category.findByIdAndUpdate(categoryId, { $push: { subcategories: subcategory._id } });
    res.json(subcategory);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении подкатегории' });
  }
});

// Маршруты для продуктов
app.post('/api/admin/product', authMiddleware, upload.single('image'), async (req, res) => {
  const { name, prices, price, branchId, subcategoryId } = req.body;

  try {
    let imagePath = null;
    if (req.file) {
      const compressedImagePath = `uploads/compressed-${req.file.filename}`;
      await sharp(req.file.path)
        .resize({ width: 800 })
        .toFormat('jpeg', { quality: 80 })
        .toFile(compressedImagePath);

      imagePath = `/${compressedImagePath}`;
    }

    const subcategory = await Subcategory.findById(subcategoryId).populate('category');
    const isPizza = subcategory.category.name.toLowerCase() === 'пицца';

    const productData = {
      name,
      image: imagePath,
      branch: branchId,
      subcategory: subcategoryId,
    };

    if (isPizza) {
      productData.prices = JSON.parse(prices);
    } else {
      productData.price = parseFloat(price);
    }

    const product = new Product(productData);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при добавлении продукта' });
  }
});

app.put('/api/admin/product/:id', authMiddleware, upload.single('image'), async (req, res) => {
  const { name, prices, price, branchId, subcategoryId } = req.body;

  try {
    let imagePath = undefined;
    if (req.file) {
      const compressedImagePath = `uploads/compressed-${req.file.filename}`;
      await sharp(req.file.path)
        .resize({ width: 800 })
        .toFormat('jpeg', { quality: 80 })
        .toFile(compressedImagePath);

      imagePath = `/${compressedImagePath}`;
    }

    const subcategory = await Subcategory.findById(subcategoryId).populate('category');
    const isPizza = subcategory.category.name.toLowerCase() === 'пицца';

    const updateData = {};
    if (name) updateData.name = name;
    if (imagePath) updateData.image = imagePath;
    if (branchId) updateData.branch = branchId;
    if (subcategoryId) updateData.subcategory = subcategoryId;

    if (isPizza) {
      updateData.prices = prices ? JSON.parse(prices) : undefined;
      updateData.price = null;
    } else {
      updateData.price = price ? parseFloat(price) : undefined;
      updateData.prices = { small: null, medium: null, large: null };
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: 'Продукт не найден' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении продукта' });
  }
});

app.delete('/api/admin/product/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Продукт не найден' });
    res.json({ message: 'Продукт удален' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении продукта' });
  }
});

app.get('/api/admin/products', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find().populate('branch').populate('subcategory');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении продуктов' });
  }
});

// Публичные эндпоинты (без авторизации)
app.get('/api/public/branches', async (req, res) => {
  try {
    const branches = await Branch.find();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении филиалов' });
  }
});

app.get('/api/public/categories', async (req, res) => {
  try {
    const categories = await Category.find().populate('subcategories');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении категорий' });
  }
});

app.get('/api/public/products', async (req, res) => {
  try {
    const products = await Product.find().populate('branch').populate('subcategory');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении продуктов' });
  }
});

// Инициализация админа при запуске сервера
mongoose.connection.once('open', () => {
  initializeAdmin();
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});