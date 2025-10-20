// src/common/database/prisma.middleware.ts
import { PrismaClient } from '@prisma/client';
import { snowflake } from '../utils/snowflake';
import { hashHandler } from '../Global/security/hash.helper';
import { encrypt } from '../Global/security/cryption.helper';
export function extendPrisma(prisma: PrismaClient) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const result = await query(args);
          return convert(result);
        },
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
// convert bigints to strings
function convert(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(convert);
  if (typeof obj === 'object') {
    const out: Record<string, any> = {};
    for (const key in obj) out[key] = convert(obj[key]);
    return out;
    
  }
  return obj;
}