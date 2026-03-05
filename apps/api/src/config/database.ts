import knex from 'knex';
import knexConfig from '../../database/knexfile.js';

const environment = process.env.NODE_ENV || 'development';
export const db = knex(knexConfig[environment]);
