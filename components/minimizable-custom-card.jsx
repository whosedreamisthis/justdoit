import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import ColorSquares from './color-squares';
export default function MinimizableCustomCard({
	onSelect,
	isExpanded,
	onExpand,
}) {
	const [customTitle, setCustomTitle] = useState('');
	const [customDescription, setCustomDescription] = useState('');
	const [customColor, setCustomColor] = useState('#A7B39E'); // Default to a pastel pink

	const handleAddCustomHabit = (e) => {
		e.stopPropagation();

		if (!customTitle.trim()) {
			toast.error('Please enter a title for your custom habit.');
			return;
		}

		const uniqueId = `custom-${Date.now()}`;
		const newCustomHabit = {
			id: uniqueId,
			title: customTitle.trim(),
			color: customColor,
			description: customDescription.trim() || 'Your personalized habit.',
		};

		onSelect(newCustomHabit);

		setCustomTitle('');
		setCustomDescription('');
		setCustomColor('#FFD1DC'); // Reset to default pastel pink after adding
		onExpand(); // Minimize the card after adding
		// toast.success(`"${newCustomHabit.title}" custom habit added!`);
	};

	// className={`
	//             ${goal.progress >= 100 ? 'completed-card' : 'card'}
	//             relative rounded-lg p-4 transition-all flex flex-col
	//             ${isExpanded ? 'h-auto' : 'h-25'}
	//         `}
	// style={{
	// 				backgroundColor: isEditing ? editedColor : goal.color,
	// 				overflow: 'visible',
	// 				borderRadius: '8px',
	// 			}}
	return (
		<div
			className={`
                relative rounded-lg p-4 transition-all
                ${
					isExpanded
						? 'max-h-[500px] overflow-auto z-10'
						: 'max-h-32 overflow-hidden z-0 shadow-none'
				}
                
            `}
			style={{ backgroundColor: customColor }}
		>
			{/* Card Header: Handles expand/minimize */}
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

			{/* Expanded Content: Stops propagation for internal interactions */}
			{isExpanded && (
				<div
					className="mt-4 text-gray-700 text-sm z-10"
					onClick={(e) => e.stopPropagation()}
				>
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

					{/* Display 16 pastel colors in a 2x8 grid */}
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700">
							Card Color:
						</label>
						<ColorSquares
							setColor={setCustomColor}
							selectedColor={customColor}
						/>
					</div>

					<div className="flex flex-col h-full rounded-lg">
						<div className="add-button-container flex flex-row justify-end items-end gap-2">
							{/* The add-button class is re-applied here */}
							<button
								className="add-button"
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
