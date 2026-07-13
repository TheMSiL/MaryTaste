export const categories = [
  "Сніданки",
  "Супи",
  "Основні страви",
  "Випічка",
  "Десерти",
  "Напої",
] as const;

export const difficulties = ["Легко", "Середньо", "Складно"] as const;

export const categoryOptions = categories.map((value) => ({
  value,
  label: value,
}));
export const difficultyOptions = difficulties.map((value) => ({
  value,
  label: value,
}));
