// app/page.js
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
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
import { saveQuery, loadQueriesByEmail } from '@/actions/ai';
import { useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import PageHelper, {
	sortGoals,
	preSetGoals,
	restoreGoal,
} from '@/app/page-helper';

export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	const [goals, setGoals] = useState([]);
	const [lastDailyResetTime, setLastDailyResetTime] = useState(null);
	const goalsTabRef = useRef(null);
	const { user } = useUser();
	const [userEmail, setUserEmail] = useState(null);

	const email = user?.primaryEmailAddress?.emailAddress;

	const checkAndResetDailyGoals = useCallback(() => {
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

			preSetGoals(
				(prevGoals) => {
					if (!prevGoals || prevGoals.length === 0) {
						console.warn('Skipping reset: No goals to update.');
						return prevGoals;
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

			setLastDailyResetTime(todayMidnight);
		}
	}, [lastDailyResetTime, goals]);

	useEffect(() => {
		console.log('App component mounted!');
	}, []);
	console.log('Current email value:', email);
	useEffect(() => {
		if (email && email !== userEmail) {
			setUserEmail(email);
		}
	}, [email]);
	useEffect(() => {
		console.log(
			'userEmail dependency changed. Current userEmail:',
			userEmail
		);
		console.log('Current email value:', userEmail); // ADD THIS LINE
		if (!userEmail) {
			console.log('email is falsy, returning early from useEffect.'); // ADD THIS LINE
			return;
		}
		console.log('HOW MANY TIMES AM I BEING CALLED');
		// ... rest of your code
	}, [userEmail]);
	useEffect(() => {
		if (!email) return;
		console.log('HOW MANY TIMES AM I BEING CALLED');
		const fetchData = async () => {
			console.log('2 Loaded goals from database:', email);
			try {
				// Add a log right before calling loadQueriesByEmail
				console.log(
					'Attempting to call loadQueriesByEmail with email:',
					email
				);
				const response = await loadQueriesByEmail(email);
				console.log(
					'3 Loaded goals from database: Response received:',
					response
				);
			} catch (error) {
				console.log(
					'Entering catch block for loadQueriesByEmail error...'
				);
				console.error('Error loading queries:', error);
			}
		};
		// console.log('1 Loaded goals from database:');
		// //localStorage.setItem('userGoals', JSON.stringify([]));
		fetchData().catch((error) =>
			console.log('Caught error from fetchData:', error)
		);
	}, [userEmail, email]);
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
			console.log(
				'preSetGoals(loadedGoals) is updating goals:',
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

	// --- New: Listen for browser tab visibility changes (user returns to tab) ---
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				console.log(
					'Tab became visible. Checking for daily reset and restoring goals...'
				);

				// Restore goals from localStorage regardless of current in-memory state
				const storedGoals = JSON.parse(
					localStorage.getItem('userGoals')
				);
				if (storedGoals && storedGoals.length > 0) {
					console.log(
						'Restoring goals from localStorage on visibility change.'
					);
					const loadedGoals = storedGoals.map((goal) => ({
						...goal,
						isCompleted:
							typeof goal.isCompleted === 'boolean'
								? goal.isCompleted
								: goal.progress >= 100,
						completedDays: goal.completedDays || {},
						createdAt: goal.createdAt || new Date().toISOString(),
					}));
					preSetGoals(loadedGoals, goals, setGoals);
				} else if (!storedGoals || storedGoals.length === 0) {
					// If localStorage is empty, ensure the in-memory goals are also empty
					if (goals.length > 0) {
						console.log('Clearing goals as localStorage is empty.');
						setGoals([]);
					}
				}

				// Also re-check and reset daily goals
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
	}, [goals, checkAndResetDailyGoals]); // Added goals to dependencies here to ensure latest state for restoration check

	// --- useEffect to run reset check whenever lastDailyResetTime changes ---
	useEffect(() => {
		if (lastDailyResetTime) {
			checkAndResetDailyGoals();
		}
	}, [lastDailyResetTime, checkAndResetDailyGoals]); // Added checkAndResetDailyGoals to dependencies

	// --- Existing useEffect for scrolling to top on tab change ---
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [activeTab]);

	useEffect(() => {
		console.log('Goals state changed:', goals);
	}, [goals]);

	// --- Existing useEffect for saving goals to localStorage and database ---
	useEffect(() => {
		if (goals.length > 0) {
			console.log('Saving goals to local storage:', goals);
			localStorage.setItem('userGoals', JSON.stringify(goals));
		} else {
			console.log(
				'Goals array is empty, removing userGoals from localStorage.'
			);
			localStorage.removeItem('userGoals');
		}

		const saveGoalsToDatabase = async () => {
			if (!user) return;
			const currentEmail = user.primaryEmailAddress?.emailAddress;
			if (!currentEmail) return;

			try {
				console.log('Saving goals to database:', goals);
				const result = await saveQuery(
					currentEmail,
					JSON.stringify(goals),
					lastDailyResetTime ? lastDailyResetTime.toISOString() : null
				);
				if (!result.ok) {
					console.error('Failed to save goals:', result.error);
				}
			} catch (err) {
				console.error('Error calling saveQuery for goals:', err);
			}
		};

		// Uncomment the following lines when you are ready to enable database saving
		if (user && goals.length > 0) {
			saveGoalsToDatabase();
		}
	}, [goals, user, lastDailyResetTime]); // Added lastDailyResetTime to dependencies here as it's passed to saveQuery

	// --- Existing useEffect for saving lastDailyResetTime to localStorage and database ---
	useEffect(() => {
		if (lastDailyResetTime) {
			console.log(
				'Saving lastDailyResetTime to local storage:',
				lastDailyResetTime
			);
			localStorage.setItem(
				'lastDailyResetTime',
				lastDailyResetTime.toISOString()
			);
		} else {
			console.log(
				'lastDailyResetTime is null, removing from localStorage.'
			);
			localStorage.removeItem('lastDailyResetTime');
		}

		const saveLastResetTimeToDatabase = async () => {
			if (!user) return;
			const currentEmail = user.primaryEmailAddress?.emailAddress;
			if (!currentEmail) return;

			try {
				console.log(
					'Saving lastDailyResetTime to database:',
					lastDailyResetTime
				);
				const result = await saveQuery(
					currentEmail,
					JSON.stringify(goals), // Ensure goals are also sent if you save them together
					lastDailyResetTime ? lastDailyResetTime.toISOString() : null
				);
				if (!result.ok) {
					console.error(
						'Failed to save lastDailyResetTime:',
						result.error
					);
				}
			} catch (err) {
				console.error(
					'Error calling saveQuery for lastDailyResetTime:',
					err
				);
			}
		};

		// Uncomment the following lines when you are ready to enable database saving
		// if (user) { // No need to check goals.length here, as lastDailyResetTime can exist independently
		//     saveLastResetTimeToDatabase();
		// }
	}, [lastDailyResetTime, user, goals]); // Added goals to dependencies here as it's passed to saveQuery

	const handleUpdateGoal = (goalId, updatedGoal) => {
		if (activeTab === 'goals' && goalsTabRef.current?.snapshotPositions) {
			goalsTabRef.current.snapshotPositions();
		}
		console.log('handleUpdateGoal ', goals);
		preSetGoals(
			(prevGoals) => {
				const updatedList = prevGoals.map((goal) =>
					goal.id === goalId ? { ...goal, ...updatedGoal } : goal
				);
				console.log('calling preSetGoals 1', updatedList);
				return updatedList;
			},
			goals,
			setGoals
		);
	};

	const handleHabitSelect = async (habit) => {
		console.log('Received habit:', habit);
		if (!habit) {
			console.error('Habit is undefined when selecting!');
			return;
		}

		const restoredCompletedDays = restoreGoal(habit.title);

		const newGoal = {
			id: uuidv4(),
			title: habit.title,
			description: habit.description || '',
			color: habit.color || '#FFFFFF',
			progress: 0,
			isCompleted: false,
			completedDays: restoredCompletedDays,
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
							onReSort={() => {}}
							onUpdateGoal={handleUpdateGoal}
							setGoals={setGoals}
							preSetGoals={preSetGoals}
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
