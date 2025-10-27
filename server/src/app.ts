import express from 'express';
import { router } from './routes/index.js';

export function App() {
  const app = express();
  
  app.use(express.json());
  
  app.use(router);
  
  return app;
}