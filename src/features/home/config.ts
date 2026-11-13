/*
 * Where the landing page sends people. Change these to match your app's routes.
 * Plain links are used so the home folder works with any router.
 */
export const homeLinks = {
  playground: "/playground",
  signIn: "/auth/login",
  getStarted: "/auth/signup",
} as const;

export const homeSections = [
  { id: "how-it-works", label: "How it works" },
  { id: "classroom", label: "Live classroom" },
  { id: "practice", label: "Practice" },
  { id: "learning", label: "Ways to learn" },
] as const;
