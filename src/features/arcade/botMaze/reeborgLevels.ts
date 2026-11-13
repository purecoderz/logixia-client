export type Direction = "E" | "N" | "W" | "S";

export const TILE_EMPTY = 0;
export const TILE_WALL = 1;
export const TILE_GOAL = 2;
export const TILE_HURDLE_TOP = 3;
export const TILE_HURDLE_RIGHT = 4;
export const TILE_HURDLE_BOTTOM = 5;
export const TILE_HURDLE_LEFT = 6;

export interface MazeToken {
  x: number;
  y: number;
  count: number;
}

export interface MazeLevel {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  xp: number;
  fuelLimit: number;
  cols: number;
  rows: number;
  start: { x: number; y: number; dir: Direction };
  goal: { x: number; y: number };
  /** Wall on the RIGHT edge of cell "x,y" (blocks moving E from (x,y) or W from (x+1,y)). */
  rightWalls: string[];
  /** Wall on the TOP edge of cell "x,y" (blocks moving N from (x,y) or S from (x,y+1)). */
  topWalls: string[];
  /** Optional solid blocked cells "x,y" (like TILE_WALL in a 2D matrix). */
  blockedCells?: string[];
  tokens: MazeToken[];
  /** If true, all tokens on the map must be collected (and goal reached). */
  requireAllTokensCollected?: boolean;
  /** Minimum number of tokens that must be placed at the goal cell. */
  requireTokensAtGoal?: number;
  hint: string;
  starterCode: string;
}

export interface TraceFrame {
  x: number;
  y: number;
  dir: Direction;
  tokens: Record<string, number>;
  carried: number;
  action: string;
  error?: string;
  done?: boolean;
}

export const MAZE_LEVELS: MazeLevel[] = [
  {
    id: "first-steps",
    number: 1,
    title: "First Steps",
    subtitle: "Navigate around the barrier to reach the checkered flag.",
    xp: 80,
    fuelLimit: 25,
    cols: 5,
    rows: 5,
    start: { x: 1, y: 1, dir: "E" },
    goal: { x: 5, y: 3 },
    rightWalls: ["2,1", "2,2"],
    topWalls: ["3,3", "4,3"],
    tokens: [],
    hint: "Reeborg only knows turn_left()! Define def turn_right(): by turning left 3 times.",
    starterCode: `# Reach the flag at (5, 3)!
# Built-in actions: move(), turn_left()

def turn_right():
    for _ in range(3):
        turn_left()

move()
move()
turn_left()
move()
move()
turn_right()
move()
move()
`,
  },
  {
    id: "hurdle-jump",
    number: 2,
    title: "Hurdle Jump",
    subtitle: "Jump over each hurdle using front_is_clear() and while not at_goal().",
    xp: 120,
    fuelLimit: 45,
    cols: 8,
    rows: 4,
    start: { x: 1, y: 1, dir: "E" },
    goal: { x: 8, y: 1 },
    rightWalls: ["2,1", "4,1", "6,1"],
    topWalls: [],
    tokens: [],
    hint: "Use while not at_goal(): — if front_is_clear(): move(), else jump()!",
    starterCode: `def turn_right():
    for _ in range(3):
        turn_left()

def jump():
    # TODO: jump over one hurdle
    pass

while not at_goal():
    if front_is_clear():
        move()
    else:
        jump()
`,
  },
  {
    id: "token-delivery",
    number: 3,
    title: "Token Delivery",
    subtitle: "Pick up all 3 tokens along the path and drop them at the goal.",
    xp: 120,
    fuelLimit: 35,
    cols: 6,
    rows: 4,
    start: { x: 1, y: 1, dir: "E" },
    goal: { x: 6, y: 1 },
    rightWalls: [],
    topWalls: ["1,1", "2,1", "3,1", "4,1", "5,1", "6,1"],
    tokens: [
      { x: 2, y: 1, count: 1 },
      { x: 3, y: 1, count: 1 },
      { x: 4, y: 1, count: 1 },
    ],
    requireAllTokensCollected: true,
    requireTokensAtGoal: 3,
    hint: "Use while object_here(): take(), then while carries_object(): put() at the goal.",
    starterCode: `# Collect every token along the corridor and place all 3 at (6, 1)

while not at_goal():
    # TODO: take any token here, then move()
    move()

# TODO: put() all carried tokens at the goal
`,
  },
  {
    id: "winding-maze",
    number: 4,
    title: "Winding Maze",
    subtitle: "Classic Reeborg Maze! Follow the right-hand wall to escape.",
    xp: 150,
    fuelLimit: 120,
    cols: 6,
    rows: 6,
    start: { x: 1, y: 1, dir: "N" },
    goal: { x: 6, y: 6 },
    rightWalls: [
      "1,1",
      "1,2",
      "1,3",
      "2,4",
      "2,5",
      "3,1",
      "3,2",
      "4,3",
      "4,4",
      "5,1",
      "5,2",
      "5,5",
    ],
    topWalls: [
      "2,2",
      "3,2",
      "4,2",
      "2,4",
      "3,4",
      "4,4",
      "5,4",
      "1,5",
    ],
    tokens: [],
    hint: "Right-hand rule: if right_is_clear(): turn_right(); move() — elif front_is_clear(): move() — else: turn_left().",
    starterCode: `def turn_right():
    for _ in range(3):
        turn_left()

# Classic right-hand wall follower:
# 1. If right_is_clear(): turn right and move
# 2. Else if front_is_clear(): move
# 3. Else: turn left
while not at_goal():
    pass
`,
  },
  {
    id: "harvest-grid",
    number: 5,
    title: "Harvest Grid",
    subtitle: "Sweep across the garden rows, collect every token, and finish at the flag.",
    xp: 160,
    fuelLimit: 60,
    cols: 5,
    rows: 4,
    start: { x: 1, y: 1, dir: "E" },
    goal: { x: 5, y: 4 },
    rightWalls: [],
    topWalls: [],
    tokens: [
      { x: 2, y: 1, count: 1 },
      { x: 4, y: 1, count: 1 },
      { x: 3, y: 2, count: 2 },
      { x: 1, y: 3, count: 1 },
      { x: 4, y: 4, count: 1 },
    ],
    requireAllTokensCollected: true,
    hint: "Sweep row by row! Use while object_here(): take() so cells with 2 tokens are fully cleared.",
    starterCode: `def turn_right():
    for _ in range(3):
        turn_left()

# Sweep all 4 rows, collect every token, and finish at (5, 4)
`,
  },
];
