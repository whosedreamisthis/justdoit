export default function GoalSaveFooter({ selectedGoals, isSaving, onSave }) {
	return (
		<div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-300">
			<button
				disabled={isSaving || selectedGoals.length === 0}
				onClick={onSave}
				className="w-full bg-blue-600 text-white py-2 rounded-lg"
			>
				{isSaving ? 'Saving...' : 'Save Selected Goals'}
			</button>
		</div>
	);
}
