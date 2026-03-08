import knex, { type Knex } from 'knex';
import config from '../../database/knexfile.js';

const environment = process.env.NODE_ENV || 'development';
export const db = knex((config as any)[environment] as Knex.Config);
export type Database = ReturnType<typeof db>;
