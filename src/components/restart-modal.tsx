'use client'

// ============================================
// RESTART CONFIRMATION MODAL
// ============================================

interface RestartModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  playerName?: string
}

export function RestartModal({ isOpen, onConfirm, onCancel, playerName }: RestartModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-gradient-to-b from-[#1f1a14] to-[#161310] rounded-lg border border-amber-900/40 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="scroll-edge py-3 px-4 flex items-center justify-center">
          <h2 className="font-cinzel text-amber-100 text-lg tracking-wider flex items-center gap-2">
            <span className="text-amber-400">⚠</span>
            Restart Journey?
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="font-crimson text-amber-100/80 text-base leading-relaxed mb-4 text-center">
            Are you certain you wish to begin anew? All progress will be lost forever in the aether.
          </p>

          {playerName && (
            <p className="font-crimson text-amber-200/60 text-sm text-center mb-4 italic">
              Current journey: <span className="text-amber-300">{playerName}</span>
            </p>
          )}

          <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 mb-6">
            <p className="font-crimson text-red-300/80 text-sm text-center">
              This action cannot be undone. Your save data will be permanently erased.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 font-cinzel text-sm bg-amber-900/30 text-amber-300 rounded-lg hover:bg-amber-900/50 transition-colors cursor-pointer border border-amber-800/30"
            >
              Continue Journey
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 font-cinzel text-sm bg-gradient-to-b from-red-700 to-red-900 text-red-100 rounded-lg hover:from-red-600 hover:to-red-800 transition-all cursor-pointer border border-red-600/30"
            >
              Restart Game
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
