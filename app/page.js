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
import { sortGoals, preSetGoals, archiveGoal } from '@/app/page-helper';

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

	const email = user?.primaryEmailAddress?.emailAddress;

	// Effect to load data from database on mount or when user email becomes available
	useEffect(() => {
		if (email) {
			setUserEmail(email);
			const fetchData = async () => {
				setIsLoading(true);
				console.log('App: Fetching data for email:', email);
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
							customHabits: latestQuery.customHabits?.length,
						});

						if (latestQuery.lastDailyResetTime) {
							setLastDailyResetTime(
								new Date(latestQuery.lastDailyResetTime)
							);
						} else {
							const now = new Date();
							now.setHours(0, 0, 0, 0);
							setLastDailyResetTime(now);
						}
					} else {
						console.log(
							'App: No existing data for this user or error during load:',
							error
						);
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
			console.log('App: No user email available. Clearing states.');
			setGoals([]);
			setArchivedGoals({});
			setCustomHabits([]);
			setLastDailyResetTime(null);
			setIsLoading(false);
		}
	}, [email]);

	// Unified function to save all user data to the database (called by debounced useEffect)
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
		);
		console.log(
			'saveAllUserData: Current goals being sent:',
			JSON.stringify(goals, null, 2)
		);
		console.log(
			'saveAllUserData: Current archivedGoals being sent:',
			JSON.stringify(archivedGoals, null, 2)
		);

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
			}
		} catch (err) {
			console.error(
				'saveAllUserData: Error during data save (debounced call):',
				err
			);
			toast.error('An unexpected error occurred while saving.');
		}
	}, [userEmail, goals, archivedGoals, lastDailyResetTime, customHabits]);

	// Debounced save using useEffect
	useEffect(() => {
		if (userEmail && !isLoading) {
			console.log(
				'App useEffect: State change detected, scheduling save...'
			);
			const timeoutId = setTimeout(() => {
				saveAllUserData();
			}, 500);
			return () => clearTimeout(timeoutId);
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
		customHabits,
		userEmail,
		isLoading,
		saveAllUserData,
	]);

	// Daily reset logic
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
					completedDays: { ...goal.completedDays },
				}))
			);
			setLastDailyResetTime(todayMidnight);
			toast.success('Daily goals reset!');
		}
	}, [lastDailyResetTime]);

	useEffect(() => {
		if (lastDailyResetTime) {
			checkAndResetDailyProgress();
		}
	}, [lastDailyResetTime, checkAndResetDailyProgress]);

	// Update goal progress or completion
	const handleUpdateGoal = useCallback((updatedGoal) => {
		// CRUCIAL: Snapshot positions *before* updating state if resorting is expected
		if (
			goalsTabRef.current &&
			typeof goalsTabRef.current.snapshotPositions === 'function'
		) {
			console.log(
				'App: Calling snapshotPositions on GoalsTabRef before setGoals.'
			);
			goalsTabRef.current.snapshotPositions();
		} else {
			console.warn(
				'App: goalsTabRef.current or snapshotPositions is not available. Animation may not work.'
			);
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
	}, []); // goalsTabRef is a ref, so it's stable and typically doesn't need to be in deps.

	const handleHabitSelect = useCallback(
		(habit) => {
			const restoredCompletedDays = archivedGoals[habit.title] || {};

			const newGoal = {
				id: uuidv4(),
				title: habit.title,
				description: habit.description,
				color: habit.color || '#FFFFFF',
				progress: 0,
				isCompleted: false,
				completedDays: restoredCompletedDays,
				createdAt: new Date().toISOString(),
			};

			// CRUCIAL: Snapshot positions *before* updating state if resorting is expected
			if (
				goalsTabRef.current &&
				typeof goalsTabRef.current.snapshotPositions === 'function'
			) {
				console.log(
					'App: Calling snapshotPositions on GoalsTabRef from handleHabitSelect.'
				);
				goalsTabRef.current.snapshotPositions();
			} else {
				console.warn(
					'App: goalsTabRef.current or snapshotPositions is not available from handleHabitSelect.'
				);
			}

			setGoals((prevGoals) => {
				const updatedGoals = [...prevGoals, newGoal];
				return updatedGoals;
			});
			toast.success(`${habit.title} added as a goal!`);
		},
		[archivedGoals]
	);

	const archiveAndRemoveGoal = useCallback((goalToArchive) => {
		const completedDaysToArchive = archiveGoal(goalToArchive);

		setArchivedGoals((prevArchived) => {
			const newArchived = { ...prevArchived };
			if (completedDaysToArchive) {
				newArchived[goalToArchive.title] = completedDaysToArchive;
			}
			return newArchived;
		});

		// CRUCIAL: Snapshot positions *before* updating state if resorting is expected
		if (
			goalsTabRef.current &&
			typeof goalsTabRef.current.snapshotPositions === 'function'
		) {
			console.log(
				'App: Calling snapshotPositions on GoalsTabRef from archiveAndRemoveGoal.'
			);
			goalsTabRef.current.snapshotPositions();
		} else {
			console.warn(
				'App: goalsTabRef.current or snapshotPositions is not available from archiveAndRemoveGoal.'
			);
		}

		setGoals((prevGoals) =>
			prevGoals.filter((goal) => goal.id !== goalToArchive.id)
		);

		toast.success(`'${goalToArchive.title}' archived!`);
	}, []);

	const handleAddCustomHabit = useCallback(
		(newHabit) => {
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
				return updatedHabits;
			});
			handleHabitSelect(newHabit); // Add the custom habit as a goal
			toast.success(`'${newHabit.title}' added to custom habits!`);
		},
		[handleHabitSelect]
	); // Add handleHabitSelect to the dependency array

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
			return updatedHabits;
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
			return updatedHabits;
		});
		toast.success('Custom habit deleted!');
	}, []);

	const onSignOut = () => {
		setGoals([]);
		setArchivedGoals({});
		setLastDailyResetTime(null);
		setCustomHabits([]);
		setUserEmail(null);
		console.log('App: User signed out. States cleared.');
	};

	const allHabits = {
		...habitsByCategory,
		'Your Custom Habits': customHabits,
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center text-gray-700 gap-4">
				<div className="loader"></div>
				<div>Loading your data...</div>
			</div>
		);
	}

	return (
		<>
			<Toaster position="top-right" reverseOrder={false} />
			<Header onSignOut={onSignOut} userEmail={userEmail} />
			<div className="min-h-screen flex flex-col">
				<div className="flex-grow pb-20">
					{activeTab === 'goals' && (
						<GoalsTab
							ref={goalsTabRef} // Attach ref here
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
							isSignedIn={
								userEmail != undefined && userEmail != null
							}
							archivedGoals={archivedGoals}
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
