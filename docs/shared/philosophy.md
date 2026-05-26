# Philosophy: Why rag-axis Is Built This Way

**rag-axis is built on six core principles. These are not features. They are commitments.**

Understanding the philosophy helps you understand every design decision, every constraint, and why we refuse to do certain things.

---

## Principle 1: Explicit Over Hidden

**Make complexity visible, not invisible.**

### What It Means

When something is complex, rag-axis exposes that complexity through types, configurations, and audit trails. It does not hide complexity behind convenient defaults or auto-configured systems.

Complexity is not a problem to be solved. It is a reality to be understood.

### Why It Matters

Imagine buying a car. You could:

**Option A (Hidden):** The car has an "auto-drive" button. You press it, and it magically gets you where you need to go. You have no idea how. The engine does something. Tires rotate somehow. Fuel is consumed mysteriously.

Problem: If something goes wrong, you cannot diagnose it. You cannot predict fuel consumption. You cannot maintain it.

**Option B (Explicit):** You see the engine, understand fuel injection, know tire pressure, check the oil. The car is more complex to understand. But you control it and understand it.

RAG systems are complex. They have multiple retrieval strategies, embedding models, context budgets, truncation logic. Instead of hiding this in "magic defaults," rag-axis makes every knob visible.

### Real Example

You build a RAG system. Synthesis Layer generates an answer, but you want to know: "Where did each sentence come from? Which chunks were used? What was truncated?"

**With hidden complexity:**
```
Answer: "The revenue was $50M in 2026."
[No visibility into how this answer was assembled]
```

**With explicit complexity:**
```
Answer: "The revenue was $50M in 2026."

Audit Trail:
├─ Chunk 1 (from financial-report-q1): Used for sentence 1
├─ Chunk 3 (from earnings-call): Used for sentence 1
├─ Chunk 5 (from press-release): Dropped due to token budget
└─ Context assembled: 3,200 tokens of 4,000 available
```

Now you understand exactly what happened. You can debug, audit, and trust the answer.

### What This Means for You

- No magic config files that "just work"
- No automatic retries hiding failures
- No background processes doing mysterious things
- Instead: Every decision is visible, every parameter is explicit, every failure is logged

---

## Principle 2: Contracts Over Abstractions

**Define clear boundaries between layers. Composition is type-safe, not clever.**

### What It Means

Each layer (Index, Retrieval, Synthesis) has an explicit input contract and output contract. These contracts are types. Developers compose layers by matching types.

You cannot accidentally pass a RetrievalResult where an IndexedCorpus is expected. Type checkers catch it.

### Why It Matters

Imagine a restaurant kitchen with no clear workflow. Prep cooks might send half-prepped ingredients to the line cooks. Line cooks might send plated dishes back to prep. Everything is confusing.

Now add clear workflow:
- Prep → Prepped ingredients (mise en place: specific format, specific quality)
- Line Cook → Cooked dish (specific plate, specific temperature)
- Plating → Plated dish ready to serve (specific presentation)

Each stage knows exactly what it receives and exactly what it must produce.

rag-axis defines:
- **Index Layer output contract:** IndexedCorpus (frozen, versioned, with provenance)
- **Retrieval Layer input:** IndexedCorpus (matches exactly)
- **Retrieval Layer output:** RetrievalResult (ranked, confident, audited)
- **Synthesis Layer input:** RetrievalResult (matches exactly)
- **Synthesis Layer output:** PipelineResult (answer, citations, truncation audit)

If you try to use a different type, type checkers complain immediately.

### Real Example

You write code:
```python
indexed_corpus = prepare_index(docs)  # → IndexedCorpus
retrieval_result = execute_retrieval(query, indexed_corpus)  # ✓ IndexedCorpus matches
```

Type checkers verify: IndexedCorpus is what execute_retrieval expects. All good.

But if you mess up:
```python
retrieval_result = execute_retrieval(query, docs)  # ✗ docs is List[str], not IndexedCorpus
```

Type checker complains before runtime: "execute_retrieval expects IndexedCorpus, got List[str]."

This prevents entire classes of bugs.

### What This Means for You

- Contracts are stable across major versions (they don't change)
- You can depend on contracts without fear
- Composition is explicit and type-safe
- No guessing what the next layer expects

---

## Principle 3: Truthful Over Fluent

**Accurate answers with warnings beat confident-but-wrong answers.**

### What It Means

rag-axis optimizes for truthfulness, not fluency. If retrieval quality is poor, it says so. If context was truncated, it says so. If the LLM's confidence is unknown, it says so.

A wrong answer stated confidently is worse than an incomplete answer with caveats.

### Why It Matters

Imagine a doctor:

**Fluent Doctor:** "You have a common cold. Take two aspirin and rest. [90% confident, even though they didn't run full tests]"

Patient feels confident and acts on advice. Later, they discover it was actually the flu.

**Truthful Doctor:** "Your symptoms suggest cold or flu. I'd like to run a test to be sure. If it's cold: take aspirin. If it's flu: take antivirals. Until we know: rest and hydrate. [45% confident without tests]"

Patient is less confident in the moment. But they act correctly and get better care.

In RAG: A hallucinated answer stated with 95% confidence is worse than "I found 2 relevant chunks but they contradict. Here they are—you decide."

### Real Example

Retrieval returns chunks with scores: 0.88, 0.87, 0.86, 0.85, 0.84

**Fluent approach:** "These are great results! Confidence is high."

**Truthful approach:** Check score collapse. Scores are very close (max - min = 0.04). Signal is weak. Warn: "ScoreCollapseWarning: Results are too similar to each other. Consider broadening your search or increasing k."

The warning is uncomfortable. But it's honest. The user knows: "Don't trust these results too much. Maybe retry with different parameters."

### What This Means for You

- rag-axis will warn you when quality is degraded
- You will see limitations explicitly
- Confidence scores will sometimes be "unknown" instead of false certainty
- You make better decisions because you have complete information

---

## Principle 4: Observable by Default

**Instrumentation is native, not bolted on. Cost, audit trails, and spans are part of the design, not afterthoughts.**

### What It Means

You don't need to enable observability. It's on by default. Every execution:
- Emits OTel spans (for distributed tracing)
- Tracks cost (tokens, latency, estimated dollars)
- Logs audit trails (what happened, why, what was lost)

If you want to disable something, you opt out. But by default, you're observable.

### Why It Matters

Traditional software: Logging is added later. "Oh, we should log more. Let's add logs everywhere." Logs become bloated. You log things you don't need. You miss things you do need.

rag-axis: Observability is part of the contract. Cost is part of the result. Audit trails are part of the return type. Events flow to telemetry automatically.

Think of it like a medical record. Every doctor visit, the clinic updates:
- What was checked
- What was found
- What was recommended
- Cost

You don't ask the doctor to "add observability" after the fact. It's built in.

### Real Example

You execute a query:

```python
result = pipeline.execute(query)
```

Automatically (no extra code):
- OTel span emitted with retrieval latency, synthesis latency
- Cost report generated: 150 tokens (retrieval) + 320 tokens (synthesis) = 470 total
- Audit trail logged: score collapse detected, context truncated by 2 chunks
- All available immediately in result object

If you export OTel to Datadog, everything appears there automatically. No logging code needed.

### What This Means for You

- Production visibility out of the box
- No custom logging plumbing needed
- Cost awareness automatic (not "we'll measure later")
- Audit trails always available (not "logs disappeared")

---

## Principle 5: Immutability as Enforcement

**State cannot drift. Cross-layer data is frozen. Changes create new instances, never modify in place.**

### What It Means

Results from each layer (IndexedCorpus, RetrievalResult, PipelineResult) are frozen dataclasses. You cannot modify them. To change a field, you create a new instance.

This prevents silent bugs where one layer modifies something another layer depends on.

### Why It Matters

Imagine a supply chain:

**Mutable:** A box travels through stations. At station 2, someone secretly opens the box and removes items. Station 3 receives the box, assuming it has the original contents. Station 3 makes a wrong decision based on incomplete information.

**Immutable:** Each station receives a sealed box. If they want to change contents, they create a new sealed box. Station 3 receives the new box and knows exactly what's in it.

Immutability forces honesty. If something changes, it's explicit and traceable.

### Real Example

Retrieval Layer produces a RetrievalResult with cost_report showing 150 tokens.

Synthesis Layer receives it. Some code tries:

```python
result.cost_report.tokens_used = 200  # Try to mutate
```

**If mutable:** Modification succeeds. Now the cost report is wrong. The audit trail is corrupt. Impossible to debug.

**If immutable (frozen):** Error raised immediately. "Cannot assign to frozen dataclass." You're forced to do:

```python
new_result = dataclasses.replace(
    result,
    cost_report=dataclasses.replace(result.cost_report, tokens_used=200)
)
```

Now it's explicit: you're creating a new result, not modifying the original.

### What This Means for You

- Runs are reproducible (state doesn't drift)
- Debugging is easier (state is trackable)
- Bugs are caught early (mutations are forbidden)
- You can reason about code (no hidden side effects)

---

## Principle 6: No Auto-Configuration

**Every parameter is explicit. No magic defaults. You own every choice.**

### What It Means

There is no "run rag-axis and it magically works." Every parameter must be specified:
- Context token budget
- Top-k for retrieval
- Reranking threshold
- Generation temperature
- Truncation strategy

If you don't specify, you get an error. You must decide.

### Why It Matters

Think of cooking. A recipe that says "add spices to taste" is useless without guidelines. A recipe that says "add 1 tsp salt, 0.5 tsp pepper, 1 tbsp garlic powder" is reproducible.

rag-axis refuses to say "add spices to taste." Instead: "Specify your context budget: ___ tokens."

This prevents:
- Hidden tuning that varies between runs
- Deployments that work in dev but fail in prod (different defaults)
- Cargo-cult programming ("it works, but I don't know why")

### Real Example

You might write:

```python
# ✗ This fails
pipeline = RAGPipeline()  # No config—what's the context budget? What's k?

# ✓ This works
pipeline = RAGPipeline(
    retrieval_config=RetrievalConfig(k=10, score_collapse_threshold=0.05),
    synthesis_config=SynthesisConfig(context_token_budget=4000, truncation_strategy="end_first")
)
```

You must decide every parameter. This means:
- You understand your system
- You can explain why you chose k=10
- You can debug if it doesn't work (you chose the config)
- You can reproduce runs (same config, same results)

### What This Means for You

- You have full control
- You cannot accidentally rely on hidden defaults
- Your system is reproducible
- You can optimize for your use case (not for generic "good defaults")

---

## What rag-axis Refuses to Do

These are non-negotiable refusals:

### ❌ Hide Failures Behind Generic Exceptions

Every failure is named and specific. `EmptyRetrievalError`, not `Exception`. This lets you handle failures appropriately.

### ❌ Auto-Configure Anything

No magic. No "smart" parameter selection. Every knob is explicit.

### ❌ Promise Fluent Answers Over Truthful Outcomes

If something is uncertain, we say so. Better to be honest than confidently wrong.

### ❌ Abstract Complexity Away

Complexity is not hidden. It is explained and controlled.

### ❌ Depend on External Providers in Core

Core is decoupled. OpenAI, Anthropic, Pinecone stay in adapters, not core.

### ❌ Allow Silent Mutations of Cross-Stage Data

All boundaries are frozen. State changes are explicit.

### ❌ Log Side-Channel Data

Cost and audit trails are return types, not logs. No log parsing needed.

### ❌ Add Authentication, RBAC, or Data Governance

These are out of scope for v0.x and v1.0. rag-axis assumes it runs in a trusted environment. Multi-tenancy, role-based access control, and data governance are not planned for the current roadmap.

If you need to deploy rag-axis in a multi-tenant system, provide authentication at the service layer (using `ragaxis.server` with your own auth wrapper).

---

## Summary: The Philosophy in One Sentence

**rag-axis makes correct RAG systems easy to adopt by removing unnecessary friction while keeping necessary friction visible.**

It does not hide complexity—it explains it. It does not promise fluent answers—it promises truthful outcomes. It does not auto-configure—it gives you typed contracts you can trust for years.

---

## How Philosophy Guides Decision-Making

When building rag-axis, every decision is tested against these principles:

**New feature proposed: "Auto-tune embedding model for better retrieval"**

- ❌ Violates "No Auto-Configuration" (who decides the tuning parameters?)
- ❌ Violates "Explicit Over Hidden" (users won't know model changed)
- ❌ Violates "Contracts Over Abstractions" (embedder ID changes silently, breaking version locking)
- **Decision: Rejected.** Instead: provide tools to measure quality, let users decide.

**New feature proposed: "Cache recent queries to speed up retrieval"**

- ✓ Aligns with "Observable by Default" (cache hit/miss tracked in audit)
- ✓ Aligns with "Truthful Over Fluent" (cache behavior is explicit, not hidden)
- ✓ Aligns with "Immutability" (cache entries are frozen)
- **Decision: Approved.** Design it with explicit cache tracking.

Every decision follows the philosophy. This keeps the system coherent and principled.

---

## For Users: What This Philosophy Means

**If you use rag-axis expecting:**
- ❌ "Just add my documents and it works" → Try LDK or another framework
- ❌ "Magic parameter tuning" → This is not for you
- ❌ "Hide your failures from me" → Wrong framework

**If you use rag-axis expecting:**
- ✓ "Full control and visibility"
- ✓ "Reproducible, auditable runs"
- ✓ "Explicit complexity I can understand and debug"
- ✓ "Honest failure signals"
- ✓ "Cost tracking from day one"
- ✓ "Type-safe composition"

→ **Welcome to rag-axis.**

---

## Note: Legacy P-Label Naming

Earlier versions of this philosophy used P1–P6 labels to organize principles:

- P1: Zero Silent Failures
- P2: Explicit Contracts
- P3: Observable by Default
- P4: Contracts Are Versioned
- P5: Boundaries Absorb Provider Volatility
- P6: Immutability

These have been reorganized into the current 6 Principles. The mapping is:

| Legacy Label | Maps To |
| --- | --- |
| P1 (Zero Silent Failures) | Principle 1 (Explicit Over Hidden) + Principle 3 (Truthful Over Fluent) |
| P2 (Explicit Contracts) | Principle 2 (Contracts Over Abstractions) |
| P3 (Observable by Default) | Principle 4 (Observable by Default) |
| P4 (Contracts Are Versioned) | Principle 2 (Contracts Over Abstractions) |
| P5 (Boundaries Absorb Provider Volatility) | Principle 2 (Contracts Over Abstractions) + Principle 5 (Immutability as Enforcement) |
| P6 (Immutability) | Principle 5 (Immutability as Enforcement) |

Team discussions may reference P1–P6. Use this mapping for clarity.
