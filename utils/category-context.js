import { createContext, useContext, useState } from 'react';

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
	const [expandedCategory, setExpandedCategory] = useState(new Set());

	return (
		<CategoryContext.Provider
			value={{ expandedCategory, setExpandedCategory }}
		>
			{children}
		</CategoryContext.Provider>
	);
}

export function useCategory() {
	return useContext(CategoryContext);
}
