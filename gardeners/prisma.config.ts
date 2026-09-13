import { defineConfig } from '@prisma/config';
import {
  PgSql_User,
  PgSql_Password,
  PgSql_Database,
  PgSql_Host,
  PgSql_Port,
} from './config/env.config.ts';

const EPword = encodeURIComponent(PgSql_Password);
const defaultUrl = `postgresql://${PgSql_User}:${EPword}@${PgSql_Host}:${PgSql_Port}/${PgSql_Database}?schema=public`;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'node --loader ts-node/esm prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL || defaultUrl,
  },
});
