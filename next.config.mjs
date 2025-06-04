// next.config.mjs

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Required for static export
	// Optional: Set a base path if your GitHub Pages URL is like
	// https://yourusername.github.io/your-repo-name/
	// Replace 'your-repo-name' with the actual name of your GitHub repository
	basePath: isProd ? '/justdoit' : '', // Example: '/my-nextjs-app'

	// Optional: Add a trailing slash to all URLs. Can sometimes help with asset loading on static hosts.
	trailingSlash: true,

	// IMPORTANT: Images (if you're using next/image)
	// For static export, next/image requires you to configure unoptimized = true
	// OR define image domains. For GitHub Pages, unoptimized is usually easier.
	images: {
		unoptimized: true,
	},
	experimental: {
		serverActions: true,
	},

	// Your existing webpack, compiler, etc., configurations go here
	// webpack(config) {
	//   return config;
	// },
};

export default nextConfig;
