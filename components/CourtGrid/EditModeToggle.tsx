'use client';

type EditModeToggleProps = {
  isEditMode: boolean;
  onToggle: () => void;
};

export function EditModeToggle({ isEditMode, onToggle }: EditModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
        isEditMode
          ? 'bg-blue-600 text-white border-blue-700'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      }`}
      title={isEditMode ? 'Exit edit mode' : 'Edit court layout'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      <span className="text-sm font-medium">
        {isEditMode ? 'Done Editing' : 'Edit Layout'}
      </span>
    </button>
  );
}

