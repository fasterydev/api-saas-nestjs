/* eslint-disable prettier/prettier */
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  API_PREFIX: string;
  STAGE: string;
  DB_PASS: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  JWT_SECRET: string;
  // AWS S3 - 6
  // AWS_REGION: string;
  // AWS_ENDPOINT: string;
  // AWS_ACCESS_KEY_ID: string;
  // AWS_SECRET_ACCESS_KEY: string;
  // AWS_BUCKET_NAME: string;
  // AWS_FOLDER: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    API_PREFIX: joi.string().required(),
    STAGE: joi.string().required(),
    DB_PASS: joi.string().required(),
    DB_NAME: joi.string().required(),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().required(),
    DB_USER: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    // AWS S3 - 6
    // AWS_REGION: joi.string().required(),
    // AWS_ENDPOINT: joi.string().required(),
    // AWS_ACCESS_KEY_ID: joi.string().required(),
    // AWS_SECRET_ACCESS_KEY: joi.string().required(),
    // AWS_BUCKET_NAME: joi.string().required(),
    // AWS_FOLDER: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config ENV error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  apiPrefix: envVars.API_PREFIX,
  sta: envVars.STAGE,
  dbPass: envVars.DB_PASS,
  dbName: envVars.DB_NAME,
  dbHost: envVars.DB_HOST,
  dbPort: envVars.DB_PORT,
  dbUser: envVars.DB_USER,
  jwtSecret: envVars.JWT_SECRET,
  // AWS S3 - 6
  // awsRegion: envVars.AWS_REGION,
  // awsEndpoint: envVars.AWS_ENDPOINT,
  // awsAccessKeyId: envVars.AWS_ACCESS_KEY_ID,
  // awsSecretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
  // awsBucketName: envVars.AWS_BUCKET_NAME,
  // awsFolder: envVars.AWS_FOLDER,
};
