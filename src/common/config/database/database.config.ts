import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  Business,
  BusinessHours,
  BusinessPolicy,
  Camera,
} from '../../../database/entities';

export const databaseConfig = () => {
  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
  const username = process.env.DB_USER ?? '';
  const password = process.env.DB_PASSWORD ?? '';
  const database = process.env.DB_NAME ?? '';

  return {
    database: {
      host,
      port,
      username,
      password,
      name: database,
      synchronize: process.env.NODE_ENV !== 'production',
    },
  };
};

export const getTypeOrmConfig = (): TypeOrmModuleOptions => {
  const config = databaseConfig().database;

  return {
    type: 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.name,
    entities: [Business, BusinessHours, Camera, BusinessPolicy],
    synchronize: config.synchronize,
  };
};

export const onDatabaseConnect = () => {
  const config = databaseConfig().database;

  console.log(
    `[DB] Connected to ${config.name} at ${config.host}:${config.port}`,
  );
};
