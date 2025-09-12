export type CyclePhase = "menstruation" | "follicular" | "ovulation" | "luteal";

export interface PhaseMessage {
  title: string;
  text: string;
}

export const cyclePhaseMessages: Record<CyclePhase, PhaseMessage> = {
  menstruation: {
    title: "Today, your body is recharging ⚡",
    text: "Opt for a low-impact circuit (brisk walk, planks, static lunges). It's normal to feel bloated or tired: your body is working for you. Trust the process.",
  },
  follicular: {
    title: "Energy phase 💪",
    text: "Perfect for a light HIIT or full-body strength training. You have the green light to increase intensity, but always at your own pace.",
  },
  ovulation: {
    title: "Power peak! 🔥",
    text: "Great time for a cardio + strength circuit. Enjoy this natural energy boost, but stay in tune with your body.",
  },
  luteal: {
    title: "Slow down, progress 🕊️",
    text: "Favor gentle strength or moderate Pilates. Mood swings or changes in energy are normal: trust yourself.",
  },
};

// Function to determine the current phase based on cycle start date
export const getCyclePhase = (startDate: string, cycleLength = 28): CyclePhase => {
  const today = new Date();
  const start = new Date(startDate);
  const day = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) % cycleLength;

  if (day < 5) return "menstruation";       // days 0-4
  if (day < 12) return "follicular";       // days 5-11
  if (day < 16) return "ovulation";        // days 12-15
  return "luteal";                          // days 16+
};
