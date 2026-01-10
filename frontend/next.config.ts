import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 프로덕션 빌드를 위한 standalone 모드
  output: 'standalone',
};

export default nextConfig;
