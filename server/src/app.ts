import express from 'express';
import { errorMiddleware } from './middlewares/error-middleware.js';
import { router } from './routes/index.js';

export function App() {
  const app = express();
  
  app.use(express.json());
  
  app.use(router);
  app.use(errorMiddleware);
  
  return app;
}