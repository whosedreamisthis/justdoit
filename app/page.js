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
import { saveQuery, loadQueriesByEmail } from '@/actions/ai'; // Correct path to your actions
import { useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import PageHelper, {
	sortGoals,
	preSetGoals,
	restoreGoal,
} from '@/app/page-helper';

export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	const [goals, setGoals] = useState([]); // Initialized as an empty array
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

	useEffect(() => {
		if (email && email !== userEmail) {
			setUserEmail(email);
		}
	}, [email, userEmail]); // Depend on both email and userEmail state

	// Consolidate the two useEffects related to fetching data by userEmail/email
	// into one to manage the data fetching lifecycle clearly.
	useEffect(() => {
		// Only proceed if userEmail is set and not null
		if (!userEmail) {
			console.log(
				'User email not available, returning early from data fetch useEffect.'
			);
			return;
		}

		console.log('Attempting to fetch goals for email:', userEmail);

		const fetchData = async () => {
			try {
				const response = await loadQueriesByEmail(userEmail); // Use userEmail here
				console.log('Full response from loadQueriesByEmail:', response);

				if (
					response.ok &&
					response.queries &&
					response.queries.length > 0
				) {
					const firstQuery = response.queries[0]; // Get the first query object

					// IMPORTANT: Check if firstQuery exists and has a 'goals' property
					if (firstQuery && Array.isArray(firstQuery.goals)) {
						setGoals(firstQuery.goals); // Set the goals array
						console.log(
							'Goals loaded and set successfully:',
							firstQuery.goals
						);
					} else {
						// Handle case where 'goals' property is missing or not an array
						console.warn(
							"First query object is missing or 'goals' property is not an array. Setting goals to empty.",
							firstQuery
						);
						setGoals([]);
					}
				} else {
					// No queries found or API error
					console.log(
						'No queries found for this email or API error:',
						response.error
					);
					setGoals([]); // Ensure goals are an empty array
					if (response.error) {
						toast.error(`Error loading goals: ${response.error}`);
					}
				}
			} catch (error) {
				console.error('Caught error during loadQueriesByEmail:', error);
				setGoals([]); // Ensure goals are an empty array on error
				toast.error('Failed to load goals due to a network error.');
			}
		};

		fetchData();
	}, [userEmail]); // This effect depends only on `userEmail`

	// --- useEffect for loading initial state from localStorage (client-side only) ---
	// This useEffect should run once on mount to populate state from localStorage.
	// It should ideally run *before* the database fetch if localStorage is your primary cache.
	// However, if you want database to always override, then its placement here is fine.
	// Ensure that if storedGoals is null/undefined, it defaults to an empty array before map.
	useEffect(() => {
		/*const storedGoalsString = localStorage.getItem('userGoals');
		const storedGoals = storedGoalsString
			? JSON.parse(storedGoalsString)
			: []; // Default to empty array if null

		console.log('Loaded goals from localStorage:', storedGoals);

		// Crucial check: Ensure storedGoals is an array before mapping
		if (Array.isArray(storedGoals) && storedGoals.length > 0) {
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
				'preSetGoals(loadedGoals) is updating goals from localStorage:',
				loadedGoals
			);
			preSetGoals(loadedGoals, goals, setGoals); // Pass loadedGoals directly
		} else {
			console.log(
				'No goals in localStorage or not an array. Starting with empty goals.'
			);
			// No need to setGoals([]) here as it's initialized to [] and the database fetch will handle it.
		}*/

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
	}, []); // Runs only once on component mount

	// --- New: Listen for browser tab visibility changes (user returns to tab) ---
	useEffect(() => {
		// const handleVisibilityChange = () => {
		// 	if (document.visibilityState === 'visible') {
		// 		console.log(
		// 			'Tab became visible. Checking for daily reset and restoring goals...'
		// 		);
		// 		const storedGoalsString = localStorage.getItem('userGoals');
		// 		const storedGoals = storedGoalsString
		// 			? JSON.parse(storedGoalsString)
		// 			: [];
		// 		if (Array.isArray(storedGoals) && storedGoals.length > 0) {
		// 			console.log(
		// 				'Restoring goals from localStorage on visibility change.'
		// 			);
		// 			const loadedGoals = storedGoals.map((goal) => ({
		// 				...goal,
		// 				isCompleted:
		// 					typeof goal.isCompleted === 'boolean'
		// 						? goal.isCompleted
		// 						: goal.progress >= 100,
		// 				completedDays: goal.completedDays || {},
		// 				createdAt: goal.createdAt || new Date().toISOString(),
		// 			}));
		// 			preSetGoals(loadedGoals, goals, setGoals);
		// 		} else if (
		// 			!Array.isArray(storedGoals) ||
		// 			storedGoals.length === 0
		// 		) {
		// 			if (goals.length > 0) {
		// 				console.log(
		// 					'Clearing goals as localStorage is empty or malformed.'
		// 				);
		// 				setGoals([]);
		// 			}
		// 		}
		// 		checkAndResetDailyGoals();
		// 	}
		// };
		// document.addEventListener('visibilitychange', handleVisibilityChange);
		// return () => {
		// 	document.removeEventListener(
		// 		'visibilitychange',
		// 		handleVisibilityChange
		// 	);
		// };
	}, [goals, checkAndResetDailyGoals]);

	useEffect(() => {
		if (lastDailyResetTime) {
			checkAndResetDailyGoals();
		}
	}, [lastDailyResetTime, checkAndResetDailyGoals]);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [activeTab]);

	useEffect(() => {
		console.log('Goals state changed:', goals);
	}, [goals]);

	// --- Existing useEffect for saving goals to localStorage and database ---
	useEffect(() => {
		// Save to localStorage
		if (goals.length > 0) {
			console.log('Saving goals to local storage:', goals);
			localStorage.setItem('userGoals', JSON.stringify(goals));
		} else {
			console.log(
				'Goals array is empty, removing userGoals from localStorage.'
			);
			localStorage.removeItem('userGoals');
		}

		// Save to database
		const saveGoalsToDatabase = async () => {
			if (!user) return;
			const currentEmail = user.primaryEmailAddress?.emailAddress;
			if (!currentEmail) return;

			try {
				console.log('Saving goals to database:', goals);
				// Ensure the 'goals' array is sent as an array, not a JSON string,
				// to your saveQuery action. `saveQuery` expects `email` and `goals` (as an array).
				const result = await saveQuery(
					currentEmail,
					goals // Pass the goals array directly
				);
				if (!result.ok) {
					console.error('Failed to save goals:', result.error);
					toast.error('Failed to save goals to cloud!');
				}
				// else {
				// 	toast.success('Goals saved to cloud!');
				// }
			} catch (err) {
				console.error('Error calling saveQuery for goals:', err);
				toast.error('Error saving goals to cloud!');
			}
		};

		if (user && goals.length > 0) {
			saveGoalsToDatabase();
		}
	}, [goals, user]); // Removed lastDailyResetTime from dependencies as it's not part of the `goals` data structure being saved by `saveQuery` based on your `saveQuery` function signature.

	// --- Existing useEffect for saving lastDailyResetTime to localStorage (database saving handled in goals useEffect if tied together) ---
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
	}, [lastDailyResetTime]);

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
		if (!userEmail) {
			toast.success('Sign in to add goals.');
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
							goals={goals} // This is the state that needs to be an array
							onReSort={() => {}}
							onUpdateGoal={handleUpdateGoal}
							setGoals={setGoals}
							preSetGoals={preSetGoals}
							isSignedIn={
								userEmail != undefined && userEmail != null
							}
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
