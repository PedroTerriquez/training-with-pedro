const SEED_DATA = {
  exercises: [
    {
      id: 'ex-bench',
      name: 'Barbell Bench Press',
      muscle: 'Chest',
      imgUrl: '',
      tips: [
        'Drive your feet into the floor, retract your shoulder blades',
        'Bar path: from over the shoulders down to the lower chest',
        'Squeeze the bar to engage triceps and lats',
        'Keep wrists stacked over elbows',
      ],
      alternatives: [
        { name: 'Dumbbell Bench Press', reason: 'If shoulder bothers you — DBs allow natural rotation' },
        { name: 'Machine Chest Press', reason: 'No spotter / fatigued — fixed path is safer' },
        { name: 'Push-Up (weighted)', reason: 'No barbell available' },
      ],
    },
  ],

  settings: {
    activeProgramId: null,
    currentWeekIdx: 0,
    units: 'kg',
    accentColor: '#d4ff3a',
    userName: 'Pedro',
  },

  programs: [
    {
      id: 'prog-example',
      name: 'My Program',
      weeks: [
        {
          name: 'Week 1',
          subtitle: '',
          tag: '',
          days: [
            {
              name: 'Push',
              subtitle: 'Chest · Shoulders · Triceps',
              duration: 60,
              exercises: [
                { exerciseId: 'ex-bench', sets: 4, reps: '6-8', rest: 180 },
              ],
            },
            {
              name: 'Pull',
              subtitle: 'Back · Biceps',
              duration: 60,
              exercises: [],
            },
            {
              name: 'Legs',
              subtitle: 'Quads · Hamstrings',
              duration: 60,
              exercises: [],
            },
            {
              name: 'Push',
              subtitle: 'Chest · Shoulders',
              duration: 60,
              exercises: [],
            },
            {
              name: 'Pull',
              subtitle: 'Back · Biceps',
              duration: 60,
              exercises: [],
            },
            {
              name: 'Legs',
              subtitle: 'Glutes · Hamstrings',
              duration: 60,
              exercises: [],
            },
            { name: 'Rest', subtitle: 'Recovery', duration: 0, exercises: [] },
          ],
        },
      ],
    },
  ],
}

const RECOVERY_TIPS = [
  { icon: '💧', title: 'Hydrate', body: '3-4 L of water. Bonus: a pinch of salt with breakfast.' },
  { icon: '😴', title: 'Sleep 7-9 hours', body: 'Growth happens here, not in the gym.' },
  { icon: '🚶', title: 'Easy walk', body: '30-45 min at conversational pace. Boosts blood flow.' },
  { icon: '🧘', title: 'Mobility', body: '10 minutes — hips, t-spine, shoulders. Don\'t skip.' },
  { icon: '🍳', title: 'Eat enough', body: 'Hit your protein target. Recovery needs fuel.' },
]

const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_NAMES_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

window.RECOVERY_TIPS = RECOVERY_TIPS
