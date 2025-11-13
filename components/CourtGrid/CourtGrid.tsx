'use client';

import { CourtGridDraggable } from './CourtGridDraggable';

type CourtGridProps = {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
};

export function CourtGrid({ isEditMode, setIsEditMode }: CourtGridProps) {
  return <CourtGridDraggable isEditMode={isEditMode} setIsEditMode={setIsEditMode} />;
}

