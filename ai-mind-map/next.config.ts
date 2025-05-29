import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 优化 hydration 和性能
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // 确保客户端组件正确处理
  transpilePackages: ['simple-mind-map'],
  // 开发环境配置
  ...(process.env.NODE_ENV === 'development' && {
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  }),
};

export default nextConfig;
