/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverActions: true, // Enables Server Actions if needed
	},
	reactStrictMode: true,
	swcMinify: true,
};

export default nextConfig;
