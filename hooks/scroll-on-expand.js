// hooks/scroll-on-expand.js
import { useRef, useEffect } from 'react';

/**
 * Custom hook to scroll an element into view.
 * @param {boolean} shouldScroll - A boolean indicating whether the element should be scrolled into view (e.g., isExpanded).
 * @param {boolean} editModeActive - A boolean indicating if the card is in edit mode.
 * @returns {React.RefObject} - A ref object to be attached to the element that needs to be scrolled.
 */
const ScrollOnExpand = (shouldScroll, editModeActive) => {
	// keep editModeActive param
	const elementRef = useRef(null);

	useEffect(() => {
		// The condition to trigger a scroll: when the card is expanded, regardless of edit mode.
		if (shouldScroll && elementRef.current) {
			requestAnimationFrame(() => {
				const element = elementRef.current;
				const rect = element.getBoundingClientRect();
				const viewportHeight = window.innerHeight;
				const topPadding = 20; // Desired padding from the top of the viewport
				const bottomNavHeight = 80; // Approximate height of your BottomTabs component (adjust if different)
				const bottomPadding = 20; // Desired padding from the bottom of the viewport

				// Always perform scrollIntoView on the element itself when shouldScroll is true.
				// This helps with internal card scrolling for editable content if it overflows.
				element.scrollIntoView({
					behavior: 'auto', // Can be 'smooth' if you prefer, but 'auto' is less intrusive
					block: 'nearest',
					inline: 'nearest',
				});

				// Re-enable window.scrollBy adjustments for ALL cases where shouldScroll is true.
				// This includes when it expands to edit mode, as per your request.
				setTimeout(() => {
					const newRect = element.getBoundingClientRect();

					let scrollAmount = 0;
					const isTopCutOff = newRect.top < topPadding;
					const isBottomCutOff =
						newRect.bottom >
						viewportHeight - bottomNavHeight - bottomPadding;
					const isTallerThanAvailable =
						newRect.height >
						viewportHeight -
							topPadding -
							bottomNavHeight -
							bottomPadding;

					if (isTopCutOff) {
						scrollAmount = newRect.top - topPadding;
					} else if (isBottomCutOff && !isTallerThanAvailable) {
						scrollAmount =
							newRect.bottom -
							(viewportHeight - bottomNavHeight - bottomPadding);
					} else if (isTallerThanAvailable) {
						scrollAmount = newRect.top - topPadding;
					}

					if (scrollAmount !== 0) {
						window.scrollBy({
							top: scrollAmount,
							behavior: 'smooth',
						});
					}
				}, 150); // Small delay to allow initial scroll/layout to settle
			});
		} else if (shouldScroll) {
			console.warn(
				'ScrollOnExpand: scroll condition is true but elementRef.current is null! This means the ref is not attached or element not rendered yet.'
			);
		}
	}, [shouldScroll, editModeActive]); // Effect runs when shouldScroll or editModeActive changes (though editModeActive's direct effect on window.scrollBy is removed)

	return elementRef; // Return the ref so the component can attach it to its DOM element
};

export default ScrollOnExpand;
