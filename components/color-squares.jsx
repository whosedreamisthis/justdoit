import { useState } from 'react';

export default function ColorSquares({ setColor, selectedColor }) {
	// Define pastel colors inside this file
	const pastelColors = [
		'#FFD1DC', // Light Pink
		'#FFDAB9', // Peach Puff
		'#FFFACD', // Lemon Chiffon
		'#B6E8B6', // Soft Pistachio Green
		'#E0BBE4', // Lavender
		'#D3D3D3', // Light Gray
		'#EBF6D9', // Light Terracotta
		'#FFA07A', // Light Salmon
		'#C8F5B8', // Soft Sky Blue
		'#C3B1E1', // Pastel Purple
		'#FFDEAD', // Navajo White
		'#C8A2C8', // Lilac
		'#E6E6FA', // Lavender Mist
		'#FFDAB9', // Light Apricot
		'#FAE7B5', // Buttermilk
		'#F8C8DC', // Cotton Candy Pink
		'#E0F8EC', // Mint Green
		'#F4A7B9', // Baby Pink
		'#E5E5E5', // Off White
		'#D4A5A5', // Rose Beige
		'#FFB347', // Pastel Orange
		'#CFCFC4', // Soft Sand
		'#FFE5B4', // Peach Cream
		'#ACE1AF', // Celadon Green
	];

	// Track selected color internally
	// const [selectedColor, setSelectedColor] = useState(null);

	return (
		<div className="grid grid-cols-8 gap-4 mt-1">
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
