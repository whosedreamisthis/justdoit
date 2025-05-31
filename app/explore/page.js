import React from 'react';
import HabitSelectionGrid from '@/components/habit-selection-grid';
// Main App component that renders the MinimizableCard
export default function Page() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4 font-sans">
			<HabitSelectionGrid />
		</div>
	);
}
