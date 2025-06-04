import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

export default function MinimizableCustomCard({
	onSelect,
	isExpanded,
	onExpand,
}) {
	const [customTitle, setCustomTitle] = useState('');
	const [customShortDescription, setCustomShortDescription] = useState('');
	const [customColor, setCustomColor] = useState('#FFFF99');

	const colorInputRef = useRef(null); // Ref for the hidden color input

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
			shortDescription:
				customShortDescription.trim() || 'Your personalized habit.',
			detailedDescription: '',
		};

		onSelect(newCustomHabit);

		setCustomTitle('');
		setCustomShortDescription('');
		setCustomColor('#FFFF99');
		onExpand();
		toast.success(`"${newCustomHabit.title}" custom habit added!`);
	};

	return (
		<div
			className={`
                rounded-lg p-4 transition-all
                ${
					isExpanded
						? 'max-h-[500px] overflow-auto z-10'
						: 'max-h-32 overflow-hidden z-0 shadow-none'
				}
                border border-black
            `}
			style={{ backgroundColor: customColor }}
			// Removed onClick from here, it's now on the header div below
		>
			{/* Card Header: Handles expand/minimize */}
			<div className="cursor-pointer" onClick={() => onExpand()}>
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
							onClick={(e) => e.stopPropagation()}
							rows="2"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
							placeholder="e.g., Practice for 15 minutes daily"
						></textarea>
					</div>

					<div className="mb-4">
						<label
							htmlFor="custom-color"
							className="block text-sm font-medium text-gray-700"
						>
							CardColor:
						</label>
						<div className="flex items-center gap-2">
							{/* Clickable color swatch */}
							<div
								className="w-8 h-8 border border-gray-300 rounded-md cursor-pointer"
								style={{ backgroundColor: customColor }}
								onClick={(e) => {
									e.stopPropagation();
									colorInputRef.current.click(); // Programmatically click the hidden input
								}}
							></div>
							{/* Original input, now hidden */}
							<input
								ref={colorInputRef}
								type="color"
								id="custom-color"
								value={customColor}
								onChange={(e) => {
									e.stopPropagation();
									setCustomColor(e.target.value);
								}}
								onClick={(e) => e.stopPropagation()}
								className="hidden"
								title="Choose your custom habit card color"
							/>
						</div>
					</div>

					{isExpanded && (
						<div className="flex flex-col h-full rounded-lg">
							<div className="add-button-container flex flex-row justify-end items-end gap-2">
								<button
									className="add-button"
									onClick={handleAddCustomHabit}
								>
									Add
								</button>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
