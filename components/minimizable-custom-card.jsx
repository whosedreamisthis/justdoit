import { useState } from 'react';
import { toast } from 'react-hot-toast'; // Ensure react-hot-toast is installed
import ColorSquares from './color-squares';
import styles from '@/styles/explore-card.module.css';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';

export default function MinimizableCustomCard({
	onSelect,
	isExpanded,
	onExpand,
}) {
	// State for custom habit details
	const [customTitle, setCustomTitle] = useState('');
	const [customDescription, setCustomDescription] = useState('');
	const [customColor, setCustomColor] = useState('#A7B39E'); // Default color

	// Function to add a new custom habit
	const handleAddCustomHabit = (e) => {
		e.stopPropagation();
		if (!customTitle.trim()) {
			// This toast will now always fire if title is empty
			toast.error('Please enter a title for your custom habit.');
			return; // Important: return after showing toast
		}

		// Create new custom habit
		const uniqueId = uuidv4();
		const newCustomHabit = {
			id: uniqueId,
			title: customTitle.trim(),
			color: customColor,
			description: customDescription.trim(),
		};

		// Check if `onSelect` exists before calling it
		if (typeof onSelect === 'function') {
			onSelect(newCustomHabit);
		} else {
			console.error('ERROR: onSelect function is missing!');
			toast.error('Failed to add habit: Handler missing.'); // Error toast for debugging
		}

		// Reset input fields after adding
		setCustomTitle('');
		setCustomDescription('');
		setCustomColor('#A7B39E'); // Reset to default color
		onExpand(); // Minimize the card after adding
	};

	return (
		<div
			className={`relative rounded-lg p-4 transition-all ${
				isExpanded
					? 'max-h-[500px] overflow-auto z-10'
					: 'max-h-32 overflow-hidden z-0 shadow-none'
			}`}
			style={{ backgroundColor: customColor }}
		>
			{/* Card Header */}
			<div onClick={() => onExpand()}>
				<h2 className="text-lg font-bold text-gray-800">
					Add a Custom Habit
				</h2>
				{!isExpanded && (
					<p className="text-gray-600 text-sm">
						Tap to create your own habit.
					</p>
				)}
			</div>

			{/* Expanded Content */}
			{isExpanded && (
				<div
					className="mt-4 text-gray-700 text-sm z-10"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Habit Title Input */}
					<div className="mb-3">
						<label
							htmlFor="custom-title"
							className="block text-sm font-medium text-gray-700"
						>
							Habit Title:
						</label>
						<input
							type="text"
							id="custom-title"
							value={customTitle}
							onChange={(e) => setCustomTitle(e.target.value)}
							onClick={(e) => e.stopPropagation()}
							className="text-lg text-gray-500 p-1 rounded w-full"
							style={{ backgroundColor: '#f0f0f0' }}
							placeholder="e.g., Learn Spanish"
						/>
					</div>

					{/* Description Input */}
					<div className="mb-4">
						<label
							htmlFor="custom-short-description"
							className="block text-sm font-medium text-gray-700"
						>
							Description (Optional):
						</label>
						<textarea
							id="custom-short-description"
							value={customDescription}
							onChange={(e) =>
								setCustomDescription(e.target.value)
							}
							onClick={(e) => e.stopPropagation()}
							rows="2"
							style={{ backgroundColor: '#f0f0f0' }}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
							placeholder="e.g., Practice for 15 minutes daily"
						></textarea>
					</div>

					{/* Color Selection */}
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700">
							Card Color:
						</label>
						<ColorSquares
							setColor={setCustomColor}
							selectedColor={customColor}
						/>
					</div>

					{/* Add Button */}
					<div className="flex flex-col h-full rounded-lg">
						<div className="flex flex-row justify-end items-end gap-2">
							<button
								className={`addButton`}
								// --- IMPORTANT CHANGE: REMOVE 'disabled' attribute ---
								// disabled={!customTitle.trim()} // <--- REMOVE THIS LINE
								onClick={handleAddCustomHabit}
							>
								Add
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
