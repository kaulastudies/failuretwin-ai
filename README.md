# FailureTwin

FailureTwin helps a team stress-test a plan before launch by asking one question first: **if this fails, what likely went wrong?**

It walks a user through a structured plan intake, runs a live model-driven pre-mortem when available, and falls back to a deterministic engine if the live path is unavailable.

## What's in the app

- **Plan intake** - collect the title, description, audience, budget, deadline, industry, constraints, assumptions, risk tolerance, and success metric.
- **Follow-up questions** - fill gaps in the plan before analysis starts.
- **Live analysis path** - send the simulation to a local Node endpoint at `/api/analyze`.
- **Deterministic fallback** - keep the workflow working if the live model call fails.
- **Four perspectives** - customer, operations, finance, and risk.
- **Failure chains** - connect assumptions, risks, consequences, and safeguards.
- **Decision brief** - summarize readiness, recommendation, and next steps.
- **Local persistence** - store simulations and analysis in the browser.

## Project structure

- `src/pages/new-simulation.tsx` - create a new simulation
- `src/pages/follow-up-room.tsx` - collect missing context and trigger analysis
- `src/pages/analysis-room.tsx` - view the analysis results
- `src/pages/failure-chain-room.tsx` - inspect failure chains
- `src/pages/decision-room.tsx` - review safeguards and readiness changes
- `src/pages/decision-brief.tsx` - print-friendly decision summary
- `src/lib/analysis/` - analysis types, live engine, fallback engine, and runner
- `src/lib/local-storage.ts` - save and load simulations and analysis data
- `src/context/simulation-context.tsx` - app state and restoration logic
- `server/dev-server.mjs` - local dev server and `/api/analyze` bridge
- `server/openai-analysis.mjs` - live model request and structured output contract

## Local setup

### 1) Install prerequisites

- Node.js 20 LTS or newer
- npm

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment variables

Create a `.env.local` file in the project root:

```bash
OPENAI_API_KEY=your_api_key_here
```

Optional:

```bash
OPENAI_MODEL=gpt-5.6-terra
PORT=5173
```

You can also copy `.env.example` as a starting point.

### 4) Start the app

```bash
npm run dev
```

That command starts the local Node dev server and the Vite app together.

### 5) Open the app

Open the URL shown in the terminal, usually:

```bash
http://localhost:5173
```

## How the live analysis path works

1. The browser sends the simulation to `/api/analyze`.
2. `server/openai-analysis.mjs` reads `OPENAI_API_KEY` from `.env.local`.
3. The server calls the OpenAI API with a structured JSON schema.
4. The response is normalized before it reaches the UI.
5. If the live call fails for any reason, the app uses the deterministic fallback engine instead.

This keeps the secret out of the browser bundle and preserves the demo flow if the network or model call fails.

## How to test each part

### 1) Basic app flow

1. Start the app with `npm run dev`
2. Create a new simulation
3. Fill in the plan details
4. Continue through the follow-up questions
5. Confirm the analysis screens load

### 2) Live analysis path

1. Add `OPENAI_API_KEY` to `.env.local`
2. Start the app with `npm run dev`
3. Submit a real plan
4. Confirm the analysis completes and the results appear in the app

### 3) Fallback path

1. Remove or invalidate `OPENAI_API_KEY`
2. Start the app with `npm run dev`
3. Submit a plan again
4. Confirm the workflow still completes through the deterministic fallback

### 4) Persistence

1. Run a simulation
2. Refresh the browser
3. Confirm the simulation and analysis restore from local storage
4. Navigate between pages and confirm state remains available

### 5) Production build

```bash
npm run build
```

### 6) Production preview

```bash
npm run preview
```

## Useful scripts

- `npm run dev` — start the local dev server
- `npm run build` — create a production build
- `npm run preview` — preview the production build

## Notes for the team

- Do not commit `.env.local` or any secret keys.
- Keep the live analysis contract stable so the UI and fallback stay aligned.
- If the live path is unavailable during a demo, the deterministic fallback preserves the experience.
- If you run into dependency issues, delete `node_modules` and run `npm install` again.

## Testing checklist

- New simulations can be created successfully
- Follow-up questions appear when context is missing
- The analysis page renders four distinct perspectives
- Failure chains and safeguards are visible
- Acceptance of safeguards changes readiness
- Browser refresh restores the latest simulation state
- The app still works when the live key is missing
- `npm run build` completes successfully

## License

MIT

---

## Project documentation

FailureTwin AI maintains implementation, architecture, QA, security, judging, and submission documentation alongside the application source.

| Document | Purpose |
|---|---|
| [Product Requirements](docs/PRODUCT_REQUIREMENTS.md) | Product scope, users, workflow and acceptance criteria |
| [Architecture](docs/ARCHITECTURE.md) | Application architecture, live AI path and fallback boundary |
| [AI Analysis Design](docs/AI_ANALYSIS_DESIGN.md) | AI reasoning requirements and normalized analysis contract |
| [Failure Chain Model](docs/FAILURE_CHAIN_MODEL.md) | Causal failure-chain design |
| [Scoring Model](docs/SCORING_MODEL.md) | Readiness and safeguard scoring behavior |
| [Test Plan](docs/TEST_PLAN.md) | Regression and submission QA |
| [Mentor Feedback](docs/MENTOR_FEEDBACK.md) | Mentor observations and resulting priorities |
| [Judging Alignment](docs/JUDGING_ALIGNMENT.md) | Product evidence mapped to judging criteria |
| [Demo Script](docs/DEMO_SCRIPT.md) | Final demo flow |
| [Submission Checklist](docs/SUBMISSION_CHECKLIST.md) | Release and submission gates |
| [Contributing](CONTRIBUTING.md) | Issue, branch, PR and review workflow |
| [Security](SECURITY.md) | Secret and sensitive-data handling |

## Team

| Member | GitHub | Focus |
|---|---|---|
| Rama Chandra | [@kaulastudies](https://github.com/kaulastudies) | Product and Technical Lead, Native.Builder, architecture, integration and release |
| Aigbe Godspower Voke | [@Gprexxy42](https://github.com/Gprexxy42) | Full-stack workflow, navigation/state QA and failure-chain UX |
| Raff Fahrezi | [@CeriwitSawit](https://github.com/CeriwitSawit) | Management Plan, data/evidence workflow, Supabase review and security/privacy |
| Amna Rauf | [@amna-rauf](https://github.com/amna-rauf) | QA, documentation, perspective differentiation and demo validation |
| Muhammad Salman | [@SalmanDeveloperz](https://github.com/SalmanDeveloperz) | Live AI integration, backend/API path, analysis logic, scoring and state persistence |

See [docs/TEAM.md](docs/TEAM.md) for the collaboration model and responsibility details.
