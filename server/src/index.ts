import morgan from 'morgan';
import { App } from './app.js';

const port = Number(process.env.PORT) || 3000;
const app = App();

const environment = process.env.NODE_ENV || 'development';
app.use(environment === 'development' ? morgan('dev') : morgan('tiny'));

const server = app.listen(port, () => {
  console.log(`Server has been started on port ${port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
