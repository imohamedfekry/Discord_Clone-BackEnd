// prisma.middleware.ts
import { PrismaClient } from '@prisma/client';
import { snowflake } from '../utils/snowflake';

export function extendPrisma(prisma: PrismaClient) {
  return prisma.$extends({
    query: {
      $allModels: {
        async create({ args, query }) {
          if (args.data && !('id' in args.data)) {
            (args.data as any).id = snowflake.generate().toString();
          }
          return query(args);
        },
      },
    },
  });
}
