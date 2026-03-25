import { create } from 'zustand'

const DIFFICULTY_CONFIG = {
  easy: { attack: 8, exp: 25, gold: 10 },
  medium: { attack: 14, exp: 45, gold: 18 },
  hard: { attack: 22, exp: 70, gold: 28 },
  boss: { attack: 35, exp: 110, gold: 45 },
}

const buildMonster = (difficulty) => {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy
  return {
    attack: config.attack,
    expReward: config.exp,
    goldReward: config.gold,
  }
}

const withStatus = (task, source) => ({
  ...task,
  _source: source,
})

export const useTaskStore = create((set, get) => ({
  tasks: [],
  completedToday: [],
  failedToday: [],
  pendingExcuses: [],
  pendingLatenessExcuse: null,

  addTask: (taskData) => {
    const difficulty = taskData?.difficulty || 'easy'
    const monster = buildMonster(difficulty)
    const now = new Date().toISOString()

    const task = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: taskData?.title || 'Untitled Task',
      description: taskData?.description || '',
      difficulty,
      scheduledStartTime: taskData?.scheduledStartTime || null,
      scheduledEndTime: taskData?.scheduledEndTime || null,
      assignedTo: taskData?.assignedTo || null,
      createdAt: now,
      taskStatus: 'not-started',
      status: 'active',
      actualStartTime: null,
      actualEndTime: null,
      lateStartExcuse: null,
      lateEndExcuse: null,
      monster,
      expReward: monster.expReward,
      goldReward: monster.goldReward,
    }

    set((state) => ({
      tasks: [...state.tasks, task],
    }))
  },

  startTask: (taskId) => {
    const now = new Date()
    let result = null

    set((state) => {
      let pendingLatenessExcuse = state.pendingLatenessExcuse

      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task

        let isLate = false
        let minutesLate = 0
        if (task.scheduledStartTime) {
          const scheduled = new Date(task.scheduledStartTime)
          const diffMin = Math.floor((now - scheduled) / 60000)
          if (diffMin >= 20) {
            isLate = true
            minutesLate = diffMin
          }
        }

        result = isLate ? { isLate: true, minutesLate } : { isLate: false, minutesLate: 0 }

        if (isLate) {
          pendingLatenessExcuse = {
            taskId,
            type: 'start',
            minutesLate,
          }
        }

        return {
          ...task,
          taskStatus: 'in-progress',
          actualStartTime: now.toISOString(),
        }
      })

      return {
        tasks,
        pendingLatenessExcuse,
      }
    })

    return result
  },

  endTask: (taskId) => {
    const now = new Date()
    let result = null

    set((state) => {
      let pendingLatenessExcuse = state.pendingLatenessExcuse

      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task

        let isLate = false
        let minutesLate = 0
        if (task.scheduledEndTime) {
          const scheduled = new Date(task.scheduledEndTime)
          const diffMin = Math.floor((now - scheduled) / 60000)
          if (diffMin >= 20) {
            isLate = true
            minutesLate = diffMin
          }
        }

        result = isLate ? { isLate: true, minutesLate } : { isLate: false, minutesLate: 0 }

        if (isLate) {
          pendingLatenessExcuse = {
            taskId,
            type: 'end',
            minutesLate,
          }
        }

        return {
          ...task,
          actualEndTime: now.toISOString(),
        }
      })

      return {
        tasks,
        pendingLatenessExcuse,
      }
    })

    return result
  },

  completeTask: (taskId) => {
    const state = get()
    const task = state.tasks.find((t) => t.id === taskId)
    if (!task) return null

    const completedTask = {
      ...task,
      status: 'completed',
      taskStatus: 'completed',
      completedAt: new Date().toISOString(),
    }

    set((prev) => ({
      tasks: prev.tasks.filter((t) => t.id !== taskId),
      completedToday: [...prev.completedToday, completedTask],
    }))

    return {
      exp: completedTask.expReward || completedTask.monster?.expReward || 25,
      gold: completedTask.goldReward || completedTask.monster?.goldReward || 10,
    }
  },

  failTask: (taskId) => {
    const state = get()
    const task = state.tasks.find((t) => t.id === taskId)
    if (!task) return

    const failedTask = {
      ...task,
      status: 'failed',
      taskStatus: 'failed',
      failedAt: new Date().toISOString(),
    }

    set((prev) => ({
      tasks: prev.tasks.filter((t) => t.id !== taskId),
      failedToday: [...prev.failedToday, failedTask],
      pendingExcuses: [...prev.pendingExcuses, failedTask],
    }))
  },

  submitExcuse: (taskId, excuse, analysis) => {
    set((state) => ({
      failedToday: state.failedToday.map((task) => {
        if (task.id !== taskId) return task
        return {
          ...task,
          excuse,
          excuseAnalysis: analysis,
          excuseSubmittedAt: new Date().toISOString(),
        }
      }),
      pendingExcuses: state.pendingExcuses.filter((task) => task.id !== taskId),
    }))
  },

  submitLatenessExcuse: (taskId, type, excuse) => {
    const key = type === 'start' ? 'lateStartExcuse' : 'lateEndExcuse'

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              [key]: excuse,
            }
          : task
      ),
      completedToday: state.completedToday.map((task) =>
        task.id === taskId
          ? {
              ...task,
              [key]: excuse,
            }
          : task
      ),
      failedToday: state.failedToday.map((task) =>
        task.id === taskId
          ? {
              ...task,
              [key]: excuse,
            }
          : task
      ),
      pendingLatenessExcuse: null,
    }))
  },

  clearLatenessExcuse: () => {
    set({ pendingLatenessExcuse: null })
  },

  getTaskById: (taskId) => {
    const state = get()
    return (
      state.tasks.find((t) => t.id === taskId) ||
      state.completedToday.find((t) => t.id === taskId) ||
      state.failedToday.find((t) => t.id === taskId) ||
      null
    )
  },

  getAllTasksForPlanner: () => {
    const state = get()
    return [
      ...state.tasks.map((task) => withStatus(task, 'active')),
      ...state.completedToday.map((task) => withStatus(task, 'completed')),
      ...state.failedToday.map((task) => withStatus(task, 'failed')),
    ]
  },
}))
