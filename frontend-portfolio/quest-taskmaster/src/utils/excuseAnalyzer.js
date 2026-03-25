/**
 * AI Excuse Analyzer - Lightweight NLP for analyzing task failure excuses
 * 
 * This analyzes the user's excuse and determines:
 * - Validity (legitimate vs lazy)
 * - Damage reduction (from penalty)
 * - Special responses (rest day, encouragement, etc.)
 */

// Keywords for different excuse categories
const LEGITIMATE_KEYWORDS = {
  health: ['sick', 'ill', 'hospital', 'doctor', 'fever', 'flu', 'covid', 'injured', 'surgery', 'medical', 'emergency room', 'migraine', 'headache', 'pain', 'nausea'],
  family: ['family', 'emergency', 'funeral', 'death', 'parent', 'child', 'spouse', 'relative', 'passed away', 'accident', 'hospitalized'],
  work: ['deadline', 'overtime', 'urgent', 'boss', 'meeting', 'project', 'client', 'work emergency', 'fired', 'laid off'],
  personal: ['mental health', 'anxiety', 'depression', 'therapy', 'counseling', 'breakdown', 'overwhelmed', 'burned out', 'exhausted'],
  external: ['power outage', 'internet down', 'car broke', 'flood', 'fire', 'earthquake', 'storm', 'weather', 'traffic accident', 'stranded'],
}

const LAZY_KEYWORDS = [
  "didn't feel like it", "lazy", "forgot", "couldn't be bothered", "too tired",
  "played games", "watched tv", "netflix", "slept in", "procrastinated",
  "distracted", "social media", "browsing", "no reason", "just didn't",
  "wasn't in the mood", "didn't want to", "boring", "not interested"
]

const VAGUE_KEYWORDS = [
  "busy", "stuff", "things", "occupied", "no time", "too much", "couldn't"
]

/**
 * Analyze an excuse and return the result
 * @param {string} excuse - The user's excuse text
 * @returns {Object} Analysis result with category, validity, damage reduction, and response
 */
export const analyzeExcuse = (excuse) => {
  const lowerExcuse = excuse.toLowerCase().trim()

  if (!lowerExcuse || lowerExcuse.length < 3) {
    return {
      category: 'empty',
      validity: 0,
      damageReduction: 0,
      response: "You didn't provide a reason. Full penalty applied!",
      penaltyLevel: 'critical',
      suggestion: null,
    }
  }

  // Check for legitimate excuses first
  for (const [category, keywords] of Object.entries(LEGITIMATE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerExcuse.includes(keyword)) {
        return getLegitimateResponse(category, excuse)
      }
    }
  }

  // Check for lazy excuses
  for (const keyword of LAZY_KEYWORDS) {
    if (lowerExcuse.includes(keyword)) {
      return {
        category: 'lazy',
        validity: 0.1,
        damageReduction: 0.1,
        response: "That's not a great reason... A heavy penalty is applied.",
        penaltyLevel: 'heavy',
        suggestion: "Try breaking tasks into smaller, more manageable pieces!",
      }
    }
  }

  // Check for vague excuses
  for (const keyword of VAGUE_KEYWORDS) {
    if (lowerExcuse.includes(keyword)) {
      return {
        category: 'vague',
        validity: 0.3,
        damageReduction: 0.3,
        response: "Your excuse is a bit vague. A standard penalty is applied.",
        penaltyLevel: 'normal',
        suggestion: "Being specific helps you understand your own roadblocks better.",
      }
    }
  }

  // Default: uncertain / medium response
  return {
    category: 'unknown',
    validity: 0.5,
    damageReduction: 0.5,
    response: "We consider your excuse... The penalty is partially reduced.",
    penaltyLevel: 'light',
    suggestion: null,
  }
}

const getLegitimateResponse = (category, excuse) => {
  const responses = {
    health: {
      response: "We understand. Your health comes first! Penalty is waived.",
      suggestion: "Take a Rest Day to recover. Your tasks will wait.",
      offerRestDay: true,
    },
    family: {
      response: "Family emergencies are priority. We respect your situation.",
      suggestion: "Take the time you need.",
      offerRestDay: true,
    },
    work: {
      response: "Work obligations acknowledged. The penalty is mitigated.",
      suggestion: "Consider adjusting task priority during busy work periods.",
      offerRestDay: false,
    },
    personal: {
      response: "Mental health matters. You are granted grace. No penalty taken.",
      suggestion: "Take a Rest Day. Self-care is important.",
      offerRestDay: true,
    },
    external: {
      response: "External circumstances are beyond your control. Penalty waived!",
      suggestion: null,
      offerRestDay: false,
    },
  }

  const r = responses[category]
  return {
    category,
    validity: 1.0,
    damageReduction: category === 'personal' || category === 'health' ? 1.0 : 0.8,
    response: r.response,
    penaltyLevel: 'blocked',
    suggestion: r.suggestion,
    offerRestDay: r.offerRestDay || false,
  }
}

/**
 * Calculate damage based on excuse analysis
 * @param {number} baseDamage - The base penalty
 * @param {Object} analysis - The excuse analysis result
 * @returns {number} Final penalty after reduction
 */
export const calculateDamage = (baseDamage, analysis) => {
  const reduction = analysis.damageReduction || 0
  const finalDamage = Math.floor(baseDamage * (1 - reduction))

  // Critical hits deal 1.5x damage
  if (analysis.penaltyLevel === 'critical') {
    return Math.floor(baseDamage * 1.5)
  }

  // Heavy hits deal 1.2x damage
  if (analysis.penaltyLevel === 'heavy') {
    return Math.floor(baseDamage * 1.2)
  }

  return finalDamage
}

/**
 * Get motivational message based on streak and performance
 * @param {number} streak - Current task completion streak
 * @param {number} completedToday - Tasks completed today
 * @returns {string} Motivational message
 */
export const getMotivationalMessage = (streak, completedToday) => {
  if (streak >= 7) {
    return "Incredible consistency! Your dedication is inspiring!"
  }
  if (streak >= 3) {
    return "Keep the streak alive! You're building great habits!"
  }
  if (completedToday >= 5) {
    return "Incredible! You're on a productivity rampage today!"
  }
  if (completedToday >= 1) {
    return "Great job finishing that task! Ready for the next challenge?"
  }
  return "Your tasks await! Time to get things done!"
}

export default { analyzeExcuse, calculateDamage, getMotivationalMessage }
