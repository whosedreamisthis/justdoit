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
import Header from '@/components/header'; // Import the new Header component
import { saveQuery } from '@/actions/ai';
export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	const goalsTabRef = useRef(null);

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

	// --- MODIFIED: Initialize with empty array/null, load from localStorage in useEffect ---
	const [goals, setGoals] = useState([]);
	const [lastDailyResetTime, setLastDailyResetTime] = useState(null);

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

		// Convert lastDailyResetTime to a "midnight" date for comparison, if it exists
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

		// Condition for reset:
		// 1. lastResetDate exists AND is from a day *before* today (i.e., less than todayMidnight)
		// OR
		// 2. lastResetDate does NOT exist (first time opening app or localStorage cleared)
		const shouldReset =
			!lastResetDate || lastResetDate.getTime() < todayMidnight.getTime();

		if (shouldReset) {
			console.log('Midnight Reset Triggered or First Time Reset!');

			setGoals((prevGoals) => {
				const updatedGoals = prevGoals.map((goal) =>
					goal.isCompleted // Only reset goals that were completed yesterday or earlier
						? { ...goal, progress: 0, isCompleted: false }
						: goal
				);

				const sortedGoals = sortGoals(updatedGoals);
				localStorage.setItem('userGoals', JSON.stringify(sortedGoals));

				// Always set lastDailyResetTime to *today's* midnight after a reset
				setLastDailyResetTime(todayMidnight);
				localStorage.setItem(
					'lastDailyResetTime',
					todayMidnight.toISOString()
				);

				return sortedGoals;
			});
		}
	};

	// --- useEffect for loading initial state from localStorage (client-side only) ---
	useEffect(() => {
		const storedGoals = JSON.parse(localStorage.getItem('userGoals'));
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
			setGoals(sortGoals(loadedGoals));
		}

		const storedTime = localStorage.getItem('lastDailyResetTime');
		if (storedTime) {
			setLastDailyResetTime(new Date(storedTime));
		} else {
			// If no lastDailyResetTime is found, initialize it to prevent skipping first reset
			// This ensures checkAndResetDailyGoals runs on first app open
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
	}, []); // Empty dependency array: runs once on client mount

	// --- useEffect to run reset check whenever lastDailyResetTime changes ---
	useEffect(() => {
		// This effect will now trigger checkAndResetDailyGoals when lastDailyResetTime is set
		// (either initially from localStorage, or after a reset)
		if (lastDailyResetTime) {
			// Only run if lastDailyResetTime has been initialized
			checkAndResetDailyGoals();
		}
	}, [lastDailyResetTime]); // Dependency: lastDailyResetTime

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
	}, []); // Empty dependency array: runs once on mount/unmount

	// --- Existing useEffect for scrolling to top on tab change ---
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [activeTab]);

	// --- Existing useEffect for saving goals and lastDailyResetTime to localStorage ---
	useEffect(() => {
		// This effect runs on *every* change to goals or lastDailyResetTime.
		localStorage.setItem('userGoals', JSON.stringify(goals));
		if (lastDailyResetTime) {
			localStorage.setItem(
				'lastDailyResetTime',
				lastDailyResetTime.toISOString()
			);
		}
	}, [goals, lastDailyResetTime]);

	const handleUpdateGoal = (goalId, updatedGoal) => {
		// Step 1: Capture "First" positions immediately BEFORE the state update that causes reordering.
		if (activeTab === 'goals' && goalsTabRef.current?.snapshotPositions) {
			goalsTabRef.current.snapshotPositions();
		}

		// Step 2: Update the state with the goal's new properties AND the *new sorted order* simultaneously.
		setGoals((prevGoals) => {
			const updatedList = prevGoals.map((goal) =>
				goal.id === goalId ? { ...goal, ...updatedGoal } : goal
			);
			return sortGoals(updatedList);
		});

		// Removed the setTimeout block for scrollIntoView
	};

	const handleHabitSelect = (habit) => {
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

		setGoals((prevGoals) => {
			const updatedGoals = [...prevGoals, newGoal];
			return sortGoals(updatedGoals);
		});

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
							onReSort={() => {}}
							onUpdateGoal={handleUpdateGoal}
							setGoals={setGoals}
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
