import type {
  Exercise,
  WorkoutLog,
  WorkoutTemplate,
  CoachMessage,
  LiveSession,
  ProgressEntry,
  PricingPlan,
  UserProfile,
  User,
  Workout,
  AnalyticsEntry,
  ChatMessage,
  FormCheckSubmission,
  AssignedExercise,
  LiveParticipant,
  LiveChatMessage,
  MealPlan,
  Trainer,
  FitnessProgram,
} from './types';
import mealPlansData from './data/mealPlans.json';

export const MOCK_USER: UserProfile = {
  name: 'Alex Rivera',
  email: 'alex@fitforge.app',
  goals: ['muscle_gain', 'strength'],
  experience: 'intermediate',
  equipment: 'full_gym',
  trainingSplit: 'ppl',
  subscriptionTier: 'free',
  streakDays: 14,
  joinDate: '2024-01-15',
  weight: 185,
  height: 72,
  premium_feature_unlocked: false,
  dietType: 'non_veg',
  nutritionGoal: 'muscle_gain',
  cuisineType: 'continental',
};

export const MEAL_PLANS: MealPlan[] = mealPlansData as MealPlan[];

export const EXERCISE_LIBRARY: Exercise[] = [
  { id: 'e1', name: 'Barbell Bench Press', category: 'Chest', muscleGroup: ['Chest', 'Triceps', 'Front Delts'], equipment: 'Barbell', difficulty: 'intermediate' },
  { id: 'e2', name: 'Incline Dumbbell Press', category: 'Chest', muscleGroup: ['Upper Chest', 'Triceps'], equipment: 'Dumbbell', difficulty: 'beginner' },
  { id: 'e3', name: 'Cable Fly', category: 'Chest', muscleGroup: ['Chest'], equipment: 'Cable', difficulty: 'beginner' },
  { id: 'e4', name: 'Barbell Squat', category: 'Legs', muscleGroup: ['Quads', 'Glutes', 'Hamstrings'], equipment: 'Barbell', difficulty: 'intermediate' },
  { id: 'e5', name: 'Romanian Deadlift', category: 'Legs', muscleGroup: ['Hamstrings', 'Glutes'], equipment: 'Barbell', difficulty: 'intermediate' },
  { id: 'e6', name: 'Leg Press', category: 'Legs', muscleGroup: ['Quads', 'Glutes'], equipment: 'Machine', difficulty: 'beginner' },
  { id: 'e7', name: 'Pull-up', category: 'Back', muscleGroup: ['Lats', 'Biceps'], equipment: 'Bodyweight', difficulty: 'intermediate' },
  { id: 'e8', name: 'Barbell Row', category: 'Back', muscleGroup: ['Lats', 'Rhomboids', 'Biceps'], equipment: 'Barbell', difficulty: 'intermediate' },
  { id: 'e9', name: 'Lat Pulldown', category: 'Back', muscleGroup: ['Lats', 'Biceps'], equipment: 'Cable', difficulty: 'beginner' },
  { id: 'e10', name: 'Seated Cable Row', category: 'Back', muscleGroup: ['Mid Back', 'Biceps'], equipment: 'Cable', difficulty: 'beginner' },
  { id: 'e11', name: 'Overhead Press', category: 'Shoulders', muscleGroup: ['Front Delts', 'Lateral Delts', 'Triceps'], equipment: 'Barbell', difficulty: 'intermediate' },
  { id: 'e12', name: 'Lateral Raise', category: 'Shoulders', muscleGroup: ['Lateral Delts'], equipment: 'Dumbbell', difficulty: 'beginner' },
  { id: 'e13', name: 'Face Pull', category: 'Shoulders', muscleGroup: ['Rear Delts', 'Rotator Cuff'], equipment: 'Cable', difficulty: 'beginner' },
  { id: 'e14', name: 'Barbell Deadlift', category: 'Back', muscleGroup: ['Erectors', 'Glutes', 'Hamstrings', 'Traps'], equipment: 'Barbell', difficulty: 'advanced' },
  { id: 'e15', name: 'Barbell Curl', category: 'Arms', muscleGroup: ['Biceps'], equipment: 'Barbell', difficulty: 'beginner' },
  { id: 'e16', name: 'Tricep Pushdown', category: 'Arms', muscleGroup: ['Triceps'], equipment: 'Cable', difficulty: 'beginner' },
  { id: 'e17', name: 'Hammer Curl', category: 'Arms', muscleGroup: ['Biceps', 'Brachialis'], equipment: 'Dumbbell', difficulty: 'beginner' },
  { id: 'e18', name: 'Skull Crushers', category: 'Arms', muscleGroup: ['Triceps'], equipment: 'Barbell', difficulty: 'intermediate' },
  { id: 'e19', name: 'Calf Raise', category: 'Legs', muscleGroup: ['Calves'], equipment: 'Machine', difficulty: 'beginner' },
  { id: 'e20', name: 'Plank', category: 'Core', muscleGroup: ['Core', 'Abs'], equipment: 'Bodyweight', difficulty: 'beginner' },
  { id: 'e21', name: 'Cable Crunch', category: 'Core', muscleGroup: ['Abs'], equipment: 'Cable', difficulty: 'beginner' },
  { id: 'e22', name: 'Hip Thrust', category: 'Legs', muscleGroup: ['Glutes', 'Hamstrings'], equipment: 'Barbell', difficulty: 'intermediate' },
  { id: 'e23', name: 'Dips', category: 'Chest', muscleGroup: ['Triceps', 'Chest'], equipment: 'Bodyweight', difficulty: 'intermediate' },
  { id: 'e24', name: 'T-Bar Row', category: 'Back', muscleGroup: ['Lats', 'Rhomboids'], equipment: 'Barbell', difficulty: 'intermediate' },
];

const makeDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const WORKOUT_HISTORY: WorkoutLog[] = [
  {
    id: 'w1',
    date: makeDate(1),
    name: 'Push Day A',
    duration: 68,
    totalVolume: 12450,
    exercises: [
      { exercise: EXERCISE_LIBRARY[0], sets: [{ reps: 5, weight: 225, rpe: 8, completed: true }, { reps: 5, weight: 225, rpe: 8.5, completed: true }, { reps: 4, weight: 225, rpe: 9, completed: true }, { reps: 4, weight: 225, rpe: 9.5, completed: true }], },
      { exercise: EXERCISE_LIBRARY[1], sets: [{ reps: 10, weight: 75, rpe: 7, completed: true }, { reps: 10, weight: 75, rpe: 8, completed: true }, { reps: 9, weight: 75, rpe: 8.5, completed: true }], },
      { exercise: EXERCISE_LIBRARY[10], sets: [{ reps: 8, weight: 135, rpe: 8, completed: true }, { reps: 8, weight: 135, rpe: 8, completed: true }, { reps: 7, weight: 135, rpe: 9, completed: true }], },
      { exercise: EXERCISE_LIBRARY[11], sets: [{ reps: 15, weight: 25, rpe: 7, completed: true }, { reps: 15, weight: 25, rpe: 7, completed: true }, { reps: 14, weight: 25, rpe: 8, completed: true }], },
    ],
  },
  {
    id: 'w2',
    date: makeDate(3),
    name: 'Pull Day A',
    duration: 72,
    totalVolume: 14800,
    exercises: [
      { exercise: EXERCISE_LIBRARY[13], sets: [{ reps: 5, weight: 315, rpe: 8, completed: true }, { reps: 4, weight: 315, rpe: 9, completed: true }, { reps: 4, weight: 315, rpe: 9, completed: true }], },
      { exercise: EXERCISE_LIBRARY[7], sets: [{ reps: 8, weight: 185, rpe: 8, completed: true }, { reps: 8, weight: 185, rpe: 8, completed: true }, { reps: 7, weight: 185, rpe: 8.5, completed: true }], },
      { exercise: EXERCISE_LIBRARY[6], sets: [{ reps: 8, weight: 0, rpe: 8, completed: true }, { reps: 7, weight: 0, rpe: 8.5, completed: true }, { reps: 6, weight: 0, rpe: 9, completed: true }], },
      { exercise: EXERCISE_LIBRARY[14], sets: [{ reps: 10, weight: 95, rpe: 7, completed: true }, { reps: 10, weight: 95, rpe: 7, completed: true }, { reps: 9, weight: 95, rpe: 8, completed: true }], },
    ],
  },
  {
    id: 'w3',
    date: makeDate(5),
    name: 'Leg Day A',
    duration: 65,
    totalVolume: 18200,
    exercises: [
      { exercise: EXERCISE_LIBRARY[3], sets: [{ reps: 5, weight: 275, rpe: 8.5, completed: true }, { reps: 5, weight: 275, rpe: 9, completed: true }, { reps: 5, weight: 275, rpe: 9, completed: true }], },
      { exercise: EXERCISE_LIBRARY[4], sets: [{ reps: 10, weight: 185, rpe: 8, completed: true }, { reps: 10, weight: 185, rpe: 8.5, completed: true }, { reps: 9, weight: 185, rpe: 9, completed: true }], },
      { exercise: EXERCISE_LIBRARY[5], sets: [{ reps: 12, weight: 360, rpe: 7, completed: true }, { reps: 12, weight: 360, rpe: 8, completed: true }, { reps: 11, weight: 360, rpe: 8.5, completed: true }], },
      { exercise: EXERCISE_LIBRARY[21], sets: [{ reps: 12, weight: 135, rpe: 7, completed: true }, { reps: 12, weight: 135, rpe: 7, completed: true }, { reps: 12, weight: 135, rpe: 8, completed: true }], },
    ],
  },
  {
    id: 'w4',
    date: makeDate(8),
    name: 'Push Day B',
    duration: 70,
    totalVolume: 11900,
    exercises: [],
  },
  {
    id: 'w5',
    date: makeDate(10),
    name: 'Pull Day B',
    duration: 75,
    totalVolume: 15600,
    exercises: [],
  },
];

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 't1',
    name: 'Push Day A',
    description: 'Chest, shoulders, triceps focused with heavy compound movements',
    category: 'Push',
    estimatedDuration: 65,
    exercises: [
      { exercise: EXERCISE_LIBRARY[0], sets: 4, reps: '4-6', restSeconds: 180 },
      { exercise: EXERCISE_LIBRARY[1], sets: 3, reps: '8-12', restSeconds: 120 },
      { exercise: EXERCISE_LIBRARY[10], sets: 3, reps: '8-10', restSeconds: 120 },
      { exercise: EXERCISE_LIBRARY[11], sets: 3, reps: '15-20', restSeconds: 60 },
      { exercise: EXERCISE_LIBRARY[15], sets: 3, reps: '12-15', restSeconds: 60 },
    ],
  },
  {
    id: 't2',
    name: 'Pull Day A',
    description: 'Back and biceps with deadlift as main movement',
    category: 'Pull',
    estimatedDuration: 70,
    exercises: [
      { exercise: EXERCISE_LIBRARY[13], sets: 3, reps: '3-5', restSeconds: 240 },
      { exercise: EXERCISE_LIBRARY[7], sets: 4, reps: '6-10', restSeconds: 120 },
      { exercise: EXERCISE_LIBRARY[6], sets: 3, reps: '8-10', restSeconds: 120 },
      { exercise: EXERCISE_LIBRARY[14], sets: 3, reps: '10-12', restSeconds: 90 },
      { exercise: EXERCISE_LIBRARY[16], sets: 3, reps: '12-15', restSeconds: 60 },
    ],
  },
  {
    id: 't3',
    name: 'Leg Day A',
    description: 'Quad-dominant leg day with squat as primary lift',
    category: 'Legs',
    estimatedDuration: 65,
    exercises: [
      { exercise: EXERCISE_LIBRARY[3], sets: 4, reps: '4-6', restSeconds: 240 },
      { exercise: EXERCISE_LIBRARY[4], sets: 3, reps: '8-10', restSeconds: 120 },
      { exercise: EXERCISE_LIBRARY[5], sets: 3, reps: '10-15', restSeconds: 120 },
      { exercise: EXERCISE_LIBRARY[21], sets: 3, reps: '12-15', restSeconds: 90 },
      { exercise: EXERCISE_LIBRARY[18], sets: 4, reps: '15-20', restSeconds: 60 },
    ],
  },
  {
    id: 't4',
    name: 'Full Body Strength',
    description: 'Efficient full-body session targeting all major muscle groups',
    category: 'Full Body',
    estimatedDuration: 55,
    exercises: [
      { exercise: EXERCISE_LIBRARY[3], sets: 3, reps: '5', restSeconds: 180 },
      { exercise: EXERCISE_LIBRARY[0], sets: 3, reps: '5', restSeconds: 180 },
      { exercise: EXERCISE_LIBRARY[7], sets: 3, reps: '6-8', restSeconds: 120 },
      { exercise: EXERCISE_LIBRARY[10], sets: 3, reps: '8-10', restSeconds: 90 },
      { exercise: EXERCISE_LIBRARY[19], sets: 3, reps: '30-60s', restSeconds: 60 },
    ],
  },
];

export const COACH_MESSAGES: CoachMessage[] = [
  { id: 'm1', sender: 'coach', content: "Hey Alex! Great work this week. Your bench press is showing solid progress — you hit 225 for 4x5 which is ahead of schedule. Let's keep the momentum going!", timestamp: '2024-07-11T09:15:00', read: true },
  { id: 'm2', sender: 'user', content: "Thanks Coach! I felt strong on bench but my right shoulder was a bit tight on overhead press. Should I be concerned?", timestamp: '2024-07-11T10:30:00', read: true },
  { id: 'm3', sender: 'coach', content: "Shoulder tightness on OHP is common. Try adding 10 min of band pull-aparts and face pulls as a warmup. Also make sure you're not flaring your elbows too wide. Send me a form check video of your next OHP session.", timestamp: '2024-07-11T11:00:00', read: true },
  { id: 'm4', sender: 'user', content: "Will do! Should I drop the weight this session while I work on form?", timestamp: '2024-07-11T11:20:00', read: true },
  { id: 'm5', sender: 'coach', content: "Yes, drop 10-15% and really focus on the setup. Packed shoulder blades, slight lean back, bar path directly over midfoot. Quality > weight right now.", timestamp: '2024-07-11T11:35:00', read: false },
];

export const LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'ls1',
    title: 'Maximizing Hypertrophy: Science-Based Programming',
    trainerId: 'trainer-marcus',
    coach: 'Marcus Webb',
    coachAvatar: 'MW',
    date: makeDate(-1),
    time: '7:00 PM EST',
    duration: 60,
    spotsTotal: 50,
    spotsRemaining: 12,
    topic: 'Programming & Hypertrophy',
    categoryTag: 'Hypertrophy',
    status: 'upcoming',
    summary: 'Marcus breaks down how to structure volume, intensity, and recovery for sustainable muscle growth.',
    tags: ['Intermediate', 'Hypertrophy', 'Programming'],
    isPremium: false,
    startTime: `${makeDate(-1)}T19:00:00`,
    isFree: true,
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'ls2',
    title: 'Deadlift Form Masterclass: Avoid Common Mistakes',
    trainerId: 'trainer-sarah',
    coach: 'Sarah Chen',
    coachAvatar: 'SC',
    date: makeDate(-2),
    time: '6:00 PM EST',
    duration: 90,
    spotsTotal: 30,
    spotsRemaining: 5,
    topic: 'Form & Technique',
    categoryTag: 'Technique',
    status: 'upcoming',
    summary: 'Sarah walks through the most common deadlift errors and teaches setup cues to lift with confidence.',
    tags: ['All Levels', 'Strength', 'Form Check'],
    isPremium: false,
    startTime: `${makeDate(-2)}T18:00:00`,
    isFree: true,
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'ls3',
    title: 'Nutrition for Muscle Gain: Practical Q&A',
    trainerId: 'trainer-james',
    coach: 'Dr. James Park',
    coachAvatar: 'JP',
    date: makeDate(-3),
    time: '8:00 PM EST',
    duration: 60,
    spotsTotal: 100,
    spotsRemaining: 34,
    topic: 'Nutrition',
    categoryTag: 'Nutrition',
    status: 'upcoming',
    summary: 'James answers real coaching questions and builds a practical muscle gain nutrition roadmap.',
    tags: ['All Levels', 'Nutrition', 'Q&A'],
    isPremium: false,
    startTime: `${makeDate(-3)}T20:00:00`,
    isFree: false,
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'ls4',
    title: 'Advanced Periodization for Powerlifters',
    trainerId: 'trainer-marcus',
    coach: 'Marcus Webb',
    coachAvatar: 'MW',
    date: makeDate(-5),
    time: '7:30 PM EST',
    duration: 75,
    spotsTotal: 20,
    spotsRemaining: 3,
    topic: 'Advanced Programming',
    categoryTag: 'Powerlifting',
    status: 'upcoming',
    summary: 'A premium session for experienced lifters that teaches advanced loading patterns and recovery timing.',
    tags: ['Advanced', 'Powerlifting', 'Premium'],
    isPremium: true,
    startTime: `${makeDate(-5)}T19:30:00`,
    isFree: false,
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'ls5',
    title: 'Recovery & Sleep Optimization for Athletes',
    trainerId: 'trainer-james',
    coach: 'Dr. James Park',
    coachAvatar: 'JP',
    date: makeDate(-7),
    time: '9:00 PM EST',
    duration: 45,
    spotsTotal: 80,
    spotsRemaining: 0,
    topic: 'Recovery',
    categoryTag: 'Recovery',
    status: 'upcoming',
    summary: 'James covers the evidence-based recovery protocols and sleep habits that support training adaptation.',
    tags: ['All Levels', 'Recovery', 'Sleep'],
    isPremium: false,
    startTime: `${makeDate(-7)}T21:00:00`,
    isFree: true,
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
];

export const PROGRESS_DATA: ProgressEntry[] = Array.from({ length: 12 }, (_, i) => ({
  date: makeDate((11 - i) * 7),
  weight: 190 - i * 0.4 + (Math.random() - 0.5) * 1.2,
  bodyFat: 18 - i * 0.2 + (Math.random() - 0.5) * 0.3,
  chest: 42 + i * 0.05 + (Math.random() - 0.5) * 0.2,
  waist: 34 - i * 0.1 + (Math.random() - 0.5) * 0.3,
  biceps: 15.5 + i * 0.04 + (Math.random() - 0.5) * 0.15,
}));

export const BENCH_PRESS_HISTORY = [
  { date: makeDate(84), weight: 185 },
  { date: makeDate(77), weight: 190 },
  { date: makeDate(70), weight: 195 },
  { date: makeDate(63), weight: 200 },
  { date: makeDate(56), weight: 205 },
  { date: makeDate(49), weight: 205 },
  { date: makeDate(42), weight: 210 },
  { date: makeDate(35), weight: 215 },
  { date: makeDate(28), weight: 215 },
  { date: makeDate(21), weight: 220 },
  { date: makeDate(14), weight: 220 },
  { date: makeDate(7), weight: 225 },
  { date: makeDate(1), weight: 225 },
];

export const SQUAT_HISTORY = [
  { date: makeDate(84), weight: 225 },
  { date: makeDate(70), weight: 235 },
  { date: makeDate(56), weight: 245 },
  { date: makeDate(42), weight: 255 },
  { date: makeDate(28), weight: 265 },
  { date: makeDate(14), weight: 270 },
  { date: makeDate(1), weight: 275 },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 79,
    billingPeriod: 'per month',
    pricePerMonth: 79,
    features: [
      'Dedicated personal coach',
      'Weekly check-ins',
      'Custom workout programs',
      'Nutrition guidance',
      'Form check reviews (2/month)',
      'Live session access',
      'Direct messaging',
    ],
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 197,
    billingPeriod: 'per 3 months',
    pricePerMonth: 65.67,
    savings: 'Save 17%',
    isPopular: true,
    features: [
      'Everything in Monthly',
      'Bi-weekly check-ins',
      'Custom meal plans',
      'Form check reviews (5/month)',
      'Priority coach response',
      'Progress photos review',
      'Supplement recommendations',
    ],
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 599,
    billingPeriod: 'per year',
    pricePerMonth: 49.92,
    savings: 'Save 37%',
    isBestValue: true,
    features: [
      'Everything in Quarterly',
      'Unlimited check-ins',
      'Full bloodwork analysis',
      'Form check reviews (unlimited)',
      'VIP coach access',
      'In-person session (1/year)',
      'Lifetime program access',
      'Dedicated nutrition coach',
    ],
  },
];

// ============ DUAL-INTERFACE MOCK DATA ============

const todayStr = () => new Date().toISOString().split('T')[0];
const dayOffset = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

export const MOCK_USERS: User[] = [
  {
    id: 'u_trainer_1',
    email: 'marcus@fitforge.app',
    role: 'trainer',
    name: 'Marcus Webb',
    avatarInitials: 'MW',
    trainerId: null,
  },
  {
    id: 'u_client_1',
    email: 'alex@fitforge.app',
    role: 'client',
    name: 'Alex Rivera',
    avatarInitials: 'AR',
    trainerId: 'u_trainer_1',
    goals: ['muscle_gain', 'strength'],
    compliance: 92,
    lastActive: dayOffset(0),
    weight: 185,
    height: 72,
    streakDays: 14,
  },
  {
    id: 'u_client_2',
    email: 'sarah@fitforge.app',
    role: 'client',
    name: 'Sarah Chen',
    avatarInitials: 'SC',
    trainerId: 'u_trainer_1',
    goals: ['fat_loss', 'endurance'],
    compliance: 78,
    lastActive: dayOffset(-1),
    weight: 142,
    height: 65,
    streakDays: 3,
  },
  {
    id: 'u_client_3',
    email: 'jake@fitforge.app',
    role: 'client',
    name: 'Jake Morrison',
    avatarInitials: 'JM',
    trainerId: 'u_trainer_1',
    goals: ['strength'],
    compliance: 64,
    lastActive: dayOffset(-3),
    weight: 210,
    height: 74,
    streakDays: 0,
  },
];

export const CURRENT_CLIENT_ID = 'u_client_1';
export const CURRENT_TRAINER_ID = 'u_trainer_1';

export const TRAINERS: Trainer[] = [
  {
    id: 'trainer-marcus',
    name: 'Marcus Webb',
    avatar: 'MW',
    followerCount: 18500,
    bio: 'Powerlifting-focused coach driving sustainable strength and hypertrophy through science-backed volume and recovery.',
    rating: 4.9,
    category: 'Strength & Hypertrophy',
    coverImage: 'https://images.unsplash.com/photo-1599058917218-7d5305928bb4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'trainer-sarah',
    name: 'Sarah Chen',
    avatar: 'SC',
    followerCount: 14300,
    bio: 'Olympic lifting and mobility mentor who helps athletes move stronger, safer, and with better form.',
    rating: 4.8,
    category: 'Mobility & Technique',
    coverImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'trainer-james',
    name: 'Dr. James Park',
    avatar: 'JP',
    followerCount: 20900,
    bio: 'Sports science-driven coach focused on nutrition, recovery, and performance optimization for busy athletes.',
    rating: 5.0,
    category: 'Nutrition & Recovery',
    coverImage: 'https://images.unsplash.com/photo-1526401485004-7ae168867a5a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'trainer-megha',
    name: 'Megha Patel',
    avatar: 'MP',
    followerCount: 12600,
    bio: 'Everyday fitness mentor specializing in home workouts, accountability, and sustainable transformation.',
    rating: 4.7,
    category: 'Home Workout',
    coverImage: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1200&q=80',
  },
];

export const FITNESS_PROGRAMS: FitnessProgram[] = [
  {
    id: 'p1',
    title: 'PPL Muscle Building',
    priceMonthly: 2499,
    trainers: ['trainer-marcus'],
    schedule: ['Mon: Push', 'Tue: Pull', 'Wed: Legs', 'Thu: Push', 'Fri: Pull', 'Sat: Legs'],
    trialClasses: [
      { id: 'trial-1', title: 'Bench Press Fundamentals', duration: '12 mins', category: 'Strength & Form', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
      { id: 'trial-2', title: 'Squat Setup & Depth', duration: '10 mins', category: 'Strength & Form', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    ],
    description: 'A 12-week track that blends heavy compound strength work with targeted hypertrophy sessions for consistent muscle gain and proper recovery.',
  },
  {
    id: 'p2',
    title: 'Starting Strength',
    priceMonthly: 2199,
    trainers: ['trainer-sarah'],
    schedule: ['Mon: Squat', 'Wed: Press', 'Fri: Deadlift', 'Sat: Accessory'],
    trialClasses: [
      { id: 'trial-3', title: 'Back Squat Basics', duration: '14 mins', category: 'Technique', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
      { id: 'trial-4', title: 'Deadlift Positioning', duration: '11 mins', category: 'Technique', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    ],
    description: 'A technical beginner-friendly strength program focused on the big barbell lifts, mobility prep, and durable progression.',
  },
  {
    id: 'p3',
    title: 'Recovery & Nutrition Reset',
    priceMonthly: 1899,
    trainers: ['trainer-james'],
    schedule: ['Mon: Mobility', 'Tue: Nutrition Lab', 'Thu: Low-Impact Strength', 'Sat: Recovery Flow'],
    trialClasses: [
      { id: 'trial-5', title: 'Sleep & Recovery Essentials', duration: '18 mins', category: 'Recovery', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
      { id: 'trial-6', title: 'Nutrition for Muscle Repair', duration: '20 mins', category: 'Nutrition', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    ],
    description: 'A six-week recovery-first program emphasizing nutrition, sleep hygiene, and guided movement to rebuild resilience.',
  },
  {
    id: 'p4',
    title: 'Home Transformation Lab',
    priceMonthly: 1599,
    trainers: ['trainer-megha'],
    schedule: ['Mon: Full Body', 'Wed: Core & Metcon', 'Fri: Strength', 'Sun: Active Recovery'],
    trialClasses: [
      { id: 'trial-7', title: 'Home Workout Circuit', duration: '15 mins', category: 'Home Training', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
      { id: 'trial-8', title: 'Bodyweight Strength Progression', duration: '13 mins', category: 'Form & Tempo', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    ],
    description: 'A flexible home workout program with minimal equipment, daily coaching, and scalable progress across strength and conditioning.',
  },
];

export function getTrainerById(trainerId: string): Trainer | undefined {
  return TRAINERS.find(trainer => trainer.id === trainerId);
}

export function getProgramsByTrainer(trainerId: string): FitnessProgram[] {
  return FITNESS_PROGRAMS.filter(program => program.trainers.includes(trainerId));
}

export function getFitnessProgramById(programId: string): FitnessProgram | undefined {
  return FITNESS_PROGRAMS.find(program => program.id === programId);
}

export function getLiveSessionById(sessionId: string): LiveSession | undefined {
  return LIVE_SESSIONS.find(session => session.id === sessionId);
}

const buildExercises = (workoutId: string, defs: { name: string; sets: { reps: number; weight: number; completed?: boolean }[] }[]): AssignedExercise[] =>
  defs.map((d, i) => ({
    id: `${workoutId}_ex${i}`,
    workoutId,
    name: d.name,
    sets: d.sets.map(s => ({ reps: s.reps, weight: s.weight, completed: s.completed ?? false })),
  }));

export const MOCK_WORKOUTS: Workout[] = [
  {
    id: 'wk_today',
    title: 'Push Day A',
    targetDate: todayStr(),
    clientId: 'u_client_1',
    createdByTrainerId: 'u_trainer_1',
    status: 'pending',
    exercises: buildExercises('wk_today', [
      { name: 'Barbell Bench Press', sets: [{ reps: 5, weight: 225 }, { reps: 5, weight: 225 }, { reps: 5, weight: 225 }, { reps: 5, weight: 225 }] },
      { name: 'Incline Dumbbell Press', sets: [{ reps: 10, weight: 75 }, { reps: 10, weight: 75 }, { reps: 10, weight: 75 }] },
      { name: 'Overhead Press', sets: [{ reps: 8, weight: 135 }, { reps: 8, weight: 135 }, { reps: 8, weight: 135 }] },
      { name: 'Lateral Raises', sets: [{ reps: 15, weight: 25 }, { reps: 15, weight: 25 }, { reps: 15, weight: 25 }] },
    ]),
  },
  {
    id: 'wk_today_sc',
    title: 'Lower Body Conditioning',
    targetDate: todayStr(),
    clientId: 'u_client_2',
    createdByTrainerId: 'u_trainer_1',
    status: 'pending',
    exercises: buildExercises('wk_today_sc', [
      { name: 'Goblet Squat', sets: [{ reps: 12, weight: 50 }, { reps: 12, weight: 50 }, { reps: 12, weight: 50 }] },
      { name: 'Romanian Deadlift', sets: [{ reps: 10, weight: 95 }, { reps: 10, weight: 95 }, { reps: 10, weight: 95 }] },
      { name: 'Walking Lunges', sets: [{ reps: 12, weight: 40 }, { reps: 12, weight: 40 }] },
    ]),
  },
  {
    id: 'wk_today_jm',
    title: 'Heavy Pull Day',
    targetDate: todayStr(),
    clientId: 'u_client_3',
    createdByTrainerId: 'u_trainer_1',
    status: 'pending',
    exercises: buildExercises('wk_today_jm', [
      { name: 'Deadlift', sets: [{ reps: 3, weight: 405 }, { reps: 3, weight: 405 }, { reps: 3, weight: 405 }] },
      { name: 'Weighted Pull-ups', sets: [{ reps: 8, weight: 25 }, { reps: 8, weight: 25 }, { reps: 8, weight: 25 }] },
    ]),
  },
  {
    id: 'wk_past_1',
    title: 'Pull Day A',
    targetDate: dayOffset(-2),
    clientId: 'u_client_1',
    createdByTrainerId: 'u_trainer_1',
    status: 'completed',
    exercises: buildExercises('wk_past_1', [
      { name: 'Deadlift', sets: [{ reps: 5, weight: 315, completed: true }, { reps: 5, weight: 315, completed: true }, { reps: 5, weight: 315, completed: true }] },
      { name: 'Barbell Row', sets: [{ reps: 8, weight: 185, completed: true }, { reps: 8, weight: 185, completed: true }, { reps: 8, weight: 185, completed: true }] },
    ]),
  },
  {
    id: 'wk_past_2',
    title: 'Leg Day A',
    targetDate: dayOffset(-4),
    clientId: 'u_client_1',
    createdByTrainerId: 'u_trainer_1',
    status: 'completed',
    exercises: buildExercises('wk_past_2', [
      { name: 'Back Squat', sets: [{ reps: 5, weight: 275, completed: true }, { reps: 5, weight: 275, completed: true }, { reps: 5, weight: 275, completed: true }] },
      { name: 'Leg Press', sets: [{ reps: 12, weight: 360, completed: true }, { reps: 12, weight: 360, completed: true }] },
    ]),
  },
  // Alex — upcoming assigned for later this week
  {
    id: 'wk_future_1',
    title: 'Pull Day B',
    targetDate: dayOffset(2),
    clientId: 'u_client_1',
    createdByTrainerId: 'u_trainer_1',
    status: 'pending',
    exercises: buildExercises('wk_future_1', [
      { name: 'Deadlift', sets: [{ reps: 3, weight: 315 }, { reps: 3, weight: 315 }, { reps: 3, weight: 315 }] },
      { name: 'Pull-ups', sets: [{ reps: 8, weight: 0 }, { reps: 8, weight: 0 }, { reps: 8, weight: 0 }] },
    ]),
  },
];

export const MOCK_ANALYTICS: AnalyticsEntry[] = [
  // Alex — last 7 days
  { id: 'a1', clientId: 'u_client_1', date: dayOffset(-6), weight: 186.2, waterMl: 2200, caloriesBurned: 480, steps: 8200 },
  { id: 'a2', clientId: 'u_client_1', date: dayOffset(-5), weight: 186.0, waterMl: 2500, caloriesBurned: 520, steps: 9100 },
  { id: 'a3', clientId: 'u_client_1', date: dayOffset(-4), weight: 185.5, waterMl: 2000, caloriesBurned: 610, steps: 11200 },
  { id: 'a4', clientId: 'u_client_1', date: dayOffset(-3), weight: 185.8, waterMl: 2400, caloriesBurned: 450, steps: 7400 },
  { id: 'a5', clientId: 'u_client_1', date: dayOffset(-2), weight: 185.2, waterMl: 2700, caloriesBurned: 580, steps: 8500 },
  { id: 'a6', clientId: 'u_client_1', date: dayOffset(-1), weight: 185.0, waterMl: 2100, caloriesBurned: 540, steps: 9800 },
  { id: 'a7', clientId: 'u_client_1', date: dayOffset(0), weight: 185.0, waterMl: 1200, caloriesBurned: 210, steps: 4200 },
  // Sarah
  { id: 'a8', clientId: 'u_client_2', date: dayOffset(0), weight: 142.3, waterMl: 1800, caloriesBurned: 320, steps: 5400 },
  // Jake
  { id: 'a9', clientId: 'u_client_3', date: dayOffset(-3), weight: 210.5, waterMl: 1500, caloriesBurned: 0, steps: 2100 },
];

export const MOCK_GROUP_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'group1',
    senderId: 'u_trainer_1',
    receiverId: 'u_client_1',
    text: 'Community update: the morning mobility flow is now live for everyone.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: true,
    tag: 'general',
    groupId: 'community',
    groupType: 'community',
  },
  {
    id: 'group2',
    senderId: 'u_client_1',
    receiverId: 'u_trainer_1',
    text: 'Coach, I want to share a quick form clip for your eyes only.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: true,
    tag: 'form_review',
    mediaUrl: 'mock-video',
    mediaType: 'video',
    whisper: true,
    whisperTo: 'u_trainer_1',
    groupId: 'community',
    groupType: 'community',
  },
  {
    id: 'group3',
    senderId: 'u_client_2',
    receiverId: 'u_client_1',
    text: 'Squad check-in: the recovery circuit is going well this week.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: true,
    tag: 'general',
    groupId: 'squad',
    groupType: 'squad',
  },
  {
    id: 'group4',
    senderId: 'u_client_1',
    receiverId: 'u_trainer_1',
    text: 'Private note for the coach only before tonight’s broadcast.',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    read: true,
    tag: 'general',
    whisper: true,
    whisperTo: 'u_trainer_1',
    groupId: 'broadcast',
    groupType: 'broadcast',
  },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'msg1', senderId: 'u_trainer_1', receiverId: 'u_client_1', text: "Good morning Alex! Ready to crush Push Day today? Focus on controlled tempo on bench — 2 sec eccentric.", timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), read: true, tag: 'general' },
  { id: 'msg2', senderId: 'u_client_1', receiverId: 'u_trainer_1', text: "Morning Coach! Feeling recovered. Going for 225x5 on bench.", timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), read: true, tag: 'general' },
  { id: 'msg3', senderId: 'u_trainer_1', receiverId: 'u_client_1', text: "That's the mindset. Send me a form check video on set 2 — I want to check your elbow flare.", timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), read: true, tag: 'general' },
  { id: 'msg4', senderId: 'u_client_1', receiverId: 'u_trainer_1', text: "Will do! Also my shoulder felt a little tight yesterday, any warmup tweaks?", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), read: false, tag: 'general', priority: 'high' },
  // Trainer <-> Sarah
  { id: 'msg5', senderId: 'u_client_2', receiverId: 'u_trainer_1', text: "Coach, I'm struggling with the RDL depth — feels like my hamstrings are tight.", timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), read: false, tag: 'form_review', priority: 'high' },
  { id: 'msg6', senderId: 'u_trainer_1', receiverId: 'u_client_2', text: "Let's add a 5-min dynamic hamstring flow before RDLs. I'll send a video later today.", timestamp: new Date(Date.now() - 3600000 * 7).toISOString(), read: true, tag: 'general' },
  // Trainer <-> Jake
  { id: 'msg7', senderId: 'u_client_3', receiverId: 'u_trainer_1', text: "Missed yesterday's session — work got crazy. Rescheduling for tomorrow.", timestamp: new Date(Date.now() - 3600000 * 72).toISOString(), read: true, tag: 'general' },
];

export const MOCK_FORM_CHECKS: FormCheckSubmission[] = [
  {
    id: 'fc1',
    clientId: 'u_client_1',
    exerciseName: 'Barbell Bench Press — Set 2',
    videoUrl: 'https://example.com/video1.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/4162485/pexels-photo-4162485.jpeg?auto=compress&cs=tinysrgb&w=600',
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending',
  },
  {
    id: 'fc2',
    clientId: 'u_client_2',
    exerciseName: 'Romanian Deadlift — Set 1',
    videoUrl: 'https://example.com/video2.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/4164744/pexels-photo-4164744.jpeg?auto=compress&cs=tinysrgb&w=600',
    submittedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    status: 'pending',
  },
  {
    id: 'fc3',
    clientId: 'u_client_1',
    exerciseName: 'Squat — Set 3',
    videoUrl: 'https://example.com/video3.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/4162485/pexels-photo-4162485.jpeg?auto=compress&cs=tinysrgb&w=600',
    submittedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    status: 'reviewed',
    trainerFeedback: "Good depth on the squat, Alex. One note: your right knee tends to cave in slightly at the bottom. Focus on driving your knees out on the way up. Add banded squats to your warmup next session.",
  },
];

export const DAILY_MOTIVATION = "You don't have to be great to start, but you have to start to be great. Let's make today count. — Coach Marcus";

export function getTodaysWorkout(clientId: string): Workout | undefined {
  const today = todayStr();
  return MOCK_WORKOUTS.find(w => w.clientId === clientId && w.targetDate === today && w.status === 'pending');
}

export function getTodaysAnalytics(clientId: string): AnalyticsEntry | undefined {
  const today = todayStr();
  return MOCK_ANALYTICS.find(a => a.clientId === clientId && a.date === today);
}

export function getTrainerClients(trainerId: string): User[] {
  return MOCK_USERS.filter(u => u.role === 'client' && u.trainerId === trainerId);
}

// ============ LIVE STREAMING MOCK DATA ============

export const MOCK_LIVE_PARTICIPANTS: LiveParticipant[] = [
  { id: 'u_client_1', name: 'Alex Rivera', initials: 'AR', connectionStatus: 'good', isMuted: true, isVideoOn: false },
  { id: 'u_client_2', name: 'Sarah Chen', initials: 'SC', connectionStatus: 'good', isMuted: true, isVideoOn: false },
  { id: 'u_client_3', name: 'Jake Morrison', initials: 'JM', connectionStatus: 'fair', isMuted: true, isVideoOn: false },
  { id: 'p1', name: 'Tom Reyes', initials: 'TR', connectionStatus: 'good', isMuted: true, isVideoOn: false },
  { id: 'p2', name: 'Mia Cole', initials: 'MC', connectionStatus: 'good', isMuted: true, isVideoOn: false },
  { id: 'p3', name: 'Dave West', initials: 'DW', connectionStatus: 'poor', isMuted: true, isVideoOn: false },
];

export const MOCK_LIVE_CHAT_SEED: Omit<LiveChatMessage, 'sessionId'>[] = [
  { id: 'lc1', userId: 'u_client_2', userName: 'Sarah Chen', userRole: 'client', message: 'Ready to go!', timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: 'lc2', userId: 'u_client_1', userName: 'Alex Rivera', userRole: 'client', message: 'Let\'s crush this!', timestamp: new Date(Date.now() - 90000).toISOString() },
  { id: 'lc3', userId: 'p1', userName: 'Tom Reyes', userRole: 'client', message: 'First time joining, excited!', timestamp: new Date(Date.now() - 60000).toISOString() },
  { id: 'lc4', userId: 'u_client_3', userName: 'Jake Morrison', userRole: 'client', message: 'Is this the HIIT session?', timestamp: new Date(Date.now() - 45000).toISOString() },
  { id: 'lc5', userId: 'u_trainer_1', userName: 'Marcus Webb', userRole: 'trainer', message: 'Welcome everyone! We\'ll start with a 5-min warmup, then hit 4 rounds of HIIT.', timestamp: new Date(Date.now() - 30000).toISOString() },
];

export const MOCK_CHAT_REPLIES = [
  'Keep that core tight!',
  'Great form everyone!',
  'Push through this last round!',
  'Stay hydrated — quick water break after this set.',
  'Remember to breathe on the exertion phase.',
];

export function getWorkoutById(id: string): Workout | undefined {
  return MOCK_WORKOUTS.find(w => w.id === id);
}

export function getWorkoutsForTrainer(trainerId: string): Workout[] {
  return MOCK_WORKOUTS.filter(w => w.createdByTrainerId === trainerId);
}
