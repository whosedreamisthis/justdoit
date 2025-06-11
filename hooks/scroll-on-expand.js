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
			const rect = elementRef.current.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const bottomNavHeight = 80; // Approximate height of your BottomTabs component (adjust if different)

			// Determine if the card needs to be scrolled
			// Conditions for scrolling:
			// 1. The bottom of the card is below the bottom navigation area, or very close to the viewport bottom.
			//    This covers cases where the card would be obscured by the bottom nav.
			const isNearBottom =
				rect.bottom > viewportHeight - bottomNavHeight - 20; // -20 adds a small buffer

			// 2. The card's top is already off-screen (above the viewport), but a significant portion of it is still visible.
			//    This prevents scrolling for cards that are completely off-screen and should remain off-screen,
			//    but helps bring partially obscured large cards fully into view.
			const isPartiallyAboveViewport = rect.top < 0 && rect.bottom > 50; // top is negative, but some part is below Y=50

			if (isNearBottom || isPartiallyAboveViewport) {
				// Use requestAnimationFrame to ensure the DOM has updated after expansion
				// before attempting to scroll. This makes the scroll more reliable.
				requestAnimationFrame(() => {
					elementRef.current.scrollIntoView({
						behavior: 'auto', // Smooth scrolling animation
						block: 'nearest', // IMPORTANT CHANGE: Align the nearest edge of the element with the nearest edge of the viewport
						// This prevents it from scrolling 'too far up' unnecessarily.
					});
				});
			}
		}
	}, [shouldScroll]); // This effect runs whenever 'shouldScroll' changes

	return elementRef; // Return the ref so the component can attach it to its DOM element
};

export default ScrollOnExpand;
