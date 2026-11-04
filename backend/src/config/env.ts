import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sdd-developer-assessment',
  jwtSecret: process.env.JWT_SECRET ?? '',
};
