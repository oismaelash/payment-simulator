const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: [
    "@payment-simulator/core",
    "@payment-simulator/gateway-stripe",
    "@payment-simulator/gateway-abacatepay",
    "@payment-simulator/gateway-asaas",
    "@payment-simulator/gateway-mercadopago",
    "@payment-simulator/gateway-pagarme",
    "@payment-simulator/gateway-paguedev",
  ],
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
};

module.exports = nextConfig;

