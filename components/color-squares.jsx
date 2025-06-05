import { useState } from 'react';

export default function ColorSquares({ setColor }) {
	// Define pastel colors inside this file
	const pastelColors = [
		'#FFD1DC', // Light Pink
		'#FFDAB9', // Peach Puff
		'#FFFACD', // Lemon Chiffon
		'#B6E8B6', // Soft Pistachio Green
		'#E0BBE4', // Lavender
		'#D3D3D3', // Light Gray
		'#EBF6D9', // Light Terracotta / Rose-Brown
		'#FFA07A', // Light Salmon
	];

	// Track selected color internally
	const [selectedColor, setSelectedColor] = useState(null);

	return (
		<div className="grid grid-cols-8 gap-4 mt-1">
			{pastelColors.map((color, index) => (
				<div
					key={index}
					className={`w-8 h-8 rounded-md cursor-pointer border-2 ${
						selectedColor === color
							? 'border-gray-500'
							: 'border-gray-300'
					}`}
					style={{ backgroundColor: color }}
					onClick={(e) => {
						e.stopPropagation();
						setSelectedColor(color); // Track selected color internally
						setColor(color); // Pass selected color to parent component
					}}
					title={color}
				></div>
			))}
		</div>
	);
}
