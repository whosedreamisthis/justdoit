// components/editable-habit-card.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import ScrollOnExpand from '../hooks/scroll-on-expand';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTrashCan,
	faPencil,
	faFloppyDisk,
	faXmarkCircle,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import ColorSquares from './color-squares';
import styles from '@/styles/goal-card.module.css';

export default function EditableHabitCard({
	habit,
	onDelete,
	onUpdateHabit,
	isExpanded,
	onExpand,
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [title, setTitle] = useState(habit.title);
	const [description, setDescription] = useState(habit.description);
	const [color, setColor] = useState(habit.color);

	const cardRef = ScrollOnExpand(isExpanded);
	const titleRef = useRef(null);

	useEffect(() => {
		setTitle(habit.title);
		setDescription(habit.description);
		setColor(habit.color);
		setIsEditing(false);
	}, [habit, isExpanded]);

	useEffect(() => {
		if (isEditing && titleRef.current) titleRef.current.focus();
	}, [isEditing]);

	const save = (e) => {
		e.stopPropagation();
		if (!title.trim()) return toast.error('Title cannot be empty');
		onUpdateHabit(habit.id, {
			...habit,
			title: title.trim(),
			description: description.trim(),
			color,
		});
		setIsEditing(false);
	};

	const cancel = (e) => {
		e.stopPropagation();
		setIsEditing(false);
		setTitle(habit.title);
		setDescription(habit.description);
		setColor(habit.color);
	};

	return (
		<div
			ref={cardRef}
			className={`card rounded-lg p-4 transition-all relative ${
				isExpanded
					? 'max-h-[500px] overflow-auto z-10'
					: 'max-h-32 overflow-hidden z-0'
			}`}
			style={{ backgroundColor: isEditing ? color : habit.color }}
			onClick={() => !isEditing && onExpand()}
		>
			{isEditing ? (
				<div className="relative z-10">
					<input
						ref={titleRef}
						className="w-full p-1 rounded mb-2 bg-gray-100 text-black"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						onClick={(e) => e.stopPropagation()}
					/>
					<textarea
						className="w-full p-1 rounded mb-2 bg-gray-100 text-black"
						rows={3}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						onClick={(e) => e.stopPropagation()}
					/>
					<ColorSquares selectedColor={color} setColor={setColor} />
				</div>
			) : (
				<>
					<h2 className="text-lg font-bold text-gray-800">
						{habit.title}
					</h2>
					{isExpanded && (
						<p className="mt-1 text-gray-600 text-sm">
							{habit.description}
						</p>
					)}
				</>
			)}

			{isExpanded && (
				<div className="flex justify-end items-center gap-2 mt-auto z-20">
					{isEditing ? (
						<>
							<FontAwesomeIcon
								icon={faFloppyDisk}
								className={styles.goalCardIcon}
								onClick={save}
							/>
							<FontAwesomeIcon
								icon={faXmarkCircle}
								className={styles.goalCardIcon}
								onClick={cancel}
							/>
						</>
					) : (
						<FontAwesomeIcon
							icon={faPencil}
							className={styles.goalCardIcon}
							onClick={(e) => {
								e.stopPropagation();
								setIsEditing(true);
							}}
						/>
					)}
					<FontAwesomeIcon
						icon={faTrashCan}
						className={styles.goalCardIcon}
						onClick={(e) => {
							e.stopPropagation();
							onDelete(habit.id);
						}}
					/>
				</div>
			)}
		</div>
	);
}
