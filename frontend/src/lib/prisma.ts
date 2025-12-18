// Prisma 클라이언트 초기화 유틸
// - 개발 환경에서 hot-reload 시 다중 인스턴스 생성을 방지하기 위해 globalThis를 활용합니다.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}


