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

export default function App() {
	const [activeTab, setActiveTab] = useState('explore');

	const goalsTabRef = useRef(null); // Ref to the GoalsTab component

	// --- Helper function for consistent goal sorting ---
	const sortGoals = (goalsArray) => {
		const incomplete = goalsArray.filter((goal) => !goal.isCompleted);
		const completed = goalsArray.filter((goal) => goal.isCompleted);

		// Sort incomplete goals: Newest first (descending createdAt)
		incomplete.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime()
		);

		// Sort completed goals: Oldest first (ascending createdAt)
		completed.sort(
			(a, b) =>
				new Date(a.createdAt).getTime() -
				new Date(b.createdAt).getTime()
		);

		// Concatenate to put incomplete goals first, then completed goals
		return [...incomplete, ...completed];
	};

	const [goals, setGoals] = useState([]);
	const [lastDailyResetTime, setLastDailyResetTime] = useState(null);

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
		}
	}, []); // Empty dependency array: runs once on client mount

	// --- Existing useEffect for scrolling to top on tab change ---
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [activeTab]);

	// --- Existing useEffect for daily reset logic ---
	useEffect(() => {
		if (!lastDailyResetTime) return;

		const now = new Date();
		const midnight = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			0,
			0,
			0
		);

		if (
			now.getTime() > midnight.getTime() &&
			lastDailyResetTime.getTime() < midnight.getTime()
		) {
			console.log('Midnight Reset Triggered!');

			setGoals((prevGoals) => {
				const updatedGoals = prevGoals.map((goal) =>
					goal.isCompleted
						? { ...goal, progress: 0, isCompleted: false }
						: goal
				);

				const sortedGoals = sortGoals(updatedGoals);
				localStorage.setItem('userGoals', JSON.stringify(sortedGoals));
				setLastDailyResetTime(midnight);
				localStorage.setItem(
					'lastDailyResetTime',
					midnight.toISOString()
				);

				return sortedGoals;
			});
		}
	}, [lastDailyResetTime]);

	// --- Existing useEffect for saving goals and lastDailyResetTime to localStorage ---
	useEffect(() => {
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
		// This is the CRUCIAL step for FLIP. It must happen *before* setGoals is called with the new order.
		if (activeTab === 'goals' && goalsTabRef.current?.snapshotPositions) {
			goalsTabRef.current.snapshotPositions();
		}

		// Step 2: Update the state with the goal's new properties AND the *new sorted order* simultaneously.
		// This is the "Last" step for FLIP. React will then re-render, and the FLIP
		// animation library (if correctly implemented in GoalsTab's useLayoutEffect)
		// should animate the movement from the "First" position to this "Last" position.
		setGoals((prevGoals) => {
			const updatedList = prevGoals.map((goal) =>
				goal.id === goalId ? { ...goal, ...updatedGoal } : goal
			);
			return sortGoals(updatedList); // Apply the consistent sort here
		});

		// Step 3: Trigger scrollIntoView after the FLIP animation has had time to complete.
		// This delay should be at least as long as your FLIP animation duration.
		// A typical CSS transition for FLIP is 300ms, so 350ms gives a small buffer.
		// Adjust this delay based on your actual animation duration
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
