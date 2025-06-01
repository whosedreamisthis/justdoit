'use client';

import { useState } from 'react';

export default function GoalTracker({ totalSegments = 8 }) {
	const [filledSegments, setFilledSegments] = useState(
		Array(totalSegments).fill(false)
	);

	const handleSegmentTap = (event) => {
		const svg = document.getElementById('goal-tracker-svg'); // Explicitly get the SVG element
		if (!svg) return; // Prevent errors if reference fails

		const rect = svg.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const clickX = event.clientX - centerX;
		const clickY = event.clientY - centerY;

		const angle = Math.atan2(clickY, clickX) * (180 / Math.PI);
		const adjustedAngle = (angle + 360 + 90) % 360; // Normalize angle

		const segmentIndex = Math.floor(adjustedAngle / (360 / totalSegments));

		setFilledSegments((prev) =>
			prev.map((filled, i) => (i === segmentIndex ? !filled : filled))
		);
	};

	return (
		<svg
			id="goal-tracker-svg"
			width="80"
			height="80"
			viewBox="0 0 100 100"
			className="cursor-pointer"
			onClick={handleSegmentTap}
		>
			{Array.from({ length: totalSegments }).map((_, i) => {
				const angle = i * (360 / totalSegments) - 90;
				return (
					<path
						key={i}
						d={`M50,50 L${
							50 + 40 * Math.cos((Math.PI * angle) / 180)
						},${50 + 40 * Math.sin((Math.PI * angle) / 180)} 
                A40,40 0 0,1 ${
					50 +
					40 *
						Math.cos(
							(Math.PI * (angle + 360 / totalSegments)) / 180
						)
				},${
							50 +
							40 *
								Math.sin(
									(Math.PI * (angle + 360 / totalSegments)) /
										180
								)
						} Z`}
						fill={filledSegments[i] ? 'blue' : 'lightgray'}
						stroke="white"
						strokeWidth="2"
						onClick={(e) => {
							e.stopPropagation();
							handleSegmentTap(i);
						}}
					/>
				);
			})}
		</svg>
	);
}
