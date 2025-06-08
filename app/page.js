// app/page.js
'use client';
import { useState, useEffect, useRef } from 'react';
import BottomTabs from '@/components/bottom-nav';
import habitsByCategory from '@/data/habits.json';
import ExploreTab from '@/components/explore-tab';
import GoalsTab from '@/components/goals-tab';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import ProfileTab from '@/components/profile-tab';
import '@/app/globals.css';
import StatsTab from '@/components/stats-tab';
import Header from '@/components/header';
import { saveQuery, fetchGoals } from '@/actions/ai'; // Updated: fetchGoals now used
import { useUser } from '@clerk/nextjs';

export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	const goalsTabRef = useRef(null);
	const { user } = useUser();
	const email = user?.primaryEmailAddress?.emailAddress;

	const [goals, setGoals] = useState([]);
	const [lastDailyResetTime, setLastDailyResetTime] = useState(null);

	// --- Helper function for consistent goal sorting ---
	const sortGoals = (goalsArray) => {
		const incomplete = goalsArray.filter((goal) => !goal.isCompleted);
		const completed = goalsArray.filter((goal) => goal.isCompleted);

		incomplete.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime()
		);
		completed.sort(
			(a, b) =>
				new Date(a.createdAt).getTime() -
				new Date(b.createdAt).getTime()
		);

		return [...incomplete, ...completed];
	};

	const preSetGoals = (update) => {
		let finalGoalsArray;
		if (typeof update === 'function') {
			finalGoalsArray = update(goals);
		} else {
			finalGoalsArray = update;
		}
		setGoals(sortGoals(finalGoalsArray));
	};

	// --- Load goals from the database instead of localStorage ---
	useEffect(() => {
		async function loadGoals() {
			if (!email) return;

			const response = await fetchGoals(email);
			if (response.ok) {
				preSetGoals(response.goals);
			} else {
				console.error('[ERROR] Could not load goals:', response.error);
			}
		}
		loadGoals();
	}, [email]);

	// --- Save goals to the database on update ---
	useEffect(() => {
		const saveToDatabase = async () => {
			if (!email || goals.length === 0) return;
			try {
				const result = await saveQuery(
					email,
					JSON.stringify(goals),
					lastDailyResetTime
				);
				if (!result.ok) {
					console.error('Failed to save goals:', result.error);
				}
			} catch (err) {
				console.error('Error calling saveQuery:', err);
			}
		};
		saveToDatabase();
	}, [goals, lastDailyResetTime]);

	const handleUpdateGoal = (goalId, updatedGoal) => {
		preSetGoals((prevGoals) =>
			prevGoals.map((goal) =>
				goal.id === goalId ? { ...goal, ...updatedGoal } : goal
			)
		);
	};

	const handleHabitSelect = async (habit) => {
		const newGoal = {
			id: habit.id + Date.now().toString(),
			title: habit.title,
			color: habit.color,
			description: habit.description,
			progress: 0,
			isCompleted: false,
			completedDays: {},
			createdAt: new Date().toISOString(),
		};

		preSetGoals((prevGoals) => [...prevGoals, newGoal]);

		if (email) {
			await saveQuery(email, JSON.stringify([...goals, newGoal]));
		}

		toast.success(`${habit.title} added as a goal!`);
	};

	return (
		<>
			<Toaster position="top-right" reverseOrder={false} />
			<Header />
			<div className="min-h-screen flex flex-col">
				<div className="flex-grow pb-20">
					{activeTab === 'goals' && (
						<GoalsTab
							ref={goalsTabRef}
							goals={goals}
							onUpdateGoal={handleUpdateGoal}
							setGoals={preSetGoals}
						/>
					)}
					{activeTab === 'explore' && (
						<ExploreTab
							habitsByCategory={habitsByCategory}
							onSelect={handleHabitSelect}
						/>
					)}
					{activeTab === 'stats' && <StatsTab goals={goals} />}
					{activeTab === 'profile' && <ProfileTab />}
				</div>
				<BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
			</div>
		</>
	);
}
