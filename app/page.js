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
import { saveQuery } from '@/actions/ai';
import { useUser } from '@clerk/nextjs';
export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	const goalsTabRef = useRef(null);
	const { user } = useUser();
	const email = user?.primaryEmailAddress?.emailAddress;
	// --- Helper function for consistent goal sorting ---
	const sortGoals = (goalsArray) => {
		console.log('SORT GOALS', goalsArray);
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

	const [goals, setGoals] = useState([]);
	const [lastDailyResetTime, setLastDailyResetTime] = useState(null);

	// --- NEW: Centralized function to update goals, sort, and save ---
	// This function now correctly handles both direct array updates and functional updates.
	const preSetGoals = (update) => {
		console.log('Inside preSetGoals - Received update:', update);

		let finalGoalsArray;

		// If 'update' is a function (e.g., (prevGoals) => [...prevGoals, newGoal]),
		// call it with the current goals state to get the new array.
		if (typeof update === 'function') {
			finalGoalsArray = update(goals); // Pass the current 'goals' state to the updater function
		} else {
			// Otherwise, 'update' is already the new goals array.
			finalGoalsArray = update;
		}

		// Sort the final array before setting the state.
		const sortedGoals = sortGoals(finalGoalsArray);
		console.log('Updating goals state:', sortedGoals);
		setGoals(sortedGoals);
		// The useEffect for saving to localStorage will automatically handle persistence
		// because `setGoals` was called.
	};

	// --- NEW: Function to handle daily goal reset logic ---
	const checkAndResetDailyGoals = () => {
		const now = new Date();
		const todayMidnight = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			0,
			0,
			0
		);

		const lastResetDate = lastDailyResetTime
			? new Date(
					lastDailyResetTime.getFullYear(),
					lastDailyResetTime.getMonth(),
					lastDailyResetTime.getDate(),
					0,
					0,
					0
			  )
			: null;

		const shouldReset =
			!lastResetDate || lastResetDate.getTime() < todayMidnight.getTime();

		if (shouldReset) {
			console.log('Midnight Reset Triggered or First Time Reset!');

			// Use preSetGoals here to ensure sorting and eventual saving
			// preSetGoals receives the functional update and handles the rest.
			preSetGoals((prevGoals) => {
				const updatedGoals = prevGoals.map((goal) =>
					goal.isCompleted
						? { ...goal, progress: 0, isCompleted: false }
						: goal
				);
				console.log('PRESETGOALS', updatedGoals);
				return updatedGoals; // preSetGoals will then sort these
			});

			// Always set lastDailyResetTime to *today's* midnight after a reset
			setLastDailyResetTime(todayMidnight); // This will trigger the save useEffect for lastDailyResetTime
		}
	};

	// --- useEffect for loading initial state from localStorage (client-side only) ---
	useEffect(() => {
		const storedGoals = JSON.parse(localStorage.getItem('userGoals'));
		console.log('Loaded goals from localStorage:', storedGoals);
		if (storedGoals && storedGoals.length > 0) {
			const loadedGoals = storedGoals.map((goal) => ({
				...goal,
				isCompleted:
					typeof goal.isCompleted === 'boolean'
						? goal.isCompleted
						: goal.progress >= 100,
				completedDays: goal.completedDays || {},
				createdAt: goal.createdAt || new Date().toISOString(),
			}));
			// Use preSetGoals for initial load as well.
			// It will sort and then call setGoals, which triggers the saving useEffect.
			preSetGoals(loadedGoals);
		}

		const storedTime = localStorage.getItem('lastDailyResetTime');
		if (storedTime) {
			setLastDailyResetTime(new Date(storedTime));
		} else {
			setLastDailyResetTime(
				new Date(
					new Date().getFullYear(),
					new Date().getMonth(),
					new Date().getDate(),
					0,
					0,
					0
				)
			);
		}
	}, []);

	// --- useEffect to run reset check whenever lastDailyResetTime changes ---
	useEffect(() => {
		if (lastDailyResetTime) {
			checkAndResetDailyGoals();
		}
	}, [lastDailyResetTime]);

	// --- New: Listen for browser tab visibility changes (user returns to tab) ---
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				console.log('Tab became visible. Checking for daily reset...');
				checkAndResetDailyGoals();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener(
				'visibilitychange',
				handleVisibilityChange
			);
		};
	}, []);

	// --- Existing useEffect for scrolling to top on tab change ---
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [activeTab]);

	// --- Existing useEffect for saving goals and lastDailyResetTime to localStorage ---
	// This effect runs on *every* change to goals or lastDailyResetTime
	// and serves as the single point of persistence to localStorage.
	useEffect(() => {
		if (goals.length > 0) {
			// Ensure we never store an empty array
			console.log('Saving goals to local storage:', goals);
			localStorage.setItem('userGoals', JSON.stringify(goals));
		}

		const saveToDatabase = async () => {
			if (!user) return; // Wait until Clerk loads
			const email = user.primaryEmailAddress?.emailAddress;
			if (!email) return;

			try {
				console.log('Saving goals to database:', goals);
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

		// if (user && goals.length > 0) {
		// 	saveToDatabase();
		// }
	}, [goals]);

	useEffect(() => {
		if (lastDailyResetTime) {
			console.log(
				'Saving lastDailyResetTime  to local storage:',
				lastDailyResetTime
			);
			localStorage.setItem(
				'lastDailyResetTime',
				lastDailyResetTime.toISOString()
			);
		}

		const saveToDatabase = async () => {
			if (!user) return; // Wait until Clerk loads
			const email = user.primaryEmailAddress?.emailAddress;
			if (!email) return;

			try {
				console.log('Saving lastDailyResetTime to database:', goals);
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

		// if (user && goals.length > 0) {
		// 	saveToDatabase();
		// }
	}, [lastDailyResetTime]);

	const handleUpdateGoal = (goalId, updatedGoal) => {
		// Step 1: Capture "First" positions immediately BEFORE the state update that causes reordering.
		if (activeTab === 'goals' && goalsTabRef.current?.snapshotPositions) {
			goalsTabRef.current.snapshotPositions();
		}

		// --- MODIFIED: Use preSetGoals for all goal updates ---
		preSetGoals((prevGoals) => {
			const updatedList = prevGoals.map((goal) =>
				goal.id === goalId ? { ...goal, ...updatedGoal } : goal
			);
			return updatedList; // preSetGoals will handle sorting
		});
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

		// --- MODIFIED: Use preSetGoals for all goal additions ---
		preSetGoals((prevGoals) => [...prevGoals, newGoal]);

		if (user) {
			const email = user.primaryEmailAddress?.emailAddress;
			if (email) {
				await saveQuery(email, JSON.stringify([...goals, newGoal]));
			}
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
							onReSort={() => {}} // Can likely be removed as preSetGoals handles sorting
							onUpdateGoal={handleUpdateGoal}
							setGoals={preSetGoals} // Pass preSetGoals down for direct updates if needed (e.g., deletions)
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
