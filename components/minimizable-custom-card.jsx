// components/minimizable-custom-card.jsx
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons'; // Assuming you still want this icon for the button

export default function MinimizableCustomCard({
	onSelect,
	isExpanded,
	onExpand,
}) {
	const [customTitle, setCustomTitle] = useState('');
	const [customShortDescription, setCustomShortDescription] = useState('');

	const handleAddCustomHabit = (e) => {
		e.stopPropagation(); // Prevent card from collapsing when button is clicked

		if (!customTitle.trim()) {
			alert('Please enter a title for your custom habit.');
			return;
		}

		const uniqueId = `custom-${Date.now()}`; // Ensure unique ID for new custom habits
		const newCustomHabit = {
			id: uniqueId,
			title: customTitle.trim(),
			color: '#FFFF99', // A pleasing custom color, you can change this
			shortDescription:
				customShortDescription.trim() || 'Your personalized habit.',
			detailedDescription: '', // No detailed description for custom habits initially
		};

		onSelect(newCustomHabit); // Pass the ID to onSelect, similar to other habits

		// Reset form fields after adding
		setCustomTitle('');
		setCustomShortDescription('');
		// Optionally, collapse the card after adding
		onExpand(); // This will toggle the expansion
	};

	return (
		<div
			className={`
                bg-custom-card-color rounded-lg p-4 cursor-pointer transition-all
                ${
					isExpanded
						? 'max-h-[500px] overflow-auto z-10'
						: 'max-h-32 overflow-hidden z-0 shadow-none'
				}
                border border-black
            `}
			style={{ backgroundColor: '#FFFF99' }} // Apply the custom color here
			onClick={() => onExpand()}
		>
			<h2 className="text-lg font-bold text-gray-800">
				Add a Custom Habit
			</h2>

			{!isExpanded && (
				<p className="text-gray-600 text-sm">
					Tap to create your own habit.
				</p>
			)}

			{isExpanded && (
				<div className="mt-4 text-gray-700 text-sm z-10">
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
							onClick={(e) => e.stopPropagation()} // Prevent card collapse
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
							placeholder="e.g., Learn Spanish"
						/>
					</div>
					<div className="mb-4">
						<label
							htmlFor="custom-short-description"
							className="block text-sm font-medium text-gray-700"
						>
							Short Description (Optional):
						</label>
						<textarea
							id="custom-short-description"
							value={customShortDescription}
							onChange={(e) =>
								setCustomShortDescription(e.target.value)
							}
							onClick={(e) => e.stopPropagation()} // Prevent card collapse
							rows="2"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
							placeholder="e.g., Practice for 15 minutes daily"
						></textarea>
					</div>

					<div className="flex flex-col h-full rounded-lg">
						<div className="add-button-container flex flex-row justify-end items-end gap-2">
							<button
								className="add-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center transition duration-300 ease-in-out transform hover:scale-105"
								onClick={handleAddCustomHabit}
							>
								<FontAwesomeIcon
									icon={faSquareCheck}
									className="mr-2"
								/>
								Add Habit
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
