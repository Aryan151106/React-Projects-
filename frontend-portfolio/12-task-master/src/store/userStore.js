import { create } from 'zustand'

const INITIAL_PLAYER = {
  name: 'Player One',
  level: 1,
  exp: 0,
  expToNext: 100,
  gold: 0,
  health: 100,
  maxHealth: 100,
  streak: 0,
  totalTasksCompleted: 0,
}

export const useUserStore = create((set) => ({
  player: { ...INITIAL_PLAYER },
  userPhoto: null,
  teamMode: 'solo',

  setPlayerName: (name) => {
    set((state) => ({
      player: {
        ...state.player,
        name,
      },
    }))
  },

  setUserPhoto: (photo) => {
    set({ userPhoto: photo })
  },

  setteamMode: (mode) => {
    set({ teamMode: mode })
  },

  gainGold: (amount) => {
    set((state) => ({
      player: {
        ...state.player,
        gold: state.player.gold + Math.max(0, amount || 0),
      },
    }))
  },

  gainExp: (amount) => {
    set((state) => {
      let exp = state.player.exp + Math.max(0, amount || 0)
      let level = state.player.level
      let expToNext = state.player.expToNext

      while (exp >= expToNext) {
        exp -= expToNext
        level += 1
        expToNext = Math.floor(expToNext * 1.2)
      }

      return {
        player: {
          ...state.player,
          exp,
          level,
          expToNext,
        },
      }
    })
  },

  takeDamage: (amount) => {
    set((state) => ({
      player: {
        ...state.player,
        health: Math.max(0, state.player.health - Math.max(0, amount || 0)),
      },
    }))
  },

  resetStreak: () => {
    set((state) => ({
      player: {
        ...state.player,
        streak: 0,
      },
    }))
  },

  incrementStreak: () => {
    set((state) => ({
      player: {
        ...state.player,
        streak: state.player.streak + 1,
      },
    }))
  },

  incrementTasksCompleted: () => {
    set((state) => ({
      player: {
        ...state.player,
        totalTasksCompleted: state.player.totalTasksCompleted + 1,
      },
    }))
  },
}))
