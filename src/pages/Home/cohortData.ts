export const cohort = {
  slug: "python-automation",
  title: "Python Automation",
  headline: "Learn Python by automating the boring parts of work",
  summary:
    "No experience needed. In 12 weeks you'll go from your first line of code to scripts that clean spreadsheets, send emails and run on their own.",
  startDate: "Nov 3",
  weeks: 12,
  schedule: "Tue & Thu, 7–9pm WAT", // TODO: real class days and times
  seatsTotal: 20,
  seatsTaken: 14, // TODO: load from your API
  price: "₦50,000", // TODO: real price
  outcomes: [
    {
      title: "Tame messy spreadsheets",
      text: "Clean, merge and report on Excel and CSV files in seconds.",
    },
    {
      title: "Send things automatically",
      text: "Emails, reports and reminders that go out without you.",
    },
    {
      title: "Collect data from the web",
      text: "Pull prices, listings and records from websites into a sheet.",
    },
    {
      title: "Run it on a schedule",
      text: "Scripts that work while you sleep, so the task never lands on you again.",
    },
  ],
};

export const seatsLeft = cohort.seatsTotal - cohort.seatsTaken;


export interface RoadmapWeek {
  week: number;
  title: string;
  topics: string[];
  build: string;
}

export interface RoadmapPhase {
  name: string;
  goal: string;
  weeks: RoadmapWeek[];
}

export const roadmap: RoadmapPhase[] = [
  {
    name: "Python foundations",
    goal: "Get comfortable writing and running your own code.",
    weeks: [
      {
        week: 1,
        title: "Your first scripts",
        topics: [
          "Setting up Python and your editor",
          "Running a script, printing and reading input",
          "Variables, numbers and text",
        ],
        build: "A tip and bill-splitting calculator",
      },
      {
        week: 2,
        title: "Decisions and repetition",
        topics: [
          "Comparisons and if / else",
          "Loops: doing a task 1,000 times",
          "Reading error messages without panic",
        ],
        build: "A bulk price calculator with discounts",
      },
      {
        week: 3,
        title: "Organising information",
        topics: [
          "Lists and dictionaries",
          "Writing your own functions",
          "Keeping code tidy and reusable",
        ],
        build: "A command-line contact book",
      },
    ],
  },
  {
    name: "Files and spreadsheets",
    goal: "Take over the repetitive file and Excel work.",
    weeks: [
      {
        week: 4,
        title: "Files and folders",
        topics: [
          "Reading and writing files",
          "Working with folders and paths",
          "Renaming and moving files in bulk",
        ],
        build: "A script that sorts your Downloads folder",
      },
      {
        week: 5,
        title: "CSV and Excel",
        topics: [
          "Opening spreadsheets from Python",
          "Reading, editing and saving Excel files",
          "Finding and fixing bad data",
        ],
        build: "A messy sales sheet cleaner",
      },
      {
        week: 6,
        title: "Clean, summarise, report",
        topics: [
          "Filtering, sorting and grouping with pandas",
          "Totals, averages and monthly summaries",
          "Exporting a finished report",
        ],
        build: "A one-click monthly report generator",
      },
    ],
  },
  {
    name: "Automating the real world",
    goal: "Connect your scripts to email, websites and the clock.",
    weeks: [
      {
        week: 7,
        title: "Email automation",
        topics: [
          "Sending emails from Python",
          "Templates and personalised messages",
          "Attaching files and reports",
        ],
        build: "An automatic report-by-email sender",
      },
      {
        week: 8,
        title: "Collecting data from websites",
        topics: [
          "How web pages are structured",
          "Fetching and parsing pages",
          "Saving results to a spreadsheet",
        ],
        build: "A product price tracker",
      },
      {
        week: 9,
        title: "APIs and live data",
        topics: [
          "What an API is and how to call one",
          "Working with JSON data",
          "Handling failures and rate limits",
        ],
        build: "A live naira exchange-rate checker",
      },
      {
        week: 10,
        title: "Run it by itself",
        topics: [
          "Scheduling scripts to run daily or weekly",
          "Logging and error handling",
          "Making scripts safe to leave unattended",
        ],
        build: "A daily report that runs while you sleep",
      },
    ],
  },
  {
    name: "Ship your own automation",
    goal: "Automate a real task from your own work or life.",
    weeks: [
      {
        week: 11,
        title: "Capstone: plan and build",
        topics: [
          "Choosing a task worth automating",
          "Breaking it into small steps",
          "Building with instructor feedback",
        ],
        build: "Your own automation, first working version",
      },
      {
        week: 12,
        title: "Capstone: polish and present",
        topics: [
          "Testing and fixing edge cases",
          "Documenting so others can use it",
          "Demo day and next steps",
        ],
        build: "A finished project you can show employers or clients",
      },
    ],
  },
];