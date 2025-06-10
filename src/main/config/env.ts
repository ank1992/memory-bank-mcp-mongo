export const env = {
  MONGODB_URL: process.env.MONGODB_URL!,
  MONGODB_DB: process.env.MONGODB_DB || "memory_bank",
};

export function getEnv() {
  return env;
}
