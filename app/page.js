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
import { saveQuery, loadQueriesByEmail } from '@/actions/ai'; // Ensure loadQueriesByEmail is used
import { useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import { sortGoals, preSetGoals, archiveGoal } from '@/app/page-helper'; // Import archiveGoal

export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	const [goals, setGoals] = useState([]);
	const [archivedGoals, setArchivedGoals] = useState({}); // Initialize as empty object
	const [lastDailyResetTime, setLastDailyResetTime] = useState(null); // Initialize with null
	const [customHabits, setCustomHabits] = useState([]); // New state for custom habits, initialize empty
	const [isLoading, setIsLoading] = useState(true);
	const goalsTabRef = useRef(null);
	const { user } = useUser();
	const [userEmail, setUserEmail] = useState(null);

	const email = user?.primaryEmailAddress?.emailAddress;

	// Fetch data from database on mount or when user email becomes available
	useEffect(() => {
		if (email) {
			setUserEmail(email);
			const fetchData = async () => {
				setIsLoading(true);
				try {
					const { ok, queries, error } = await loadQueriesByEmail(
						email
					);

					if (ok && queries && queries.length > 0) {
						const latestQuery = queries[0];
						setGoals(latestQuery.goals || []);
						setArchivedGoals(latestQuery.archivedGoals || {});
						setCustomHabits(latestQuery.customHabits || []);

						// Handle lastDailyResetTime
						if (latestQuery.lastDailyResetTime) {
							// Parse ISO string back to Date object
							setLastDailyResetTime(
								new Date(latestQuery.lastDailyResetTime)
							);
						} else {
							// If no reset time in DB, set it to midnight of the current day
							const now = new Date();
							now.setHours(0, 0, 0, 0);
							setLastDailyResetTime(now);
						}
					} else {
						console.log(
							'No existing data for this user or error:',
							error
						);
						// If no data exists, initialize states to default empty/current values
						setGoals([]);
						setArchivedGoals({});
						setCustomHabits([]);
						const now = new Date();
						now.setHours(0, 0, 0, 0);
						setLastDailyResetTime(now);
					}
				} catch (err) {
					console.error('Failed to load initial data:', err);
					toast.error('Failed to load your data.');
					// Even on error, ensure states are reset to a known good (empty) state
					setGoals([]);
					setArchivedGoals({});
					setCustomHabits([]);
					const now = new Date();
					now.setHours(0, 0, 0, 0);
					setLastDailyResetTime(now);
				} finally {
					setIsLoading(false);
				}
			};

			fetchData();
		} else {
			// If no user email, clear states and stop loading
			setGoals([]);
			setArchivedGoals({});
			setCustomHabits([]);
			setLastDailyResetTime(null);
			setIsLoading(false);
		}
	}, [email]); // Dependency on email ensures fetch happens when user logs in/out

	// Effect to save data to database whenever relevant states change
	// This replaces all localStorage.setItem calls for these data types
	useEffect(() => {
		if (userEmail && !isLoading) {
			// Only save if user is logged in and initial loading is complete
			const saveUserData = async () => {
				try {
					const { ok, error } = await saveQuery(
						userEmail,
						goals,
						archivedGoals,
						lastDailyResetTime,
						customHabits
					);
					if (!ok) {
						console.error('Failed to save data:', error);
						// Optionally show a toast error here if saving silently fails often
					}
				} catch (err) {
					console.error('Error during data save:', err);
				}
			};
			const timeoutId = setTimeout(saveUserData, 500); // Debounce save operations
			return () => clearTimeout(timeoutId);
		}
	}, [
		goals,
		archivedGoals,
		lastDailyResetTime,
		customHabits,
		userEmail,
		isLoading,
	]);

	// Daily reset logic
	const checkAndResetDailyProgress = useCallback(() => {
		if (!lastDailyResetTime) return; // Wait until lastDailyResetTime is loaded

		const now = new Date();
		const resetTime = new Date(lastDailyResetTime);

		// Set today's midnight
		const todayMidnight = new Date(now);
		todayMidnight.setHours(0, 0, 0, 0);

		// If the last reset was before today's midnight, reset goals
		if (resetTime.getTime() < todayMidnight.getTime()) {
			console.log('Performing daily reset...');
			setGoals((prevGoals) =>
				prevGoals.map((goal) => ({
					...goal,
					progress: 0,
					completedDays: { ...goal.completedDays }, // Ensure it's a new object for immutability
				}))
			);
			setLastDailyResetTime(todayMidnight); // Update last reset time to today's midnight
			toast.success('Daily goals reset!');
		}
	}, [lastDailyResetTime]);

	useEffect(() => {
		// This effect ensures the reset happens after data is loaded and lastDailyResetTime is set
		if (lastDailyResetTime) {
			checkAndResetDailyProgress();
		}
	}, [lastDailyResetTime, checkAndResetDailyProgress]);

	// Update goal progress or completion
	const handleUpdateGoal = useCallback((updatedGoal) => {
		setGoals((prevGoals) => {
			const existingGoalIndex = prevGoals.findIndex(
				(g) => g.id === updatedGoal.id
			);

			if (existingGoalIndex > -1) {
				const newGoals = [...prevGoals];
				newGoals[existingGoalIndex] = updatedGoal;
				return newGoals;
			}
			return prevGoals; // Goal not found
		});
	}, []);

	const handleHabitSelect = (habit) => {
		const restoredCompletedDays = archivedGoals[habit.title] || {}; // Retrieve from archivedGoals state

		const newGoal = {
			id: uuidv4(),
			title: habit.title,
			description: habit.description,
			color: habit.color || '#FFFFFF',
			progress: 0,
			isCompleted: false,
			completedDays: restoredCompletedDays,
			createdAt: new Date().toISOString(), // Use ISO string for consistency
		};

		preSetGoals((prevGoals) => [...prevGoals, newGoal], goals, setGoals);
		toast.success(`${habit.title} added as a goal!`);
	};

	// New: Handler for archiving and removing a goal
	const archiveAndRemoveGoal = useCallback(
		(goalToArchive) => {
			// Use the helper to get completedDays, but don't save to localStorage there
			const completedDaysToArchive = archiveGoal(goalToArchive);

			setArchivedGoals((prevArchived) => {
				// Create a new object for immutability
				const newArchived = { ...prevArchived };
				if (completedDaysToArchive) {
					newArchived[goalToArchive.title] = completedDaysToArchive;
				}
				return newArchived;
			});

			// Remove the goal from the active goals list
			setGoals((prevGoals) =>
				prevGoals.filter((goal) => goal.id !== goalToArchive.id)
			);

			toast.success(`'${goalToArchive.title}' archived!`);
		},
		[setArchivedGoals, setGoals] // Dependencies
	);

	// New: Handlers for Custom Habits
	const handleAddCustomHabit = useCallback((newHabit) => {
		setCustomHabits((prevHabits) => [...prevHabits, newHabit]);
		toast.success(`'${newHabit.title}' added to custom habits!`);
	}, []);

	const handleUpdateCustomHabit = useCallback((updatedHabit) => {
		setCustomHabits((prevHabits) =>
			prevHabits.map((habit) =>
				habit.id === updatedHabit.id ? updatedHabit : habit
			)
		);
		toast.success(`'${updatedHabit.title}' updated!`);
	}, []);

	const handleDeleteCustomHabit = useCallback((habitId) => {
		setCustomHabits((prevHabits) =>
			prevHabits.filter((habit) => habit.id !== habitId)
		);
		toast.success('Custom habit deleted!');
	}, []);

	const onSignOut = () => {
		setGoals([]);
		setArchivedGoals({}); // Clear archived goals on sign out
		setLastDailyResetTime(null); // Clear last reset time on sign out
		setCustomHabits([]); // Clear custom habits on sign out
		setUserEmail(null);
	};

	// Combine habitsByCategory and customHabits for ExploreTab
	const allHabits = {
		...habitsByCategory,
		'Your Custom Habits': customHabits, // Add custom habits under a new category
	};

	return (
		<>
			<Toaster position="top-right" reverseOrder={false} />
			<Header onSignOut={onSignOut} userEmail={userEmail} />{' '}
			{/* Pass onSignOut and userEmail */}
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
							onArchiveGoal={archiveAndRemoveGoal} // Pass the new archive handler
							isSignedIn={
								userEmail != undefined && userEmail != null
							}
							isLoading={isLoading} // Pass isLoading prop
						/>
					)}
					{activeTab === 'explore' && (
						<ExploreTab
							habitsByCategory={allHabits} // Pass combined habits
							onSelect={handleHabitSelect}
							onAddCustomHabit={handleAddCustomHabit} // Pass the handler for adding custom habits
							customHabits={customHabits} // Pass custom habits to ExploreTab
							onUpdateCustomHabit={handleUpdateCustomHabit} // Pass update handler
							onDeleteCustomHabit={handleDeleteCustomHabit} // Pass delete handler
						/>
					)}
					{activeTab === 'stats' && (
						<StatsTab
							goals={goals}
							isSignedIn={
								userEmail != undefined && userEmail != null
							}
							archivedGoals={archivedGoals} // Pass archivedGoals to StatsTab if it needs them
						/>
					)}
					{activeTab === 'profile' && (
						<ProfileTab
							user={user}
							onSignOut={onSignOut}
							isSignedIn={
								userEmail != undefined && userEmail != null
							}
						/>
					)}
				</div>
				<BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
			</div>
		</>
	);
}
