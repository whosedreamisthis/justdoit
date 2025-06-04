// src/hooks/ScrollOnExpand.js
import { useRef, useEffect } from 'react';

/**
 * Custom hook to scroll an element into view when a condition becomes true.
 * @param {boolean} shouldScroll - A boolean indicating whether the element should be scrolled into view.
 * @returns {React.RefObject} - A ref object to be attached to the element that needs to be scrolled.
 */
const ScrollOnExpand = (shouldScroll) => {
	const elementRef = useRef(null);

	useEffect(() => {
		if (shouldScroll && elementRef.current) {
			// Use requestAnimationFrame to ensure the DOM has updated after expansion
			// before attempting to scroll. This makes the scroll more reliable.
			requestAnimationFrame(() => {
				elementRef.current.scrollIntoView({
					behavior: 'smooth', // Smooth scrolling animation
					block: 'start', // Align the top of the element with the top of the viewport
					// You could also try 'nearest' if 'start' scrolls too much in some cases
					// block: 'nearest',
				});
			});
		}
	}, [shouldScroll]); // This effect runs whenever 'shouldScroll' changes

	return elementRef; // Return the ref so the component can attach it to its DOM element
};

export default ScrollOnExpand;
