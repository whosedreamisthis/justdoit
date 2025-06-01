'use client';
import React, { createContext, useContext, useState } from 'react';

const GoalsContext = createContext();

export const GoalsProvider = ({ children }) => {
	const [goals, setGoals] = useState([
		{
			id: 1,
			title: 'Drink 8 Glasses of Water',
			progress: 0,
			totalSegments: 8,
		},
		{ id: 2, title: 'Exercise', progress: 0, totalSegments: 1 },
	]); // ✅ Make sure both are defined

	const addGoal = (habit) => {
		if (!goals.includes(habit)) {
			setGoals([...goals, habit]);
		}
	};

	return (
		<GoalsContext.Provider value={{ goals, setGoals, addGoal }}>
			{children}
		</GoalsContext.Provider>
	);
};

export const useGoals = () => useContext(GoalsContext);
