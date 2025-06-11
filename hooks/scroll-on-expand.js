// hooks/scroll-on-expand.js
import { useRef, useEffect } from 'react';

/**
 * Custom hook to scroll an element into view.
 * @param {boolean} shouldScroll - A boolean indicating whether the element should be scrolled into view (e.g., isExpanded).
 * @param {boolean} editModeActive - A boolean indicating if the card is in edit mode.
 * @returns {React.RefObject} - A ref object to be attached to the element that needs to be scrolled.
 */
const ScrollOnExpand = (shouldScroll, editModeActive) => {
	const elementRef = useRef(null);

	useEffect(() => {
		// Log to see when the effect is triggered and what its dependencies are
		console.log(
			'ScrollOnExpand useEffect triggered. shouldScroll:',
			shouldScroll,
			'editModeActive:',
			editModeActive,
			'elementRef.current:',
			elementRef.current
		);

		// The condition to trigger a scroll: either the component should be expanded
		// or it has just entered an active edit mode that changes its height/position.
		if ((shouldScroll || editModeActive) && elementRef.current) {
			// Use requestAnimationFrame to ensure the DOM has updated after expansion/edit state
			// before attempting to scroll. This makes the scroll more reliable.
			requestAnimationFrame(() => {
				const element = elementRef.current;
				const rect = element.getBoundingClientRect();
				const viewportHeight = window.innerHeight;
				const topPadding = 20; // Desired padding from the top of the viewport
				const bottomNavHeight = 80; // Approximate height of your BottomTabs component (adjust if different)
				const bottomPadding = 20; // Desired padding from the bottom of the viewport

				console.log('--- ScrollOnExpand Debug ---');
				console.log('Element Ref:', element);
				console.log('Initial getBoundingClientRect:', rect);
				console.log('Viewport Height:', viewportHeight);
				console.log(
					'Calculated Effective Viewport Top (with padding):',
					topPadding
				);
				console.log(
					'Calculated Effective Viewport Bottom (with nav and padding):',
					viewportHeight - bottomNavHeight - bottomPadding
				);

				// Perform an initial scroll to bring the element into the general view.
				// 'nearest' is a good start as it tries to minimize scrolling.
				element.scrollIntoView({
					behavior: 'smooth',
					block: 'nearest',
					inline: 'nearest',
				});
				console.log(
					"Initial scrollIntoView (block: 'nearest') called."
				);

				// After a brief delay (to allow the initial scroll to complete),
				// re-check its position and adjust for desired padding and bottom nav.
				setTimeout(() => {
					const newRect = element.getBoundingClientRect();
					console.log(
						'After initial scroll & timeout, new getBoundingClientRect:',
						newRect
					);

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

					console.log(
						`isTopCutOff: ${isTopCutOff}, isBottomCutOff: ${isBottomCutOff}, isTallerThanAvailable: ${isTallerThanAvailable}`
					);

					if (isTopCutOff) {
						// If the top is cut off, scroll up just enough to show the top with padding
						scrollAmount = newRect.top - topPadding;
						console.log(
							'Adjusting UP (top cut off). Scroll amount:',
							scrollAmount
						);
					} else if (isBottomCutOff && !isTallerThanAvailable) {
						// If bottom is cut off, and it's not super tall, scroll down to reveal bottom with padding
						scrollAmount =
							newRect.bottom -
							(viewportHeight - bottomNavHeight - bottomPadding);
						console.log(
							'Adjusting DOWN (bottom cut off). Scroll amount:',
							scrollAmount
						);
					} else if (isTallerThanAvailable) {
						// If the element is taller than the available viewport space,
						// ensure its top aligns with the top padding for better readability.
						scrollAmount = newRect.top - topPadding;
						console.log(
							'Adjusting (tall card, aligning top). Scroll amount:',
							scrollAmount
						);
					}

					if (scrollAmount !== 0) {
						window.scrollBy({
							top: scrollAmount,
							behavior: 'smooth',
						});
						console.log(
							'window.scrollBy called with adjustment:',
							scrollAmount
						);
					} else {
						console.log('No further scroll adjustment needed.');
					}
					console.log('--- End ScrollOnExpand Debug ---');
				}, 150); // Small delay to allow initial scroll/layout to settle
			});
		} else if (shouldScroll || editModeActive) {
			// This warning helps identify cases where the hook is meant to scroll
			// but the element ref is not yet available in the DOM.
			console.warn(
				'ScrollOnExpand: scroll condition is true but elementRef.current is null! This means the ref is not attached or element not rendered yet.'
			);
		}
	}, [shouldScroll, editModeActive]); // Effect runs when either shouldScroll or editModeActive changes

	return elementRef; // Return the ref so the component can attach it to its DOM element
};

export default ScrollOnExpand;
