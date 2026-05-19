import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, where, Timestamp } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const app = express();
const PORT = 3000;

app.use(express.json());

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// API Routes

// Seed API
app.post('/api/seed-products', async (req, res) => {
  try {
    const categories = ['Electronics', 'Accessories', 'Home', 'Fitness', 'Apparel'];
    const statuses = ['published', 'draft', 'archived'];
    const products = Array.from({ length: 50 }).map((_, i) => ({
      name: `Test Product ${i + 1}`,
      description: `This is a detailed description for Test Product ${i + 1}. It has amazing features and great quality.`,
      price: Math.floor(Math.random() * 100) + 10,
      compareAtPrice: Math.floor(Math.random() * 150) + 110,
      sku: `SKU-${Math.floor(Math.random() * 10000)}`,
      inventory: Math.floor(Math.random() * 200),
      category: categories[Math.floor(Math.random() * categories.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      image: `https://picsum.photos/seed/product${i}/400/400`,
      images: [
        `https://picsum.photos/seed/product${i}/400/400`,
        `https://picsum.photos/seed/product${i}_2/400/400`
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }));

    const batch = products.map(p => addDoc(collection(db, 'products'), p));
    await Promise.all(batch);
    
    res.json({ message: 'Successfully seeded 50 products' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed products' });
  }
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, 'products'), productData);
    res.status(201).json({ id: docRef.id, ...productData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productData = {
      ...req.body,
      updatedAt: Timestamp.now()
    };
    await updateDoc(doc(db, 'products', id), productData);
    res.json({ id, ...productData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteDoc(doc(db, 'products', id));
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orderData = {
      ...req.body,
      updatedAt: Timestamp.now()
    };
    await updateDoc(doc(db, 'orders', id), orderData);
    res.json({ id, ...orderData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Users API
app.get('/api/users', async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userData = {
      ...req.body,
      updatedAt: Timestamp.now()
    };
    await updateDoc(doc(db, 'users', id), userData);
    res.json({ id, ...userData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Settings API
app.get('/api/settings', async (req, res) => {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'store'));
    if (docSnap.exists()) {
      res.json(docSnap.data());
    } else {
      res.json({});
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    await updateDoc(doc(db, 'settings', 'store'), req.body);
    res.json(req.body);
  } catch (error) {
    // If it doesn't exist, create it
    try {
      await addDoc(collection(db, 'settings'), req.body);
      res.json(req.body);
    } catch (innerError) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
});

// Image Upload API
app.post('/api/upload', upload.array('image', 10), (req, res) => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const files = req.files as Express.Multer.File[];
  const imageUrls = files.map(file => `/uploads/${file.filename}`);
  res.json({ imageUrls, imageUrl: imageUrls[0] }); // Keep imageUrl for backward compatibility
});

// Serve static files from public/uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Vite middleware for development
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
