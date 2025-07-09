import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distPath = resolve(__dirname, './dist');
const publicPath = resolve(__dirname, './public');
const BASE_PATH = '/';

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://sareportingpoc.blob.core.windows.net'] 
    : 'http://localhost:' + PORT, 
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  const ext = req.path.split('.').pop().toLowerCase();
  if (ext === 'js') {
    res.type('application/javascript; charset=UTF-8');
  } else if (ext === 'css') {
    res.type('text/css; charset=UTF-8');
  }
  next();
});

app.use(BASE_PATH, express.static(distPath));

app.use(BASE_PATH, express.static(publicPath));

app.get(`${BASE_PATH}/*`, (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.get('/', (req, res) => {
  res.redirect(BASE_PATH);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`App is accessible at http://localhost:${PORT}${BASE_PATH}`);
  console.log('Serving static files from:', distPath);
  console.log('Serving public files from:', publicPath);
});
