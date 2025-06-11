// components/portal.jsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Portal({ children, wrapperId = 'portal-wrapper' }) {
	const [wrapperElement, setWrapperElement] = useState(null);

	useEffect(() => {
		let element = document.getElementById(wrapperId);
		let systemCreated = false;

		// If the wrapper element doesn't exist, create it and append to body
		if (!element) {
			element = document.createElement('div');
			element.setAttribute('id', wrapperId);
			document.body.appendChild(element);
			systemCreated = true;
		}
		setWrapperElement(element);

		// Cleanup: remove the element if it was created by this Portal instance
		return () => {
			if (systemCreated && element.parentNode) {
				element.parentNode.removeChild(element);
			}
		};
	}, [wrapperId]);

	// Render the children into the wrapper element
	if (wrapperElement === null) return null; // Don't render until wrapper is available

	return createPortal(children, wrapperElement);
}
