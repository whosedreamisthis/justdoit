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
import PageHelper, { sortGoals, preSetGoals } from '@/app/page-helper';

export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	const [goals, setGoals] = useState([]);
	const [archivedGoals, setArchivedGoals] = useState({});
	const [lastDailyResetTime, setLastDailyResetTime] = useState(null); // Initialize with null
	const [isLoading, setIsLoading] = useState(true);
	const goalsTabRef = useRef(null);
	const { user } = useUser();
	const [userEmail, setUserEmail] = useState(null);

	const email = user?.primaryEmailAddress?.emailAddress;

	const checkAndResetDailyGoals = useCallback(() => {
		if (goals.length === 0) {
			console.log('NO GOALS');
			return;
		}
		const now = new Date();
		const todayMidnight = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			0,
			0,
			0
		);

		// Use lastDailyResetTime from state (which will come from DB)
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

		console.log('lastResetDate', lastResetDate);
		console.log('todayMidnight.getTime()', todayMidnight.getTime());
		console.log('lastDailyResetTime (from state)', lastDailyResetTime);

		const shouldReset =
			!lastResetDate || lastResetDate.getTime() < todayMidnight.getTime();

		if (shouldReset) {
			console.log('Midnight Reset Triggered or First Time Reset!');

			preSetGoals(
				(prevGoals) => {
					console.log('prevGoals', prevGoals);
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

	// This effect now only logs mount, initial local storage handling removed
	useEffect(() => {
		console.log('App component mounted!');
	}, []);

	useEffect(() => {
		if (email && email !== userEmail) {
			setUserEmail(email);
		}
	}, [email, userEmail]);

	useEffect(() => {
		if (!userEmail) {
			console.log(
				'User email not available, returning early from data fetch useEffect.'
			);
			setIsLoading(false);
			return;
		}

		const fetchData = async () => {
			setIsLoading(true);
			try {
				const response = await loadQueriesByEmail(userEmail);

				if (
					response.ok &&
					response.queries &&
					response.queries.length > 0
				) {
					const firstQuery = response.queries[0];

					if (firstQuery) {
						// Set goals
						if (Array.isArray(firstQuery.goals)) {
							setGoals(firstQuery.goals);
						} else {
							console.warn(
								"First query object is missing or 'goals' property is not an array. Setting goals to empty.",
								firstQuery
							);
							setGoals([]);
						}
						// Set archived goals
						if (
							firstQuery.archivedGoals &&
							typeof firstQuery.archivedGoals === 'object'
						) {
							setArchivedGoals(firstQuery.archivedGoals);
						} else {
							console.warn(
								"First query object is missing or 'archivedGoals' property is not an object. Setting archivedGoals to empty.",
								firstQuery
							);
							setArchivedGoals({});
						}
						// Set lastDailyResetTime from the database
						if (firstQuery.lastDailyResetTime) {
							setLastDailyResetTime(
								new Date(firstQuery.lastDailyResetTime)
							);
						} else {
							// If no reset time in DB, initialize to today's midnight
							const now = new Date();
							const todayMidnight = new Date(
								now.getFullYear(),
								now.getMonth(),
								now.getDate(),
								0,
								0,
								0
							);
							setLastDailyResetTime(todayMidnight);
						}
					} else {
						setGoals([]);
						setArchivedGoals({});
						setLastDailyResetTime(null); // Or initialize to current midnight
					}
				} else {
					setGoals([]);
					setArchivedGoals({});
					setLastDailyResetTime(null); // Or initialize to current midnight
					if (response.error) {
						toast.error(`Error loading goals: ${response.error}`);
					}
				}
			} catch (error) {
				console.error('Caught error during loadQueriesByEmail:', error);
				setGoals([]);
				setArchivedGoals({});
				setLastDailyResetTime(null); // Or initialize to current midnight
				toast.error('Failed to load goals due to a network error.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [userEmail]); // Depend on userEmail to refetch when it becomes available

	// This useEffect is responsible for triggering the daily reset check AFTER data is loaded
	useEffect(() => {
		// Only run if lastDailyResetTime has been loaded/initialized (not null)
		// and goals are loaded (not empty, or it will log "NO GOALS" and return)
		if (lastDailyResetTime !== null && !isLoading) {
			// Added !isLoading to ensure data is fetched
			// A slight delay might be good here to ensure all state is settled after data fetch
			const timer = setTimeout(() => {
				checkAndResetDailyGoals();
			}, 100); // Small delay to allow state to fully settle

			return () => clearTimeout(timer);
		}
	}, [lastDailyResetTime, checkAndResetDailyGoals, isLoading]); // Add isLoading to dependencies

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [activeTab]);

	// Effect to save goals, archivedGoals, AND lastDailyResetTime to the database
	useEffect(() => {
		const saveGoalsToDatabase = async () => {
			if (!user) return;
			const currentEmail = user.primaryEmailAddress?.emailAddress;
			if (!currentEmail) return;

			try {
				// Pass archivedGoals and lastDailyResetTime to saveQuery
				const result = await saveQuery(
					currentEmail,
					goals,
					archivedGoals,
					lastDailyResetTime // Pass lastDailyResetTime from state
				);
				if (!result.ok) {
					console.error('Failed to save data:', result.error);
					toast.error('Failed to save data to cloud!');
				}
			} catch (err) {
				console.error('Error calling saveQuery:', err);
				toast.error('Error saving data to cloud!');
			}
		};

		// Only save if there are goals, archived goals, or a reset time to save
		// And ensure user and email are available
		if (
			user &&
			user.primaryEmailAddress?.emailAddress &&
			(goals.length > 0 ||
				Object.keys(archivedGoals).length > 0 ||
				lastDailyResetTime !== null)
		) {
			saveGoalsToDatabase();
		}
	}, [goals, archivedGoals, lastDailyResetTime, user]); // Add lastDailyResetTime to dependency array

	// Removed the localStorage useEffect for lastDailyResetTime

	const handleUpdateGoal = (goalId, updatedGoal) => {
		if (activeTab === 'goals' && goalsTabRef.current?.snapshotPositions) {
			goalsTabRef.current.snapshotPositions();
		}
		preSetGoals(
			(prevGoals) => {
				const updatedList = prevGoals.map((goal) =>
					goal.id === goalId ? { ...goal, ...updatedGoal } : goal
				);
				return updatedList;
			},
			goals,
			setGoals
		);
	};

	const archiveAndRemoveGoal = (goalToArchive) => {
		if (!goalToArchive || typeof goalToArchive.title !== 'string') {
			console.warn('Invalid goal provided for archiving.');
			return;
		}

		setArchivedGoals((prevArchived) => ({
			...prevArchived,
			[goalToArchive.title]: goalToArchive.completedDays || {},
		}));

		setGoals((prevGoals) =>
			prevGoals.filter((g) => g.id !== goalToArchive.id)
		);
		toast.success(`${goalToArchive.title} archived!`);
	};

	const handleHabitSelect = async (habit) => {
		if (!habit) {
			console.error('Habit is undefined when selecting!');
			return;
		}
		if (!userEmail) {
			toast.success('Sign in to add goals.');
			return;
		}

		const restoredCompletedDays = archivedGoals[habit.title] || {};

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

	const onSignOut = () => {
		setGoals([]);
		setArchivedGoals({});
		setLastDailyResetTime(null); // Clear lastDailyResetTime on sign out
		setUserEmail(null);
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
							onArchiveGoal={archiveAndRemoveGoal}
							isSignedIn={
								userEmail != undefined && userEmail != null
							}
							isLoading={isLoading}
						/>
					)}
					{activeTab === 'explore' && (
						<ExploreTab
							habitsByCategory={habitsByCategory}
							onSelect={handleHabitSelect}
						/>
					)}
					{activeTab === 'stats' && (
						<StatsTab
							goals={goals}
							isSignedIn={
								userEmail != undefined && userEmail != null
							}
							isLoading={isLoading}
						/>
					)}
					{activeTab === 'profile' && (
						<ProfileTab onSignOut={onSignOut} />
					)}
				</div>
				<BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
			</div>
		</>
	);
}
