// ============ EXISTING TYPES (kept for backward compatibility) ============

export type Page = 'dashboard' | 'workout' | 'programs' | 'coach' | 'live' | 'recordings' | 'progress' | 'profile' | 'messages' | 'meal_plan' | 'meal_plan_results';
export type TrainerPage = 'roster' | 'program' | 'nutrition' | 'formcheck' | 'inbox' | 'studio';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingSplit = 'full_body' | 'upper_lower' | 'ppl' | 'bro_split';
export type Equipment = 'full_gym' | 'home_gym' | 'dumbbells_only' | 'bodyweight';
export type Goal = 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance' | 'general_fitness';
export type DietType = 'veg' | 'non_veg' | 'vegan';
export type FitnessGoal = 'fat_loss' | 'muscle_gain';
export type CuisineType = 'indian' | 'continental' | 'asian' | 'mediterranean' | 'mexican';

export interface UserProfile {
  name: string;
  email: string;
  goals: Goal[];
  experience: ExperienceLevel;
  equipment: Equipment;
  trainingSplit: TrainingSplit;
  subscriptionTier: 'free' | 'monthly' | 'quarterly' | 'annual';
  subscriptionType?: 'free' | 'batch' | 'personal';
  activeCoachName?: string;
  streakDays: number;
  joinDate: string;
  weight: number;
  height: number;
  avatar?: string;
  premium_feature_unlocked?: boolean;
  dietType?: DietType;
  nutritionGoal?: FitnessGoal;
  cuisineType?: CuisineType;
}

export interface MealMacros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealPlan {
  id: string;
  title: string;
  dietType: DietType;
  fitnessGoal: FitnessGoal;
  cuisineType: CuisineType;
  meals: {
    breakfast: string;
    lunch: string;
    snacks: string;
    dinner: string;
  };
  macros: MealMacros;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string[];
  equipment: string;
  difficulty: ExperienceLevel;
  instructions?: string;
}

export interface ExerciseSet {
  reps: number;
  weight: number;
  rpe?: number;
  completed: boolean;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  name: string;
  duration: number;
  exercises: WorkoutExercise[];
  notes?: string;
  totalVolume: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: { exercise: Exercise; sets: number; reps: string; restSeconds: number }[];
  estimatedDuration: number;
  category: string;
}

export interface Trainer {
  id: string;
  name: string;
  avatar: string;
  followerCount: number;
  bio: string;
  rating: number;
  category: string;
  coverImage?: string;
}

export interface FitnessProgram {
  id: string;
  title: string;
  priceMonthly: number;
  trainers: string[];
  schedule: string[];
  trialClasses: {
    id: string;
    title: string;
    duration: string;
    category: string;
    videoUrl: string;
  }[];
  description: string;
}

export interface LiveSession {
  id: string;
  title: string;
  trainerId: string;
  startTime: string;
  status: 'upcoming' | 'live' | 'ended';
  isFree: boolean;
  categoryTag: string;
  videoUrl: string;
  coach?: string;
  coachAvatar?: string;
  date?: string;
  time?: string;
  duration?: number;
  spotsTotal?: number;
  spotsRemaining?: number;
  topic?: string;
  tags?: string[];
  isPremium?: boolean;
  summary?: string;
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ProgressEntry {
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
}

export interface PricingPlan {
  id: 'monthly' | 'quarterly' | 'annual';
  name: string;
  price: number;
  billingPeriod: string;
  pricePerMonth: number;
  savings?: string;
  features: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
}

// ============ NEW DUAL-INTERFACE TYPES ============

export type Role = 'client' | 'trainer' | 'admin';
export type WorkoutStatus = 'pending' | 'completed';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  avatarUrl?: string;
  avatarInitials: string;
  trainerId?: string | null;
  // client-specific metadata
  goals?: Goal[];
  compliance?: number; // program compliance %
  lastActive?: string;
  weight?: number;
  height?: number;
  streakDays?: number;
}

export interface AssignedSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface AssignedExercise {
  id: string;
  workoutId: string;
  name: string;
  sets: AssignedSet[];
  videoUrl?: string;
  feedback?: string;
}

export interface Workout {
  id: string;
  title: string;
  targetDate: string; // ISO date
  clientId: string;
  createdByTrainerId: string;
  status: WorkoutStatus;
  exercises: AssignedExercise[];
  notes?: string;
}

export interface AnalyticsEntry {
  id: string;
  clientId: string;
  date: string; // ISO date
  weight: number;
  waterMl: number;
  caloriesBurned: number;
  steps: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string; // ISO
  mediaUrl?: string; // form check video etc.
  mediaType?: 'image' | 'audio' | 'video';
  read: boolean;
  priority?: 'normal' | 'high';
  tag?: 'form_review' | 'general';
  whisper?: boolean;
  whisperTo?: string | null;
  groupId?: string;
  groupType?: 'community' | 'squad' | 'broadcast';
}

export interface FormCheckSubmission {
  id: string;
  clientId: string;
  workoutId?: string;
  exerciseName: string;
  videoUrl: string;
  thumbnailUrl: string;
  submittedAt: string;
  status: 'pending' | 'reviewed';
  trainerFeedback?: string;
}

// ============ LIVE STREAMING TYPES ============

export type LiveSessionStatus = 'scheduled' | 'live' | 'ended';

export interface LiveStreamSession {
  id: string;
  trainerId: string;
  title: string;
  linkedWorkoutId?: string;
  status: LiveSessionStatus;
  startedAt?: string;
  endedAt?: string;
  viewerCount: number;
  createdAt: string;
}

export interface LiveChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userRole: 'client' | 'trainer';
  message: string;
  timestamp: string;
}

export interface LiveReaction {
  id: string;
  emoji: string;
  timestamp: number;
}

export interface LiveParticipant {
  id: string;
  name: string;
  initials: string;
  connectionStatus: 'good' | 'fair' | 'poor';
  isMuted: boolean;
  isVideoOn: boolean;
}
