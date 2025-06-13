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
import { archiveGoal } from '@/app/page-helper';

export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	const [goals, setGoals] = useState([]);
	const [archivedGoals, setArchivedGoals] = useState({});
	const [lastDailyResetTime, setLastDailyResetTime] = useState(null);
	const [customHabits, setCustomHabits] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const goalsTabRef = useRef(null); // Ref to access methods on GoalsTab component
	const { user } = useUser();
	const [userEmail, setUserEmail] = useState(null);
	const [expandedCategory, setExpandedCategory] = useState(new Set());
	const hasLoadedInitialDataRef = useRef(false);
	const email = user?.primaryEmailAddress?.emailAddress;

	// NEW: Ref to track if sign-out is in progress
	const isSignOutRef = useRef(false);

	// Initialize selectedStatsGoalTitle to null to ensure it's set after data loads
	const [selectedStatsGoalTitle, setSelectedStatsGoalTitle] = useState(null);
	console.log(
		'App: selectedStatsGoalTitle initialized as:',
		selectedStatsGoalTitle
	);

	// Effect to load data from database on mount or when user email becomes available
	useEffect(() => {
		console.log('App: Data loading useEffect triggered.');
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
						const loadedGoals = latestQuery.goals || [];

						// Set the main goals state with the order received from the DB
						setGoals(loadedGoals);
						setArchivedGoals(latestQuery.archivedGoals || {});
						setCustomHabits(latestQuery.customHabits || []);

						console.log(
							'App: Goals loaded from DB (unsorted, main state):',
							loadedGoals.map((g) => g.title)
						);

						if (latestQuery.lastDailyResetTime) {
							setLastDailyResetTime(
								new Date(latestQuery.lastDailyResetTime)
							);
						} else {
							const now = new Date();
							now.setHours(0, 0, 0, 0);
							setLastDailyResetTime(now);
						}

						// NEW LOGIC: Create a temporary sorted copy ONLY for selectedStatsGoalTitle
						const tempSortedGoals = [...loadedGoals].sort((a, b) =>
							a.title.localeCompare(b.title, undefined, {
								sensitivity: 'base',
							})
						);

						// *** NEW CRUCIAL DEBUG LOG HERE ***
						console.log(
							'App: tempSortedGoals before setting selectedStatsGoalTitle (full list):',
							tempSortedGoals.map((g) => g.title)
						);
						// **********************************

						if (tempSortedGoals.length > 0) {
							console.log(
								'App: Setting selectedStatsGoalTitle to first goal from TEMPORARY sorted list:',
								tempSortedGoals[0].title
							);
							setSelectedStatsGoalTitle(tempSortedGoals[0].title);
						} else {
							console.log(
								'App: No loaded goals, setting selectedStatsGoalTitle to empty.'
							);
							setSelectedStatsGoalTitle('');
						}
					} else {
						console.log(
							'App: No existing data for this user or error during load:',
							error
						);
						setGoals([]);
						setArchivedGoals({});
						setCustomHabits([]);
						setLastDailyResetTime(null);
						setSelectedStatsGoalTitle('');
						console.log(
							'App: Data load failed or empty, selectedStatsGoalTitle reset.'
						);
					}
				} catch (err) {
					console.error('App: Failed to load initial data:', err);
					toast.error('Failed to load your data.');
					setGoals([]);
					setArchivedGoals({});
					setCustomHabits([]);
					setLastDailyResetTime(null);
					setSelectedStatsGoalTitle('');
					console.log(
						'App: Data load error, selectedStatsGoalTitle reset.'
					);
				} finally {
					setIsLoading(false);
					hasLoadedInitialDataRef.current = true;
					console.log('App: Finished initial data loading.');
				}
			};
			fetchData();
		} else if (user === null) {
			console.log('App: No user email available. Clearing states.');
			setGoals([]);
			setArchivedGoals({});
			setCustomHabits([]);
			setLastDailyResetTime(null);
			setIsLoading(false);
			hasLoadedInitialDataRef.current = true;
			setSelectedStatsGoalTitle('');
			console.log(
				'App: User signed out or no email, selectedStatsGoalTitle reset.'
			);
		}
	}, [email, user]);

	// --- Other functions (unchanged from last turn) ---
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'auto' });
		console.log('App: Active tab changed to:', activeTab);
	}, [activeTab]);

	const saveAllUserData = useCallback(async () => {
		if (!userEmail) {
			console.warn(
				'saveAllUserData: Attempted to save data without user email.'
			);
			return;
		}
		// NEW: Abort save if sign-out is in progress
		if (isSignOutRef.current) {
			console.warn(
				'saveAllUserData: Aborting save, sign-out in progress.'
			);
			return;
		}

		try {
			const { ok, error } = await saveQuery(
				userEmail,
				goals,
				archivedGoals,
				lastDailyResetTime,
				customHabits
			);
			if (!ok) {
				console.error('saveAllUserData: Failed to save data:', error);
				toast.error(`Failed to save changes automatically: ${error}`);
			} else {
				console.log(
					'saveAllUserData: Data saved successfully by debounced effect.'
				);
				console.log(goals);
			}
		} catch (err) {
			console.error(
				'saveAllUserData: Error during data save (debounced call):',
				err
			);
			toast.error('An unexpected error occurred while saving.');
		}
	}, [userEmail, goals, archivedGoals, lastDailyResetTime, customHabits]);

	useEffect(() => {
		if (userEmail && !isLoading && hasLoadedInitialDataRef.current) {
			const timeoutId = setTimeout(() => {
				saveAllUserData();
			}, 500);
			return () => clearTimeout(timeoutId);
		}
	}, [
		goals,
		archivedGoals,
		lastDailyResetTime,
		customHabits,
		userEmail,
		isLoading,
		saveAllUserData,
	]);

	const checkAndResetDailyProgress = useCallback(() => {
		if (!lastDailyResetTime) return;

		const now = new Date();
		const resetTime = new Date(lastDailyResetTime);

		const todayMidnight = new Date(now);
		todayMidnight.setHours(0, 0, 0, 0);

		if (resetTime.getTime() < todayMidnight.getTime()) {
			console.log('App: Performing daily reset...');
			setGoals((prevGoals) =>
				prevGoals.map((goal) => ({
					...goal,
					progress: 0,
					isCompleted: false,
					completedDays: { ...goal.completedDays },
				}))
			);
			setLastDailyResetTime(todayMidnight);
		}
	}, [lastDailyResetTime]);

	useEffect(() => {
		if (lastDailyResetTime) {
			checkAndResetDailyProgress();
		}
	}, [lastDailyResetTime, checkAndResetDailyProgress]);

	const handleUpdateGoal = useCallback((updatedGoal) => {
		if (
			goalsTabRef.current &&
			typeof goalsTabRef.current.snapshotPositions === 'function'
		) {
			goalsTabRef.current.snapshotPositions();
		}

		setGoals((prevGoals) => {
			const existingGoalIndex = prevGoals.findIndex(
				(g) => g.id === updatedGoal.id
			);

			if (existingGoalIndex > -1) {
				const newGoals = [...prevGoals];
				newGoals[existingGoalIndex] = updatedGoal;
				return newGoals;
			}
			return prevGoals;
		});
		console.log('App: Goal updated:', updatedGoal.title);
	}, []);

	const handleHabitSelect = useCallback(
		(habit) => {
			const restoredCompletedDays = archivedGoals[habit.title] || {};
			const now = new Date();
			const currentYear = now.getFullYear();
			const currentMonth = now.getMonth() + 1;
			const currentDay = now.getDate();

			const newCompletedDays = {};
			for (const year in restoredCompletedDays) {
				newCompletedDays[year] = {};
				for (const month in restoredCompletedDays[year]) {
					newCompletedDays[year][month] = {};
					for (const day in restoredCompletedDays[year][month]) {
						if (
							!(
								parseInt(year) === currentYear &&
								parseInt(month) === currentMonth &&
								parseInt(day) === currentDay
							)
						) {
							newCompletedDays[year][month][day] =
								restoredCompletedDays[year][month][day];
						}
					}
				}
			}

			const newGoal = {
				id: uuidv4(),
				title: habit.title,
				description: habit.description,
				color: habit.color || '#FFFFFF',
				progress: 0,
				isCompleted: false,
				completedDays: newCompletedDays,
				createdAt: new Date().toISOString(),
			};

			if (
				goalsTabRef.current &&
				typeof goalsTabRef.current.snapshotPositions === 'function'
			) {
				goalsTabRef.current.snapshotPositions();
			}

			setGoals((prevGoals) => {
				const updatedGoals = [...prevGoals, newGoal];
				return updatedGoals;
			});
			toast.success(`${habit.title} added as a goal!`);
			console.log('App: Habit selected and added as goal:', habit.title);
		},
		[archivedGoals]
	);
	const preSetGoals = (update, goals, setGoals) => {
		console.log('App: preSetGoals goals before update:', goals);
		if (!Array.isArray(goals)) {
			console.error(
				'App: preSetGoals: goals is undefined or not an array:',
				goals
			);
			return;
		}

		let finalGoalsArray =
			typeof update === 'function' ? update(goals) : update;
		console.log('App: preSetGoals finalGoalsArray:', finalGoalsArray);
		if (!Array.isArray(finalGoalsArray)) {
			console.error(
				'App: preSetGoals: finalGoalsArray is undefined or not an array:',
				finalGoalsArray
			);
			return;
		}

		const unsortedFinalGoals = finalGoalsArray;

		if (unsortedFinalGoals.length === 0) {
			console.warn(
				'App: No goals remaining in preSetGoals: Allowing state update to empty array.'
			);
			setGoals([]);
			return;
		}

		setGoals(unsortedFinalGoals);
		console.log(
			'App: preSetGoals: Goals set after preSetGoals (unsorted).',
			unsortedFinalGoals
		);
	};
	const archiveAndRemoveGoal = useCallback(
		(goalToArchive) => {
			const completedDaysToArchive = archiveGoal(goalToArchive);

			setArchivedGoals((prevArchived) => {
				const newArchived = { ...prevArchived };
				if (completedDaysToArchive) {
					newArchived[goalToArchive.title] = completedDaysToArchive;
				}
				return newArchived;
			});

			if (
				goalsTabRef.current &&
				typeof goalsTabRef.current.snapshotPositions === 'function'
			) {
				goalsTabRef.current.snapshotPositions();
			}
			setGoals((prevGoals) => {
				const filteredGoals = prevGoals.filter(
					(goal) => goal.id !== goalToArchive.id
				);
				return filteredGoals;
			});

			if (selectedStatsGoalTitle === goalToArchive.title) {
				setGoals((currentGoals) => {
					const tempSortedCurrentGoals = [...currentGoals].sort(
						(a, b) =>
							a.title.localeCompare(b.title, undefined, {
								sensitivity: 'base',
							})
					);

					if (tempSortedCurrentGoals.length > 0) {
						console.log(
							'App: Archived selected goal, setting new selectedStatsGoalTitle to (from sorted copy):',
							tempSortedCurrentGoals[0].title
						);
						setSelectedStatsGoalTitle(
							tempSortedCurrentGoals[0].title
						);
					} else {
						console.log(
							'App: Archived last goal, setting selectedStatsGoalTitle to empty.'
						);
						setSelectedStatsGoalTitle('');
					}
					return currentGoals;
				});
			}
			console.log('App: Goal archived and removed:', goalToArchive.title);
		},
		[selectedStatsGoalTitle]
	);

	const handleAddCustomHabit = useCallback(
		(newHabit) => {
			setCustomHabits((prevHabits) => {
				const updatedHabits = [...prevHabits, newHabit];
				return updatedHabits;
			});
			handleHabitSelect(newHabit);
			console.log('App: Custom habit added:', newHabit.title);
		},
		[handleHabitSelect]
	);

	const handleUpdateCustomHabit = useCallback((updatedHabit) => {
		setCustomHabits((prevHabits) => {
			const updatedHabits = prevHabits.map((habit) =>
				habit.id === updatedHabit.id ? updatedHabit : habit
			);

			return updatedHabits;
		});
		console.log('App: Custom habit updated:', updatedHabit.title);
	}, []);

	const handleDeleteCustomHabit = useCallback((habitId) => {
		setCustomHabits((prevHabits) => {
			const updatedHabits = prevHabits.filter(
				(habit) => habit.id !== habitId
			);

			return updatedHabits;
		});
		console.log('App: Custom habit deleted:', habitId);
	}, []);

	const onSignOut = () => {
		isSignOutRef.current = true; // Set the flag indicating sign-out is in progress
		setGoals([]);
		setArchivedGoals({});
		setLastDailyResetTime(null);
		setCustomHabits([]);
		setUserEmail(null);
		setSelectedStatsGoalTitle('');
		console.log(
			'App: User signed out. All states cleared, including selectedStatsGoalTitle.'
		);
		// isSignOutRef will naturally reset to false on the next full component mount/unmount or sign-in process.
	};

	const allHabits = {
		...habitsByCategory,
		'Your Custom Habits': customHabits,
	};

	if (isLoading || user === undefined) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center text-gray-700 gap-4">
				<div className="loader"></div>
				<div>Loading your data...</div>
			</div>
		);
	}
	function capitalize(word) {
		return word.charAt(0).toUpperCase() + word.slice(1);
	}

	console.log(
		'App: Rendering App component. Current goals state (main):',
		goals.map((g) => g.title)
	);
	console.log(
		'App: Rendering App component. selectedStatsGoalTitle:',
		selectedStatsGoalTitle
	);

	return (
		<>
			<Toaster position="top-right" reverseOrder={false} />
			<Header
				onSignOut={onSignOut}
				userEmail={userEmail}
				title={capitalize(activeTab)}
			/>
			<div className="min-h-screen flex flex-col pt-16">
				<div className="flex-grow pb-20">
					{activeTab === 'goals' && (
						<GoalsTab
							ref={goalsTabRef}
							goals={goals}
							onReSort={() => {}}
							onUpdateGoal={handleUpdateGoal}
							setGoals={setGoals}
							preSetGoals={preSetGoals}
							onArchiveGoal={archiveAndRemoveGoal}
							isSignedIn={
								userEmail != undefined && userEmail != null
							}
							isLoading={isLoading}
						/>
					)}
					{activeTab === 'explore' && (
						<ExploreTab
							habitsByCategory={allHabits}
							onSelect={handleHabitSelect}
							onAddCustomHabit={handleAddCustomHabit}
							customHabits={customHabits}
							onUpdateCustomHabit={handleUpdateCustomHabit}
							onDeleteCustomHabit={handleDeleteCustomHabit}
							expandedCategory={expandedCategory}
							setExpandedCategory={setExpandedCategory}
						/>
					)}
					{activeTab === 'stats' && (
						<StatsTab
							goals={goals}
							onUpdateGoal={handleUpdateGoal}
							isSignedIn={
								userEmail != undefined && userEmail != null
							}
							archivedGoals={archivedGoals}
							selectedGoalTitle={selectedStatsGoalTitle}
							setSelectedGoalTitle={setSelectedStatsGoalTitle}
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
