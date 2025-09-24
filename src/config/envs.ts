 
import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  API_PREFIX: string;
  STAGE: string;
  JWT_SECRET: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().uri().required(),
    API_PREFIX: joi.string().required(),
    STAGE: joi.string().required(),
    JWT_SECRET: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config ENV error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  dbUrl: envVars.DATABASE_URL,
  apiPrefix: envVars.API_PREFIX,
  stage: envVars.STAGE,
  jwtSecret: envVars.JWT_SECRET,
};
