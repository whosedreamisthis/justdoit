'use client';
import React, { createContext, useContext, useState } from 'react';

const GoalsContext = createContext();

export const GoalsProvider = ({ children }) => {
	const [goals, setGoals] = useState([]);

	const addGoal = (habit) => {
		if (!goals.includes(habit)) {
			setGoals([...goals, habit]);
		}
	};

	return (
		<GoalsContext.Provider value={{ goals, addGoal }}>
			{children}
		</GoalsContext.Provider>
	);
};

export const useGoals = () => useContext(GoalsContext);
