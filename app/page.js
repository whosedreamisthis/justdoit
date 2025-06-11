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
				console.log('App: Fetching data for email:', email); // Log fetch start
				try {
					const { ok, queries, error } = await loadQueriesByEmail(
						email
					);

					if (ok && queries && queries.length > 0) {
						const latestQuery = queries[0];
						setGoals(latestQuery.goals || []);
						setArchivedGoals(latestQuery.archivedGoals || {});
						setCustomHabits(latestQuery.customHabits || []);
						console.log('App: Data loaded successfully.', {
							goals: latestQuery.goals?.length,
							archived: Object.keys(
								latestQuery.archivedGoals || {}
							).length,
							customHabits: latestQuery.customHabits?.length, // Log loaded custom habits count
						});

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
							'App: No existing data for this user or error during load:',
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
					console.error('App: Failed to load initial data:', err);
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
					console.log('App: Finished initial data loading.');
				}
			};
			fetchData();
		} else {
			// If no user email, clear states and stop loading
			console.log('App: No user email available. Clearing states.');
			setGoals([]);
			setArchivedGoals({});
			setCustomHabits([]);
			setLastDailyResetTime(null);
			setIsLoading(false);
		}
	}, [email]); // Dependency on email ensures fetch happens when user logs in/out

	// Unified function to save all user data to the database
	// This function will be called by the debounced useEffect below
	const saveAllUserData = useCallback(async () => {
		if (!userEmail) {
			console.warn(
				'saveAllUserData: Attempted to save data without user email.'
			);
			return;
		}
		console.log('saveAllUserData: Initiating save to DB...');
		console.log(
			'saveAllUserData: Current customHabits being sent:',
			JSON.stringify(customHabits, null, 2)
		); // Log actual customHabits content
		console.log(
			'saveAllUserData: Current goals being sent:',
			JSON.stringify(goals, null, 2)
		); // Log actual goals content
		console.log(
			'saveAllUserData: Current archivedGoals being sent:',
			JSON.stringify(archivedGoals, null, 2)
		); // Log actual archivedGoals content

		try {
			const { ok, error } = await saveQuery(
				userEmail,
				goals, // Use latest state from closure
				archivedGoals, // Use latest state from closure
				lastDailyResetTime, // Use latest state from closure
				customHabits // Use latest state from closure
			);
			if (!ok) {
				console.error('saveAllUserData: Failed to save data:', error);
				toast.error(`Failed to save changes automatically: ${error}`);
			} else {
				console.log(
					'saveAllUserData: Data saved successfully by debounced effect.'
				);
			}
		} catch (err) {
			console.error(
				'saveAllUserData: Error during data save (debounced call):',
				err
			);
			toast.error('An unexpected error occurred while saving.');
		}
	}, [userEmail, goals, archivedGoals, lastDailyResetTime, customHabits]); // Dependencies: all state variables read inside

	// Debounced save using useEffect - this will now solely handle all data saving
	// It triggers a save whenever 'goals', 'archivedGoals', 'lastDailyResetTime', or 'customHabits' change.
	useEffect(() => {
		// Only run the save effect if loading is complete and user email is available
		if (userEmail && !isLoading) {
			console.log(
				'App useEffect: State change detected, scheduling save...'
			);
			const timeoutId = setTimeout(() => {
				saveAllUserData(); // Call the memoized saveAllUserData function
			}, 500); // Debounce save operations
			return () => clearTimeout(timeoutId); // Cleanup on unmount or re-render
		} else {
			console.log(
				'App useEffect: Skipping save. userEmail:',
				userEmail,
				'isLoading:',
				isLoading
			);
		}
	}, [
		goals,
		archivedGoals,
		lastDailyResetTime,
		customHabits, // This dependency ensures the effect re-runs when customHabits changes
		userEmail,
		isLoading,
		saveAllUserData, // Add saveAllUserData to dependencies to ensure it's up-to-date
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
			console.log('App: Performing daily reset...');
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
				return newGoals; // This state update will trigger the useEffect for saving
			}
			return prevGoals; // Goal not found
		});
	}, []);

	const handleHabitSelect = useCallback(
		(habit) => {
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

			setGoals((prevGoals) => {
				const updatedGoals = [...prevGoals, newGoal];
				return updatedGoals; // This state update will trigger the useEffect for saving
			});
			toast.success(`${habit.title} added as a goal!`);
		},
		[archivedGoals]
	);

	// New: Handler for archiving and removing a goal
	const archiveAndRemoveGoal = useCallback((goalToArchive) => {
		const completedDaysToArchive = archiveGoal(goalToArchive);

		setArchivedGoals((prevArchived) => {
			const newArchived = { ...prevArchived };
			if (completedDaysToArchive) {
				newArchived[goalToArchive.title] = completedDaysToArchive;
			}
			return newArchived; // This state update will trigger the useEffect for saving
		});

		setGoals((prevGoals) =>
			prevGoals.filter((goal) => goal.id !== goalToArchive.id)
		);

		toast.success(`'${goalToArchive.title}' archived!`);
	}, []);

	// Handlers for Custom Habits - Now ONLY updating local state
	const handleAddCustomHabit = useCallback((newHabit) => {
		console.log(
			'handleAddCustomHabit: Adding new custom habit locally:',
			newHabit
		);
		setCustomHabits((prevHabits) => {
			const updatedHabits = [...prevHabits, newHabit];
			console.log(
				'handleAddCustomHabit: New customHabits state after add:',
				updatedHabits
			);
			return updatedHabits; // This state update will trigger the useEffect for saving
		});
		toast.success(`'${newHabit.title}' added to custom habits!`);
	}, []);

	const handleUpdateCustomHabit = useCallback((updatedHabit) => {
		console.log(
			'handleUpdateCustomHabit: Updating custom habit locally:',
			updatedHabit
		);
		setCustomHabits((prevHabits) => {
			const updatedHabits = prevHabits.map((habit) =>
				habit.id === updatedHabit.id ? updatedHabit : habit
			);
			console.log(
				'handleUpdateCustomHabit: New customHabits state after update:',
				updatedHabits
			);
			return updatedHabits; // This state update will trigger the useEffect for saving
		});
		toast.success(`'${updatedHabit.title}' updated!`);
	}, []);

	const handleDeleteCustomHabit = useCallback((habitId) => {
		console.log(
			'handleDeleteCustomHabit: Deleting custom habit locally with ID:',
			habitId
		);
		setCustomHabits((prevHabits) => {
			const updatedHabits = prevHabits.filter(
				(habit) => habit.id !== habitId
			);
			console.log(
				'handleDeleteCustomHabit: New customHabits state after delete:',
				updatedHabits
			);
			return updatedHabits; // This state update will trigger the useEffect for saving
		});
		toast.success('Custom habit deleted!');
	}, []);

	const onSignOut = () => {
		setGoals([]);
		setArchivedGoals({}); // Clear archived goals on sign out
		setLastDailyResetTime(null); // Clear last reset time on sign out
		setCustomHabits([]); // Clear custom habits on sign out
		setUserEmail(null);
		console.log('App: User signed out. States cleared.');
	};

	// Combine habitsByCategory and customHabits for ExploreTab
	const allHabits = {
		...habitsByCategory,
		'Your Custom Habits': customHabits, // Use 'Your Custom Habits' as the key to match ExploreTab's logic
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center text-gray-700">
				Loading your data...
			</div>
		);
	}

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
							customHabits={customHabits} // Pass custom habits to ExploreTab (for rendering existing ones)
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
