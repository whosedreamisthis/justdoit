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
import { useUser, useAuth } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import { archiveGoal } from '@/app/page-helper';

export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	const [goals, setGoals] = useState([]);
	const [archivedGoals, setArchivedGoals] = useState({});
	const [lastDailyResetTime, setLastDailyResetTime] = useState(null);
	const [customHabits, setCustomHabits] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const goalsTabRef = useRef(null); // Ref to access methods on GoalsTab component
	const [expandedCategory, setExpandedCategory] = useState(new Set());
	const hasLoadedInitialDataRef = useRef(false);

	// Initialize selectedStatsGoalTitle to null to ensure it's set after data loads
	const [selectedStatsGoalTitle, setSelectedStatsGoalTitle] = useState(null);

	const saveAllToLocalStorage = (
		currentGoals,
		currentArchivedGoals,
		currentLastDailyResetTime,
		currentCustomHabits
	) => {
		const dataToSave = {
			goals: currentGoals,
			archivedGoals: currentArchivedGoals,
			lastDailyResetTime:
				currentLastDailyResetTime instanceof Date
					? currentLastDailyResetTime.toISOString()
					: null,
			customHabits: currentCustomHabits,
		};
		localStorage.setItem('userData', JSON.stringify(dataToSave));
	};

	const loadFromLocalStorage = () => {
		const storedData = localStorage.getItem('userData');
		if (storedData) {
			const parsedData = JSON.parse(storedData);

			setGoals(parsedData.goals || []);
			setArchivedGoals(parsedData.archivedGoals || {});
			setCustomHabits(parsedData.customHabits || []);
			setLastDailyResetTime(
				parsedData.lastDailyResetTime
					? new Date(parsedData.lastDailyResetTime)
					: null
			);

			if (parsedData.goals && parsedData.goals.length > 0) {
				const tempSortedGoals = [...parsedData.goals].sort((a, b) =>
					a.title.localeCompare(b.title, undefined, {
						sensitivity: 'base',
					})
				);
				setSelectedStatsGoalTitle(tempSortedGoals[0].title);
			} else {
				setSelectedStatsGoalTitle('');
			}
		}
	};

	// Effect to load data from database on mount or when user email becomes available

	useEffect(() => {
		loadFromLocalStorage();
	}, []);
	// --- Other functions (unc
	// hanged from last turn) ---
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'auto' });
		console.log('App: Active tab changed to:', activeTab);
	}, [activeTab]);

	useEffect(() => {
		if (!isLoading) {
			const timeoutId = setTimeout(() => {
				saveAllToLocalStorage(
					goals,
					archivedGoals,
					lastDailyResetTime,
					customHabits
				);
			}, 500);
			return () => clearTimeout(timeoutId);
		}
	}, [goals, archivedGoals, lastDailyResetTime, customHabits]);

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
			// A new habit is selected, so it's safe to save now

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
			// A goal is archived, so it's safe to save now

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
			// A new custom habit is added, so it's safe to save now

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
		// A custom habit is updated, so it's safe to save now

		setCustomHabits((prevHabits) => {
			const updatedHabits = prevHabits.map((habit) =>
				habit.id === updatedHabit.id ? updatedHabit : habit
			);

			return updatedHabits;
		});
		console.log('App: Custom habit updated:', updatedHabit.title);
	}, []);

	const handleDeleteCustomHabit = useCallback((habitId) => {
		// A custom habit is deleted, so it's safe to save now

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

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col items-center pt-32 text-gray-700 gap-4">
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
			<Header title={capitalize(activeTab)} />
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
							archivedGoals={archivedGoals}
							selectedGoalTitle={selectedStatsGoalTitle}
							setSelectedGoalTitle={setSelectedStatsGoalTitle}
						/>
					)}
				</div>
				<BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
			</div>
		</>
	);
}
