# 🌉 MuxBridge: Enterprise Job Matching & AI "Observation System" Monorepo

MuxBridge is a high-performance recruitment, automated assessment, and intelligent proctoring platform. Built as a monorepo, it matches candidates with company listings using GPA/skills heuristics and features the **Observation System**—a zero-server-cost, privacy-first proctoring engine that runs entirely client-side in the browser.

---

## 📁 Program Structure & Directory Map

```text
MuxBridge/
├── apps/
│   ├── client/                  # Next.js 16 Client Portal (React 19, Tailwind CSS v4)
│   │   ├── public/              # Static files and assets
│   │   └── src/
│   │       └── app/             # Next.js App Router
│   │           ├── admin/       # Verification dashboard for platform administrators
│   │           ├── auth/        # Role-based login and registration (Student, Company, Admin)
│   │           ├── company/     # Recruiter panel to post jobs, design exams, audit logs
│   │           └── student/     # Student panel (profiles, job matches, proctored exams)
│   │               ├── exam/    # The core proctored examination portal
│   │               │   └── page.tsx # Glassmorphic UI with local webcam AI, mic, and shields
│   │               └── kys/     # "Know Your Student" academic and skill profile settings
│   │
│   └── api/                     # NestJS 11 Backend API (Express-based REST server)
│       ├── prisma/              # Prisma database setup
│       │   ├── schema.prisma    # Database schema (User, Profile, Job, Exam, ProctoringLog)
│       │   ├── dev.db           # Local development SQLite database
│       │   └── seed.ts          # Mock seed data (100 students, 15 companies, 30 job listings)
│       └── src/
│           ├── auth/            # JWT-based authorization and login service
│           ├── evaluation/      # Subjective question automated evaluation logic
│           ├── exams/           # Exam attempt states and dynamic question recommendation
│           ├── jobs/            # GPA & skill-matching recommendation logic & leaderboard
│           └── proctoring/      # Real-time event auditing and Trust Score calculations
│
├── docker-compose.yml           # PostgreSQL database docker container definition
└── README.md                    # Platform root documentation
```

---

## 🛠️ Technical Terms Demystified

This platform implements advanced browser features, state management concepts, and design models. Below are the key technical terms used:

### 1. Client-Side Neural Network Inference
Instead of sending video frames to a remote server (which costs a fortune to run at scale), the AI model runs locally on the candidate's computer inside the browser using **TensorFlow.js** and the **COCO-SSD** (Common Objects in Context - Single Shot MultiBox Detector) model. The browser downloads the model parameters once, and the local CPU/GPU classifies images locally.

### 2. Dynamic UMD (Universal Module Definition) Loading
To keep the Next.js bundle size small and pages loading quickly, machine learning libraries are not packaged in the webpack/turbopack client bundle. Instead, they are dynamically injected at runtime via script tags. The script loading logic enforces `script.async = false` to guarantee that the core TensorFlow.js engine finishes executing and registers its global variables on the `window` object before COCO-SSD starts loading.

### 3. Web Audio API & AnalyserNode
An audio processing interface in browser engines. The platform streams the student's microphone into an `AnalyserNode` to compute a Real-Time Fourier Transform (FFT). By sampling frequency bins and calculating average amplitudes (0-128 range mapped to a 0-100 visual meter), the system checks for speech or background volume spikes.

### 4. Gaze & Head Position Deviation Heuristic
A geometric deviation check. The system benchmarks the bounding box (`bbox: [x, y, width, height]`) of the student's face relative to previous frames. If coordinate shifts exceed thresholds (horizontal shift > 45px, vertical shift > 35px), it identifies that the student is looking away from the exam.

### 5. MutationObserver DOM Shield
A built-in Web API that watches for additions or changes in the DOM tree (Document Object Model). The system registers an observer on `document.body` to instantly flag if translation tools, clipboard managers, or screen recorders inject script tags or classes (`goog-gt`, `extension-`, `proctor-`) into the page.

### 6. React State Closure Capture & Refs (`useRef`)
In React, async functions (like `setTimeout` or `requestAnimationFrame` loops) can trap old states in their closures from the render cycle they were started in. In our proctoring loop, the warning count was stuck at `0` because it captured initial state. By storing variables in `useRef` (e.g. `warningCountRef`, `trustScoreRef`), the async code can access the static object pointer and fetch the latest mutable state value (`.current`) at any time.

### 7. Infraction Debouncing (Cooldown)
To prevent a single infraction (like a phone visible in frame) from triggering three warnings in a split second and immediately terminating the exam, the system "debounces" triggers. While the warning modal is open, further camera and microphone checks are suspended. The candidate must explicitly click "I Acknowledge & Comply" before checks resume, giving them room to put away devices.

### 8. Glassmorphism Design
A modern design system featuring frosted-glass elements. It is achieved using Tailwind CSS backdrop blurs (`backdrop-blur-md`), translucent colors (`bg-white/[0.02]`), and subtle inner highlights (`shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]`) over dark, glowing backgrounds.

---

## 🏁 Setup and Commands

### Prerequisites
*   Node.js (v20+)
*   Docker (Optional, for production Postgres container)

### Step 1: Run the Database
Spin up the PostgreSQL docker container (or default to the preconfigured dev SQLite database):
```bash
docker-compose up -d
```

### Step 2: Boot NestJS Backend API (`apps/api`)
```bash
cd apps/api
npm install
npx prisma db push   # Sets up database tables
npm run seed         # Seeds sample data
npm run start:dev    # Starts server on http://localhost:4000
```

### Step 3: Boot Next.js Frontend Client (`apps/client`)
```bash
cd ../client
npm install
npm run dev          # Starts dashboard on http://localhost:3000
```

---

## 🔬 Demonstration Guide (Simulator Panel)
To easily demonstrate the proctoring logic, use the **Simulator Panel** built into the exam sidebar:
1. Navigate to `http://localhost:3000/student`.
2. Click **Start Now** on the exam card to start a fresh attempt.
3. Grant camera/microphone permissions.
4. Click the simulator buttons on the left sidebar to manually trigger **Mobile Phone**, **Extra Person**, **Face Lost**, or **Audio Spike** infractions.
5. Notice the frosted-glass modal popup blur the exam behind it and display the warning.
6. Trigger infractions three times to see the automated lockout screen.
