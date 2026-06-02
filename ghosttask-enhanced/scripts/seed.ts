import mongoose from 'mongoose';
import { connectToDatabase } from '../config/db';
import { Task } from '../models/Task';
import { Suggestion } from '../models/Suggestion';
import { Activity } from '../models/Activity';
import { FocusSession } from '../models/FocusSession';
import { logger } from '../lib/logger';

// Setup environment variables in case they are missing during raw script run
import * as dotenv from 'dotenv';
dotenv.config();

async function seed() {
  logger.info('Starting database seeding...');
  await connectToDatabase();

  // Clear existing collections
  await Task.deleteMany({});
  await Suggestion.deleteMany({});
  await Activity.deleteMany({});
  await FocusSession.deleteMany({});
  logger.info('Database collections cleared successfully.');

  const today = new Date();
  
  // Set up specific dates for mockup alignment
  const today10AM = new Date(today); today10AM.setHours(10, 0, 0, 0);
  const today1PM = new Date(today); today1PM.setHours(13, 0, 0, 0);
  const today3PM = new Date(today); today3PM.setHours(15, 0, 0, 0);
  const today5PM = new Date(today); today5PM.setHours(17, 0, 0, 0);
  const today6PM = new Date(today); today6PM.setHours(18, 0, 0, 0);
  const today8PM = new Date(today); today8PM.setHours(20, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterday6PM = new Date(yesterday); yesterday6PM.setHours(18, 0, 0, 0);

  const tomorrow11AM = new Date(today); tomorrow11AM.setDate(tomorrow11AM.getDate() + 1); tomorrow11AM.setHours(11, 0, 0, 0);
  const tomorrow2PM = new Date(today); tomorrow2PM.setDate(tomorrow2PM.getDate() + 1); tomorrow2PM.setHours(14, 0, 0, 0);

  // 1. Create Tasks
  const tasksToCreate = [
    {
      title: 'Finish Project Report',
      description: 'Format the final figures and export PDF for submission.',
      status: 'pending' as const,
      priority: 'high' as const,
      category: 'academic' as const,
      dueDate: today10AM,
      estimatedTime: 60,
    },
    {
      title: 'Data Structures Assignment',
      description: 'Implement AVL Tree deletion and balance factors.',
      status: 'pending' as const,
      priority: 'medium' as const,
      category: 'academic' as const,
      dueDate: today1PM,
      estimatedTime: 90,
    },
    {
      title: 'Morning Workout',
      description: '5km run and upper body core splits.',
      status: 'completed' as const,
      priority: 'low' as const,
      category: 'personal' as const,
      dueDate: new Date(today.getTime() - 4 * 60 * 60 * 1000), // completed earlier today
      estimatedTime: 45,
      actualTimeSpent: 45,
      completedAt: new Date(today.getTime() - 4 * 60 * 60 * 1000),
    },
    {
      title: 'Read Research Paper',
      description: 'Transformer architecture and attention optimization methods.',
      status: 'pending' as const,
      priority: 'medium' as const,
      category: 'academic' as const,
      dueDate: today5PM,
      estimatedTime: 45,
    },
    {
      title: 'Call Mom',
      description: 'Catch up and check on weekend plans.',
      status: 'pending' as const,
      priority: 'low' as const,
      category: 'personal' as const,
      dueDate: today8PM,
      estimatedTime: 15,
    },
    {
      title: 'Study Operating Systems',
      description: 'Deadlock avoidance algorithms and banker matrix calculations.',
      status: 'pending' as const,
      priority: 'high' as const,
      category: 'academic' as const,
      dueDate: today3PM,
      estimatedTime: 120,
    },
    {
      title: 'Database Tutorial',
      description: 'Indexing, B-Tree nodes, and query planners.',
      status: 'pending' as const,
      priority: 'medium' as const,
      category: 'academic' as const,
      dueDate: today6PM,
      estimatedTime: 60,
    },
    {
      title: 'Weekly Grocery Shopping',
      description: 'Fruits, milk, eggs, chicken breast, oats.',
      status: 'pending' as const,
      priority: 'low' as const,
      category: 'personal' as const,
      dueDate: tomorrow11AM,
      estimatedTime: 45,
    },
    {
      title: 'Prep Presentation Slides',
      description: 'Create slide assets and outline speech structure.',
      status: 'completed' as const,
      priority: 'high' as const,
      category: 'work' as const,
      dueDate: yesterday,
      estimatedTime: 90,
      actualTimeSpent: 120,
      completedAt: yesterday,
    },
  ];

  const createdTasks = await Task.create(tasksToCreate);
  logger.info(`Seeded ${createdTasks.length} tasks successfully.`);

  // Find tasks to link recommendations
  const studyOSTask = createdTasks.find((t) => t.title === 'Study Operating Systems')!;
  const dbTask = createdTasks.find((t) => t.title === 'Database Tutorial')!;
  const workoutTask = createdTasks.find((t) => t.title === 'Morning Workout')!;

  // 2. Create AI Reschedule Suggestions
  const suggestionsToCreate = [
    {
      taskId: studyOSTask._id as any,
      originalDate: today3PM,
      suggestedDate: tomorrow11AM,
      reason: 'Academic tasks are heavy today. Move this block to tomorrow morning for optimal focus capacity.',
      status: 'pending' as const,
    },
    {
      taskId: dbTask._id as any,
      originalDate: today6PM,
      suggestedDate: tomorrow2PM,
      reason: 'You have completed 3 other tasks today. Rest and tackle this fresh tomorrow.',
      status: 'pending' as const,
    },
  ];

  const createdSuggestions = await Suggestion.create(suggestionsToCreate);
  logger.info(`Seeded ${createdSuggestions.length} suggestions successfully.`);

  // 3. Create Timeline Activities
  const activitiesToCreate = [
    {
      action: 'added' as const,
      taskTitle: 'Read Book Chapter',
      details: 'Added to Academic list today',
      timestamp: new Date(today.getTime() - 5.5 * 60 * 60 * 1000), // 8:45 AM
    },
    {
      action: 'missed' as const,
      taskTitle: 'Database Tutorial',
      details: 'Missed scheduled time slot',
      timestamp: yesterday6PM,
    },
    {
      action: 'rescheduled' as const,
      taskTitle: 'Study OS',
      details: 'Rescheduled via Smart Engine',
      timestamp: new Date(today.getTime() - 5 * 60 * 60 * 1000), // 9:15 AM
    },
    {
      action: 'completed' as const,
      taskTitle: 'Morning Workout',
      details: 'Completed Personal routine',
      timestamp: new Date(today.getTime() - 6.75 * 60 * 60 * 1000), // 7:30 AM
    },
  ];

  const createdActivities = await Activity.create(activitiesToCreate);
  logger.info(`Seeded ${createdActivities.length} activities successfully.`);

  // 4. Create Focus Sessions (Total of 3 hours focus to yield a realistic 72% Productivity Score)
  const focusSessionsToCreate = [
    {
      taskId: studyOSTask._id as any,
      duration: 1500, // 25 min
      completed: true,
      timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      taskId: workoutTask._id as any,
      duration: 2700, // 45 min
      completed: true,
      timestamp: new Date(today.getTime() - 7 * 60 * 60 * 1000),
    },
    {
      taskId: dbTask._id as any,
      duration: 1500, // 25 min
      completed: true,
      timestamp: yesterday6PM,
    },
    {
      duration: 1500, // Quick focus 25 min
      completed: true,
      timestamp: new Date(today.getTime() - 1 * 60 * 60 * 1000),
    },
  ];

  const createdSessions = await FocusSession.create(focusSessionsToCreate);
  logger.info(`Seeded ${createdSessions.length} focus sessions successfully.`);

  logger.info('Database seeding completed successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  logger.error('Error during seeding database', err);
  process.exit(1);
});
