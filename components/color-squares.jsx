import { useState } from 'react';

export default function ColorSquares({ setColor, selectedColor }) {
	// Define pastel colors inside this file
	const pastelColors = [
		'#FFB6C1', // Cherry Blossom Pink
		'#FFCC99', // Rich Peach
		'#FFEF99', // Sunny Yellow
		'#A2D99F', // Vibrant Pistachio
		'#CBB6EA', // Deep Lavender
		'#B0B0B0', // Medium Light Gray
		'#E0A37F', // True Light Terracotta
		'#FF8C69', // Bright Salmon
		'#E5D5A5', // Pale Gold/Khaki
		'#AE9AD3', // Saturated Pastel Purple
		'#FFD99B', // Warm Gold Cream
		'#B58BB5', // Deeper Lilac
		'#EBE0D0', // Soft Creamy Beige
		'#E5C9D7', // Muted Rose-Violet (replaces a similar yellow/cream)
		'#F5B2D2', // Bright Cotton Candy
		'#BFFFC6', // Clear Mint Green
		'#EE98B2', // Rich Baby Pink
		'#D0D0D0', // Defined Light Gray
		'#C98E8E', // Deep Rose Beige
		'#FF9933', // Vibrant Pastel Orange
		'#B8B8A0', // Warm Sand
		'#FFD479', // Warm Goldenrod Pastel
		'#C7D4B6',
		'#A2D4B6', // Muted Sage Green
	];

	// Track selected color internally
	// const [selectedColor, setSelectedColor] = useState(null);

	return (
		<div className="grid grid-cols-8 gap-4 mt-1 mb-5">
			{pastelColors.map((color, index) => (
				<div
					key={index}
					className={`w-6 h-6 rounded-md border-1 p-3 gap-5 ${
						selectedColor === color
							? 'border-gray-600'
							: 'border-gray-300'
					}`}
					style={{ backgroundColor: color, userSelect: 'none' }}
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						e.target.blur();
						setColor(color); // Pass selected color to parent component
					}}
					tabIndex="-1"
					title={color}
				></div>
			))}
		</div>
	);
}
