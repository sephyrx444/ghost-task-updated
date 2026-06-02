import mongoose from 'mongoose';
import { connectToDatabase } from '../config/db';
import { Task } from '../models/Task';
import { Suggestion } from '../models/Suggestion';
import { Activity } from '../models/Activity';
import { FocusSession } from '../models/FocusSession';
import { logger } from '../lib/logger';

import * as dotenv from 'dotenv';
dotenv.config();

async function reset() {
  logger.info('Starting database reset...');
  await connectToDatabase();

  await Task.deleteMany({});
  await Suggestion.deleteMany({});
  await Activity.deleteMany({});
  await FocusSession.deleteMany({});
  
  logger.info('Database reset completed successfully.');
  await mongoose.disconnect();
}

reset().catch((err) => {
  logger.error('Error during database reset', err);
  process.exit(1);
});
