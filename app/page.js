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
	// restoreGoal, // Removed restoreGoal import
} from '@/app/page-helper';

export default function App() {
	const [activeTab, setActiveTab] = useState('explore');
	const [goals, setGoals] = useState([]);
	const [archivedGoals, setArchivedGoals] = useState({}); // Moved useState for archivedGoals here
	const [lastDailyResetTime, setLastDailyResetTime] = useState();
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
		console.log('lastResetDate.getTime()', lastResetDate.getTime());
		console.log('todayMidnight.getTime()', todayMidnight.getTime());
		console.log('lastDailyResetTime', lastDailyResetTime);

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
	useEffect(() => {
		const storedTime = localStorage.getItem('lastDailyResetTime');
		const now = new Date();
		const todayMidnight = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			0,
			0,
			0
		);

		if (storedTime) {
			const parsedStoredTime = new Date(storedTime);
			// Ensure stored time is also at midnight for consistent comparison
			const storedTimeMidnight = new Date(
				parsedStoredTime.getFullYear(),
				parsedStoredTime.getMonth(),
				parsedStoredTime.getDate(),
				0,
				0,
				0
			);
			setLastDailyResetTime(storedTimeMidnight);
		} else {
			// Set to midnight of the current day if no stored time
			setLastDailyResetTime(todayMidnight);
		}
	}, []);
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
					} else {
						setGoals([]);
						setArchivedGoals({});
					}
				} else {
					setGoals([]);
					setArchivedGoals({});
					if (response.error) {
						toast.error(`Error loading goals: ${response.error}`);
					}
				}
			} catch (error) {
				console.error('Caught error during loadQueriesByEmail:', error);
				setGoals([]);
				setArchivedGoals({});
				toast.error('Failed to load goals due to a network error.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [userEmail]);

	useEffect(() => {
		const storedTime = localStorage.getItem('lastDailyResetTime');
		console.log('storedTime', storedTime);
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

	useEffect(() => {
		if (lastDailyResetTime) {
			console.log(checkAndResetDailyGoals);
			checkAndResetDailyGoals();
		}
	}, [lastDailyResetTime, checkAndResetDailyGoals]);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [activeTab]);

	useEffect(() => {
		if (goals.length > 0) {
			localStorage.setItem('userGoals', JSON.stringify(goals));
		} else {
			localStorage.removeItem('userGoals');
		}

		const saveGoalsToDatabase = async () => {
			if (!user) return;
			const currentEmail = user.primaryEmailAddress?.emailAddress;
			if (!currentEmail) return;

			try {
				// Pass archivedGoals to saveQuery
				const result = await saveQuery(
					currentEmail,
					goals,
					archivedGoals
				);
				if (!result.ok) {
					console.error('Failed to save goals:', result.error);
					toast.error('Failed to save goals to cloud!');
				}
			} catch (err) {
				console.error('Error calling saveQuery for goals:', err);
				toast.error('Error saving goals to cloud!');
			}
		};

		// Only save if there are goals or archived goals to save
		if (
			user &&
			(goals.length > 0 || Object.keys(archivedGoals).length > 0)
		) {
			saveGoalsToDatabase();
		}
	}, [goals, archivedGoals, user]); // Add archivedGoals to dependency array

	useEffect(() => {
		if (lastDailyResetTime) {
			localStorage.setItem(
				'lastDailyResetTime',
				lastDailyResetTime.toISOString()
			);
		} else {
			localStorage.removeItem('lastDailyResetTime');
		}
	}, [lastDailyResetTime]);

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

	// Moved archiveGoal function from page-helper to page.js
	const archiveAndRemoveGoal = (goalToArchive) => {
		if (!goalToArchive || typeof goalToArchive.title !== 'string') {
			console.warn('Invalid goal provided for archiving.');
			return;
		}

		// Update archivedGoals state
		setArchivedGoals((prevArchived) => ({
			...prevArchived,
			[goalToArchive.title]: goalToArchive.completedDays || {},
		}));

		// Remove from active goals
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

		// Restore completedDays from archivedGoals state
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
		setArchivedGoals({}); // Clear archived goals on sign out
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
							onArchiveGoal={archiveAndRemoveGoal} // Pass the new archive function
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
