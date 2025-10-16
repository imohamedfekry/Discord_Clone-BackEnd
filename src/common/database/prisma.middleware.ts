// src/common/database/prisma.middleware.ts
import { PrismaClient } from '@prisma/client';
import { snowflake } from '../utils/snowflake';
import { hashHandler } from '../Global/security/hash.helper';
import { encrypt } from '../Global/security/cryption.helper';
export function extendPrisma(prisma: PrismaClient) {
  return prisma.$extends({
    query: {
      $allModels: {
        // Trigger on CREATE and UPDATE
        async create({ model, args, query }) {
          await handleIdsnowflake(model, args);
          await handlePasswordHash(model, args);
          await handelPhoneEncryption(model, args);
          return query(args);
        },
        async update({ model, args, query }) {
          await handlePasswordHash(model, args);
          await handelPhoneEncryption(model, args);
          return query(args);
        },
      },
    },
  });
}

async function handleIdsnowflake(model: string, args: any) {
  if (!args.data?.id) {
    (args.data as any).id = snowflake.generate().toString();
  }
}

async function handlePasswordHash(model: string, args: any) {
  if (model === 'User' && args.data?.password) {
    args.data.password = await hashHandler(args.data.password);
  }
}
async function handelPhoneEncryption(model: string, args: any) {
  if (model === 'User' && args.data?.phone) {
    args.data.phone = encrypt(args.data.phone);
  }
  
}