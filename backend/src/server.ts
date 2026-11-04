import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';

async function start(): Promise<void> {
  try {
    await mongoose.connect(env.mongoUri);
    app.listen(env.port, () => console.log(`API listening on port ${env.port}`));
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

void start();
