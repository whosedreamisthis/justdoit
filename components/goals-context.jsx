// 'use client';
// import React, { createContext, useContext, useState } from 'react';

// const GoalsContext = createContext();

// export const GoalsProvider = ({ children }) => {
// 	const [goals, setGoals] = useState([
// 		{
// 			id: 1,
// 			title: 'Drink 8 Glasses of Water',
// 			progress: 0,
// 			totalSegments: 8,
// 		},
// 		{
// 			id: 2,
// 			title: 'Exercise',
// 			progress: 0,
// 			totalSegments: 1,
// 			shortDescription: 'hello',
// 		},
// 		{ id: 3, title: 'eee', progress: 0, totalSegments: 2 },
// 		{ id: 4, title: 'eee 1', progress: 0, totalSegments: 2 },
// 		{ id: 5, title: 'eee 2', progress: 0, totalSegments: 2 },
// 		{ id: 6, title: 'eee 3', progress: 0, totalSegments: 2 },
// 	]); // ✅ Make sure both are defined

// 	const addGoal = (habit) => {
// 		if (!goals.includes(habit)) {
// 			setGoals([...goals, habit]);
// 		}
// 	};

// 	return (
// 		<GoalsContext.Provider value={{ goals, setGoals, addGoal }}>
// 			{children}
// 		</GoalsContext.Provider>
// 	);
// };

// export const useGoals = () => useContext(GoalsContext);
