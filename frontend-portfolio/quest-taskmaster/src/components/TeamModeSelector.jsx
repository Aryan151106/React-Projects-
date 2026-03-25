import { useUserStore } from '../store/userStore'
import { User, Users, UsersRound } from 'lucide-react'

const MODES = [
    {
        id: 'solo',
        label: 'Solo',
        description: 'Work on tasks independently at your own pace',
        icon: User,
        color: '#6366f1',
    },
    {
        id: 'duo',
        label: 'Duo',
        description: 'Team up with a partner for accountability',
        icon: Users,
        color: '#10b981',
    },
    {
        id: 'squad',
        label: 'Team',
        description: 'Collaborate with your team on shared goals',
        icon: UsersRound,
        color: '#f59e0b',
    },
]

export default function TeamModeSelector({ onSelect }) {
    const { teamMode, setteamMode } = useUserStore()

    const handleSelect = (modeId) => {
        setteamMode(modeId)
        onSelect?.()
    }

    return (
        <div className="card p-5 rounded-xl">
            <h3 className="text-sm text-white font-semibold mb-4">Choose Mode</h3>
            <div className="grid gap-3">
                {MODES.map((mode) => {
                    const Icon = mode.icon
                    const isActive = teamMode === mode.id
                    return (
                        <button
                            key={mode.id}
                            onClick={() => handleSelect(mode.id)}
                            className={`p-4 rounded-xl text-left transition-all flex items-center gap-4 ${isActive
                                    ? 'ring-2'
                                    : 'bg-[var(--color-surface-dark)] hover:bg-[var(--color-surface-light)]'
                                }`}
                            style={isActive ? {
                                background: mode.color + '12',
                                borderColor: mode.color + '50',
                                ringColor: mode.color,
                            } : {}}
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: mode.color + '18' }}
                            >
                                <Icon size={20} style={{ color: mode.color }} />
                            </div>
                            <div>
                                <div className="text-sm font-semibold" style={{ color: isActive ? mode.color : 'white' }}>
                                    {mode.label}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">{mode.description}</div>
                            </div>
                            {isActive && (
                                <div className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium"
                                    style={{ color: mode.color, background: mode.color + '20' }}>
                                    Active
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
