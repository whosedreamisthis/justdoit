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
		console.log(
			'ScrollOnExpand useEffect triggered. shouldScroll:',
			shouldScroll,
			'editModeActive:',
			editModeActive,
			'elementRef.current:',
			elementRef.current
		);

		// The condition to trigger a scroll: when the card is expanded, regardless of edit mode.
		if (shouldScroll && elementRef.current) {
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

				// Always perform scrollIntoView on the element itself when shouldScroll is true.
				// This helps with internal card scrolling for editable content if it overflows.
				element.scrollIntoView({
					behavior: 'auto', // Can be 'smooth' if you prefer, but 'auto' is less intrusive
					block: 'nearest',
					inline: 'nearest',
				});
				console.log(
					"element.scrollIntoView (block: 'nearest') called."
				);

				// Re-enable window.scrollBy adjustments for ALL cases where shouldScroll is true.
				// This includes when it expands to edit mode, as per your request.
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
						scrollAmount = newRect.top - topPadding;
						console.log(
							'Adjusting UP (top cut off). Scroll amount:',
							scrollAmount
						);
					} else if (isBottomCutOff && !isTallerThanAvailable) {
						scrollAmount =
							newRect.bottom -
							(viewportHeight - bottomNavHeight - bottomPadding);
						console.log(
							'Adjusting DOWN (bottom cut off). Scroll amount:',
							scrollAmount
						);
					} else if (isTallerThanAvailable) {
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
						console.log(
							'No further window scroll adjustment needed.'
						);
					}
					console.log('--- End ScrollOnExpand Debug ---');
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
