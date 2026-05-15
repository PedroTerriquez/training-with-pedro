// data.js — Pedro's training program
// 3 rotating weeks, Push/Pull/Legs split, Sunday rest

const TIPS_LIB = {
  bench: [
    "Drive your feet into the floor, retract your shoulder blades",
    "Bar path: from over the shoulders down to the lower chest",
    "Squeeze the bar to engage triceps and lats",
    "Keep wrists stacked over elbows",
  ],
  squat: [
    "Brace your core like you're about to be punched",
    "Knees track over toes — don't let them cave inward",
    "Break at hips and knees simultaneously",
    "Drive through midfoot, not heels alone",
  ],
  deadlift: [
    "Bar over midfoot, shoulders just in front of bar",
    "Take the slack out of the bar before you pull",
    "Push the floor away — don't yank the bar up",
    "Lats engaged: imagine squeezing oranges in your armpits",
  ],
  pullup: [
    "Initiate by depressing your shoulder blades down",
    "Drive elbows down and back, not just up",
    "Full hang at the bottom, chin clearly over the bar",
    "Don't kip — controlled negative on the way down",
  ],
  ohp: [
    "Glutes squeezed, ribs tucked — no excessive arching",
    "Bar starts on the front delts, finishes overhead",
    "Press up and slightly back as you clear the head",
    "Lock out with biceps near the ears",
  ],
  row: [
    "Hinge to ~45° — don't stand up with each rep",
    "Pull to the lower chest / upper abs",
    "Elbows track close to the torso",
    "Pause briefly at the top, control the negative",
  ],
  curl: [
    "Keep elbows pinned to your sides",
    "Don't swing — slow eccentric, 2-3 seconds down",
    "Supinate the wrist at the top for full contraction",
    "Stop just short of locking out at the bottom",
  ],
  pushdown: [
    "Elbows glued to your ribs — no flaring",
    "Squeeze the lockout for a 1-second hold",
    "Lean forward slightly, keep core engaged",
    "Control the eccentric — don't let the stack drop",
  ],
  lateral: [
    "Lead with the elbows, not the hands",
    "Slight forward lean engages side delts more",
    "Stop at shoulder height — going higher trains traps",
    "Use a light weight you can control for full ROM",
  ],
  rdl: [
    "Push your hips back, knees soft (not bent)",
    "Bar drags down the thighs — keep it close",
    "Stop where you feel your hamstrings, not the floor",
    "Drive hips forward to stand, not pull with the back",
  ],
  hipthrust: [
    "Shoulder blades on the bench, chin tucked",
    "Squeeze glutes hard at the top — don't overarch",
    "Drive through heels, feet flat",
    "Pause 1s at lockout each rep",
  ],
  default: [
    "Control the eccentric (lowering) — 2 seconds minimum",
    "Full range of motion beats heavy partials",
    "Breathe out on the exertion, in on the return",
    "Leave 1-2 reps in reserve unless going for a PR",
  ],
};

function ex(id, name, muscle, sets, reps, rest, tipsKey, alts, history) {
  return {
    id, name, muscle, sets, reps, rest,
    tips: TIPS_LIB[tipsKey] || TIPS_LIB.default,
    alternatives: alts,
    history: history || [],
  };
}

// Helper: build mock history (last 6 sessions)
function hist(top, step = 2.5) {
  const dates = ["Apr 02", "Apr 09", "Apr 16", "Apr 23", "Apr 30", "May 07"];
  return dates.map((d, i) => ({
    date: d,
    top: +(top - (5 - i) * step).toFixed(1),
    sets: [
      { w: +(top - (5 - i) * step).toFixed(1), r: 8 },
      { w: +(top - (5 - i) * step).toFixed(1), r: 7 },
      { w: +(top - (5 - i) * step - 2.5).toFixed(1), r: 6 },
    ],
  }));
}

const PROGRAM = {
  units: "kg",
  weeks: [
    {
      id: "A",
      name: "Week A",
      subtitle: "Volume",
      tag: "BUILD",
      accent: "#d4ff3a",
      days: [
        {
          name: "Push",
          subtitle: "Chest · Shoulders · Triceps",
          duration: 65,
          exercises: [
            ex("a-push-1", "Barbell Bench Press", "Chest", 4, "6-8", 180, "bench",
              [
                { name: "Dumbbell Bench Press", reason: "If shoulder bothers you — DBs allow natural rotation" },
                { name: "Machine Chest Press", reason: "No spotter / fatigued — fixed path is safer" },
                { name: "Push-Up (weighted)", reason: "No barbell available" },
              ], hist(82.5)),
            ex("a-push-2", "Overhead Press", "Shoulders", 4, "6-8", 150, "ohp",
              [
                { name: "Seated DB Shoulder Press", reason: "Lower back discomfort? Sit & support" },
                { name: "Machine Shoulder Press", reason: "Stable plane if standing is shaky" },
                { name: "Arnold Press", reason: "More front delt + ROM" },
              ], hist(50)),
            ex("a-push-3", "Incline DB Press", "Upper Chest", 3, "8-10", 120, "bench",
              [
                { name: "Incline Barbell Press", reason: "Want to go heavier with a bar path" },
                { name: "Smith Incline Press", reason: "No spotter, want stability" },
                { name: "Decline Push-Up", reason: "No DBs / bodyweight day" },
              ], hist(28)),
            ex("a-push-4", "Cable Fly (mid)", "Chest", 3, "12-15", 90, "default",
              [
                { name: "Pec Deck", reason: "Cable station busy" },
                { name: "DB Fly", reason: "No cables — flat bench DB version" },
                { name: "Banded Crossover", reason: "Travel / home workout" },
              ], hist(22)),
            ex("a-push-5", "Tricep Pushdown", "Triceps", 3, "10-12", 75, "pushdown",
              [
                { name: "Skullcrusher (EZ bar)", reason: "Free-weight alternative" },
                { name: "Overhead Cable Extension", reason: "Targets long head more" },
                { name: "Close-Grip Bench Press", reason: "Compound option" },
              ], hist(35)),
          ],
        },
        {
          name: "Pull",
          subtitle: "Back · Biceps · Rear Delts",
          duration: 70,
          exercises: [
            ex("a-pull-1", "Conventional Deadlift", "Back", 3, "5", 240, "deadlift",
              [
                { name: "Trap Bar Deadlift", reason: "Easier on the lower back" },
                { name: "Sumo Deadlift", reason: "Better if long femurs / short arms" },
                { name: "Romanian Deadlift", reason: "If lower back is fatigued" },
              ], hist(140, 5)),
            ex("a-pull-2", "Pull-Up", "Lats", 4, "AMRAP", 150, "pullup",
              [
                { name: "Assisted Pull-Up", reason: "Can't get full reps yet" },
                { name: "Lat Pulldown", reason: "No bar available" },
                { name: "Inverted Row", reason: "Building up to first pull-up" },
              ], hist(8, 0.5)),
            ex("a-pull-3", "Barbell Row (Pendlay)", "Mid-back", 4, "6-8", 150, "row",
              [
                { name: "Chest-Supported Row", reason: "Save the lower back" },
                { name: "Seated Cable Row", reason: "Want a more stable groove" },
                { name: "Meadows Row", reason: "Unilateral, lat-focused" },
              ], hist(75)),
            ex("a-pull-4", "Face Pull", "Rear Delts", 3, "12-15", 75, "default",
              [
                { name: "Reverse Pec Deck", reason: "Cable rope occupied" },
                { name: "Bent-over DB Reverse Fly", reason: "Free-weight option" },
                { name: "Band Pull-Apart", reason: "Warm-up or no equipment" },
              ], hist(25)),
            ex("a-pull-5", "Hammer Curl", "Biceps / Brachialis", 3, "10-12", 75, "curl",
              [
                { name: "Cross-Body Hammer", reason: "More brachialis emphasis" },
                { name: "Rope Hammer Curl", reason: "Constant tension via cable" },
                { name: "Reverse Curl", reason: "Forearm focus" },
              ], hist(16)),
          ],
        },
        {
          name: "Legs",
          subtitle: "Quads · Hamstrings · Glutes",
          duration: 75,
          exercises: [
            ex("a-legs-1", "Back Squat", "Quads", 4, "6-8", 210, "squat",
              [
                { name: "Front Squat", reason: "More quad-dominant, easier on the back" },
                { name: "Hack Squat", reason: "Fixed path — less stabilizer demand" },
                { name: "Goblet Squat", reason: "Warm-up or no rack available" },
              ], hist(120, 5)),
            ex("a-legs-2", "Romanian Deadlift", "Hamstrings", 3, "8-10", 150, "rdl",
              [
                { name: "Stiff-Leg Deadlift", reason: "More hamstring stretch" },
                { name: "Good Morning", reason: "Want to go lighter on the back" },
                { name: "Single-Leg RDL", reason: "Address imbalances" },
              ], hist(95, 2.5)),
            ex("a-legs-3", "Leg Press", "Quads", 3, "10-12", 120, "default",
              [
                { name: "Hack Squat Machine", reason: "Leg press taken" },
                { name: "Bulgarian Split Squat", reason: "Unilateral focus" },
                { name: "DB Walking Lunge", reason: "No machine available" },
              ], hist(180, 5)),
            ex("a-legs-4", "Lying Leg Curl", "Hamstrings", 3, "10-12", 90, "default",
              [
                { name: "Seated Leg Curl", reason: "Different angle of stretch" },
                { name: "Nordic Curl", reason: "No machine — bodyweight option" },
                { name: "Glute-Ham Raise", reason: "Posterior chain compound" },
              ], hist(45)),
            ex("a-legs-5", "Standing Calf Raise", "Calves", 4, "12-15", 60, "default",
              [
                { name: "Seated Calf Raise", reason: "Targets soleus more" },
                { name: "Donkey Calf Raise", reason: "Stretches the gastrocs more" },
                { name: "Single-Leg DB Calf Raise", reason: "Unilateral, no machine" },
              ], hist(60)),
          ],
        },
        {
          name: "Push",
          subtitle: "Upper Chest · Delts · Arms",
          duration: 65,
          exercises: [
            ex("a-push2-1", "Incline Barbell Press", "Upper Chest", 4, "6-8", 180, "bench",
              [
                { name: "Incline DB Press", reason: "Shoulder-friendly variation" },
                { name: "Smith Incline Press", reason: "No spotter" },
                { name: "Larsen Press", reason: "Want to remove leg drive" },
              ], hist(65)),
            ex("a-push2-2", "Seated DB Shoulder Press", "Shoulders", 4, "8-10", 120, "ohp",
              [
                { name: "Standing OHP", reason: "More core engagement" },
                { name: "Arnold Press", reason: "Larger ROM, all three delt heads" },
                { name: "Machine Shoulder Press", reason: "Drop sets / fatigue" },
              ], hist(26)),
            ex("a-push2-3", "Weighted Dip", "Lower Chest", 3, "8-10", 120, "default",
              [
                { name: "Bench Dip", reason: "Dip station occupied" },
                { name: "Decline Bench Press", reason: "Similar movement pattern" },
                { name: "Close-Grip Push-Up", reason: "No equipment" },
              ], hist(20)),
            ex("a-push2-4", "Lateral Raise", "Side Delts", 4, "12-15", 75, "lateral",
              [
                { name: "Cable Lateral Raise", reason: "Constant tension" },
                { name: "Machine Lateral", reason: "DBs occupied" },
                { name: "Lean-Away Lateral", reason: "Single-arm, stretched ROM" },
              ], hist(10)),
            ex("a-push2-5", "Overhead Tricep Extension", "Triceps", 3, "10-12", 75, "pushdown",
              [
                { name: "Skullcrusher", reason: "Free-weight alternative" },
                { name: "Cable Rope Pushdown", reason: "Quick changeover" },
                { name: "Diamond Push-Up", reason: "No equipment day" },
              ], hist(30)),
          ],
        },
        {
          name: "Pull",
          subtitle: "Width · Biceps · Traps",
          duration: 70,
          exercises: [
            ex("a-pull2-1", "Lat Pulldown (wide)", "Lats", 4, "8-10", 120, "pullup",
              [
                { name: "Pull-Up", reason: "Bodyweight equivalent" },
                { name: "Neutral-Grip Pulldown", reason: "Shoulder-friendly grip" },
                { name: "Straight-Arm Pulldown", reason: "Isolates lats more" },
              ], hist(70)),
            ex("a-pull2-2", "Seated Cable Row", "Mid-back", 4, "8-10", 120, "row",
              [
                { name: "T-Bar Row", reason: "Different angle" },
                { name: "DB Single-Arm Row", reason: "Unilateral focus" },
                { name: "Chest-Supported Row", reason: "Strict form" },
              ], hist(70)),
            ex("a-pull2-3", "Shrug", "Traps", 3, "10-12", 90, "default",
              [
                { name: "Smith Machine Shrug", reason: "Heavier loading" },
                { name: "Snatch-Grip Shrug", reason: "Different ROM" },
                { name: "Farmer Carry", reason: "Functional alternative" },
              ], hist(90)),
            ex("a-pull2-4", "Reverse Pec Deck", "Rear Delts", 3, "12-15", 75, "default",
              [
                { name: "Face Pull", reason: "Cable variation" },
                { name: "Bent-over Reverse Fly", reason: "Free-weight option" },
                { name: "Cable Y-Raise", reason: "Lower trap focus" },
              ], hist(45)),
            ex("a-pull2-5", "Preacher Curl", "Biceps", 3, "10-12", 75, "curl",
              [
                { name: "Spider Curl", reason: "Strictest position" },
                { name: "Incline DB Curl", reason: "Stretched biceps" },
                { name: "Concentration Curl", reason: "Mind-muscle finisher" },
              ], hist(20)),
          ],
        },
        {
          name: "Legs",
          subtitle: "Glutes · Hamstrings · Quads",
          duration: 70,
          exercises: [
            ex("a-legs2-1", "Hip Thrust", "Glutes", 4, "8-10", 150, "hipthrust",
              [
                { name: "Glute Bridge", reason: "No bench available" },
                { name: "Single-Leg Hip Thrust", reason: "Unilateral focus" },
                { name: "Cable Pull-Through", reason: "Hinge variation" },
              ], hist(110, 5)),
            ex("a-legs2-2", "Front Squat", "Quads", 3, "6-8", 180, "squat",
              [
                { name: "Goblet Squat", reason: "Lighter / no rack" },
                { name: "Hack Squat", reason: "Quad-dominant fixed path" },
                { name: "Zercher Squat", reason: "Want to challenge core" },
              ], hist(85)),
            ex("a-legs2-3", "Bulgarian Split Squat", "Quads / Glutes", 3, "10/leg", 120, "default",
              [
                { name: "Walking Lunge", reason: "More dynamic" },
                { name: "Step-Up (box)", reason: "Knee-friendly variation" },
                { name: "Reverse Lunge", reason: "Easier on the knees" },
              ], hist(20, 2.5)),
            ex("a-legs2-4", "Leg Extension", "Quads", 3, "12-15", 75, "default",
              [
                { name: "Sissy Squat", reason: "Bodyweight quad burner" },
                { name: "Cyclist Squat", reason: "Heels-elevated quad focus" },
                { name: "Reverse Nordic", reason: "No machine" },
              ], hist(55)),
            ex("a-legs2-5", "Seated Calf Raise", "Soleus", 4, "15-20", 60, "default",
              [
                { name: "Standing Calf Raise", reason: "Gastrocs focus" },
                { name: "Single-Leg Calf Raise", reason: "Address imbalances" },
                { name: "Calf Press on Leg Press", reason: "Machine alternative" },
              ], hist(45)),
          ],
        },
        { name: "Rest", subtitle: "Recovery", exercises: [] },
      ],
    },

    {
      id: "B",
      name: "Week B",
      subtitle: "Strength",
      tag: "PEAK",
      accent: "#ff5a36",
      days: [
        { name: "Push", subtitle: "Heavy chest", duration: 60, exercises: [] }, // mirrors A with heavier loads
        { name: "Pull", subtitle: "Heavy back", duration: 65, exercises: [] },
        { name: "Legs", subtitle: "Heavy squat", duration: 70, exercises: [] },
        { name: "Push", subtitle: "Upper accessories", duration: 55, exercises: [] },
        { name: "Pull", subtitle: "Width + arms", duration: 60, exercises: [] },
        { name: "Legs", subtitle: "Posterior chain", duration: 65, exercises: [] },
        { name: "Rest", subtitle: "Recovery", exercises: [] },
      ],
    },

    {
      id: "C",
      name: "Week C",
      subtitle: "Deload",
      tag: "DELOAD",
      accent: "#9bd1ff",
      days: [
        { name: "Push", subtitle: "Light technique", duration: 45, exercises: [] },
        { name: "Pull", subtitle: "Light technique", duration: 45, exercises: [] },
        { name: "Legs", subtitle: "Light technique", duration: 50, exercises: [] },
        { name: "Push", subtitle: "Mobility focus", duration: 45, exercises: [] },
        { name: "Pull", subtitle: "Mobility focus", duration: 45, exercises: [] },
        { name: "Legs", subtitle: "Mobility focus", duration: 50, exercises: [] },
        { name: "Rest", subtitle: "Recovery", exercises: [] },
      ],
    },
  ],
};

// Mirror week A exercises into B & C with load adjustments
function adjustHist(history, multiplier) {
  return history.map(s => ({
    date: s.date,
    top: +(s.top * multiplier).toFixed(1),
    sets: s.sets.map(set => ({ w: +(set.w * multiplier).toFixed(1), r: set.r })),
  }));
}
PROGRAM.weeks[1].days.forEach((d, i) => {
  const src = PROGRAM.weeks[0].days[i];
  if (d.name === "Rest") return;
  d.exercises = src.exercises.map(e => ({
    ...e,
    id: e.id.replace("a-", "b-"),
    sets: 5, reps: "3-5",
    history: adjustHist(e.history, 1.08),
  }));
});
PROGRAM.weeks[2].days.forEach((d, i) => {
  const src = PROGRAM.weeks[0].days[i];
  if (d.name === "Rest") return;
  d.exercises = src.exercises.map(e => ({
    ...e,
    id: e.id.replace("a-", "c-"),
    sets: 2, reps: "10-12",
    history: adjustHist(e.history, 0.6),
  }));
});

const RECOVERY_TIPS = [
  { icon: "💧", title: "Hydrate", body: "3-4 L of water. Bonus: a pinch of salt with breakfast." },
  { icon: "😴", title: "Sleep 7-9 hours", body: "Growth happens here, not in the gym." },
  { icon: "🚶", title: "Easy walk", body: "30-45 min at conversational pace. Boosts blood flow." },
  { icon: "🧘", title: "Mobility", body: "10 minutes — hips, t-spine, shoulders. Don't skip." },
  { icon: "🍳", title: "Eat enough", body: "Hit your protein target. Recovery needs fuel." },
];

window.PROGRAM = PROGRAM;
window.RECOVERY_TIPS = RECOVERY_TIPS;
