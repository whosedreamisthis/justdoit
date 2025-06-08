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
import { v4 as uuidv4 } from 'uuid';
import PageHelper, { sortGoals, preSetGoals } from '@/app/page-helper';
export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	const [goals, setGoals] = useState([]);
	const [lastDailyResetTime, setLastDailyResetTime] = useState(null);
	const goalsTabRef = useRef(null);
	const { user } = useUser();
	const email = user?.primaryEmailAddress?.emailAddress;
	// --- Helper function for consistent goal sorting ---

	// --- NEW: Centralized function to update goals, sort, and save ---
	// This function now correctly handles both direct array updates and functional updates.

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
			preSetGoals(
				(prevGoals) => {
					if (!prevGoals || prevGoals.length === 0) {
						console.warn('Skipping reset: No goals to update.');
						return prevGoals; // Prevent accidental wipe
					}

					const updatedGoals = prevGoals.map((goal) =>
						goal.isCompleted
							? { ...goal, progress: 0, isCompleted: false }
							: goal
					);

					return updatedGoals;
				},
				goals,
				setGoals
			);

			// Always set lastDailyResetTime to *today's* midnight after a reset
			setLastDailyResetTime(todayMidnight); // This will trigger the save useEffect for lastDailyResetTime
		}
	};
	useEffect(() => {
		console.log('App component mounted!');
	}, []);

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
			console.log(
				'preSetGoals(loadedGoals) X is updating goals:',
				loadedGoals
			);

			preSetGoals(loadedGoals, goals, setGoals);
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

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				console.log('App resumed—checking goals.');
				const storedGoals = JSON.parse(
					localStorage.getItem('userGoals')
				);
				if (
					goals.length === 0 &&
					storedGoals &&
					storedGoals.length > 0
				) {
					console.warn(
						'Goals disappeared—restoring from localStorage.'
					);
					setGoals(storedGoals);
				}
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => {
			document.removeEventListener(
				'visibilitychange',
				handleVisibilityChange
			);
		};
	}, [goals]);
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
	useEffect(() => {
		console.log('Goals state changed:', goals);
	}, [goals]);

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
		console.log('handleUpdateGoal ', goals);
		// --- MODIFIED: Use preSetGoals for all goal updates ---
		preSetGoals(
			(prevGoals) => {
				const updatedList = prevGoals.map((goal) =>
					goal.id === goalId ? { ...goal, ...updatedGoal } : goal
				);
				console.log('calling preSetGoals 1', updatedList);
				return updatedList; // preSetGoals will handle sorting
			},
			goals,
			setGoals
		);
	};

	const handleHabitSelect = async (habit) => {
		console.log('Received habit:', habit); // Debugging log
		if (!habit) {
			console.error('Habit is undefined when selecting!');
			return;
		}

		const newGoal = {
			id: uuidv4(),
			title: habit.title, // This is where the error happens
			description: habit.description || '', // Ensure it's defined
			color: habit.color || '#FFFFFF', // Default color if missing
			progress: 0,
			isCompleted: false,
			completedDays: {},
			createdAt: new Date().toISOString(),
		};

		preSetGoals((prevGoals) => [...prevGoals, newGoal], goals, setGoals);
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
							setGoals={setGoals} // Pass preSetGoals down for direct updates if needed (e.g., deletions)
							preSetGoals={preSetGoals} // Pass preSetGoals down for direct updates if needed (e.g., deletions)
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
