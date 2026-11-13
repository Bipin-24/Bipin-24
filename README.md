# Hi, I'm Bipin Pandey 👋

### AI Knowledge Engineer · Ontologies & Knowledge Graphs · MCP Tool Interfaces · RAG

I make complex products usable by AI. Enterprise systems expose rich knowledge (docs, schemas, workflows, APIs) that was written for human readers, so agents guess, skip steps, and retrieve the wrong thing. I model that knowledge as governed ontologies and knowledge graphs, wrap it as typed tools agents can discover and call, and measure whether it actually works.

14 years across Actian, Adobe, ABB, and Aristocrat Technologies: from DITA/XML and taxonomy design to production RAG, retrieval evaluation, and Model Context Protocol (MCP) servers.

> Products now have two audiences: the people using them and the agents calling them. I build the semantic layer for both, and I measure the second.

<p>
  <a href="https://bipin-24.github.io/"><img alt="Portfolio" src="https://img.shields.io/badge/Portfolio-bipin--24.github.io-8b5cf6?style=for-the-badge"></a>
  <a href="https://www.linkedin.com/in/bipin-pandey24/"><img alt="LinkedIn" src="https://img.shields.io/badge/LinkedIn-bipin--pandey24-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white"></a>
  <a href="https://information-architecture-playbook.vercel.app/"><img alt="IA Playbook" src="https://img.shields.io/badge/IA_Playbook-Live-ec4899?style=for-the-badge"></a>
  <a href="mailto:pandey.bipin2@gmail.com"><img alt="Email" src="https://img.shields.io/badge/Email-pandey.bipin2-475569?style=for-the-badge&logo=gmail&logoColor=white"></a>
</p>

---

## ⭐ Start here: SimOnto

**[simonto](https://github.com/Bipin-24/simonto)** turns a simulation product's scripting surface into an ontology, validates it, and generates typed agent tools from it.

- **Ontology (OWL) + knowledge graph (RDF):** operations, parameters with units and bounds, data artifacts, and a transitive prerequisite relation
- **SHACL quality gate** plus graph checks for cycles, dangling inputs, and out-of-range defaults
- **SPARQL reasoning:** "what must run first?", "what breaks if I change this?", artifact lineage
- **Generated MCP tools** with strict JSON Schema and read-only / destructive / idempotent annotations, served by a dependency-free MCP server (stdio)
- **Agentic-readiness review:** a 100-point rubric that scores how safely an agent can call each operation
- **34 tests** including an end-to-end MCP subprocess test; CI fails if the ontology or generated docs drift

The demo product is fictional and the backend is simulated (stated plainly in the README). The pipeline is real.

---

## 🚀 Featured Work

| Project | What it demonstrates |
|---|---|
| **[simonto](https://github.com/Bipin-24/simonto)** | Ontology-driven agent tooling: OWL schema, SHACL gate, SPARQL planning, generated MCP tools, readiness scoring |
| **[knowledge-graphs-for-ia](https://github.com/Bipin-24/knowledge-graphs-for-ia)** | Documentation as a typed knowledge graph (REQUIRES / COVERS / BELONGS_TO) with graph-traversal retrieval. GraphRAG generation in progress |
| **[docs-mcp](https://github.com/Bipin-24/docs-mcp)** | MCP server in TypeScript. Five tool handlers exposing a documentation corpus, GA4 content gaps, and Jenkins CI status to Claude in one conversation |
| **[knowflow](https://github.com/Bipin-24/knowflow)** | Evolution of docs-mcp: adds a RAGAS-style evaluation loop (relevance, faithfulness, recall) so retrieval quality is measured, not assumed |
| **[Documentation-AI-Assistant](https://github.com/Bipin-24/Documentation-AI-Assistant)** | RAG pipeline and chat UI over a documentation corpus: embeddings, semantic search, grounded response generation |
| **[docs-style-guard](https://github.com/Bipin-24/docs-style-guard)** | Writing standards and schema checks that run on every change, callable over MCP, for human-written and AI-generated content |
| **[Knowlayer](https://bipin-24.github.io/knowlayer/)** | Live site and writing on making enterprise content AI-ready, including [chunking](https://bipin-24.github.io/knowlayer/docs/chunking/) and [knowledge graphs](https://bipin-24.github.io/knowlayer/docs/knowledge-graphs/) |
| **[information-architecture-playbook](https://information-architecture-playbook.vercel.app/)** | IA principles, governance checklists, maturity model, and content-modeling templates |

---

## 🏗️ What I Do

**Ontology & Knowledge Graphs** — Entity and relationship modeling, taxonomies, controlled vocabularies, metadata schemas, and typed graph models (REQUIRES / COVERS / BELONGS_TO) that make dependencies and coverage queryable. RDF, OWL, SHACL, and SPARQL in hands-on projects.

**Agent Tool Interfaces (MCP)** — MCP servers that expose a corpus, analytics, and CI status as typed, discoverable tools, with structured errors an agent can recover from.

**Retrieval & Context Layers** — RAG with heading-anchored chunking, metadata-scoped retrieval, hybrid search, and reranking. RAGAS-style evaluation gates every release on faithfulness, context recall, and relevance; evaluation is the part most RAG projects skip and the reason most cannot be trusted in production.

**Structured Content & Connectors** — Parsers and converters across DITA/XML, XSLT, FrameMaker, HTML, and Markdown with YAML frontmatter; validation gates that enforce schemas on 1,000+ migrated topics.

**Docs-as-Code & CI/CD** — Jenkins and GitHub Actions pipelines that treat documentation like software: version-controlled, validated, automatically deployed.

**Analytics-Driven IA** — GA4, BigQuery, and Adobe Analytics wired into IA decisions: measure what users cannot find, then restructure to fix it.

---

## 🧠 Skills & Tooling

**Ontology & Knowledge Graphs** — RDF · OWL · SHACL · SPARQL · SKOS · Protégé · NetworkX · Taxonomy & ontology design · Metadata schemas · Controlled vocabularies · Entity & relationship modeling

**AI & Retrieval** — RAG · Model Context Protocol (MCP) · Agentic retrieval · RAGAS evaluation · Vector embeddings · ChromaDB · pgvector · Hybrid search & reranking · Prompt engineering · LLM tool-calling

**Engineering** — Python · TypeScript · REST APIs · OpenAPI/Swagger · Postman · Docker · GCP · Jenkins · GitHub Actions · pytest

**Structured Content** — DITA/XML · DITA-OT · XSLT/XSL-FO · AEM Guides · FrameMaker · Markdown + YAML · Single-source publishing

**Analytics** — Google Analytics 4 · BigQuery · Adobe Analytics · Content performance dashboards

---

## 📊 Measurable Impact

| What I improved | Result |
|---|---|
| Content discoverability | **+45%** |
| Organic search traffic | **+50%** |
| Duplicate / redundant content | **−35%** |
| API self-service success rate | **+40%** |
| Engineering onboarding time | **−70%** |
| Documentation build & publish time | **−40%** |
| Authoring efficiency (taxonomy + XML schemas) | **+30%** |
| Adobe HelpX users supported | **1M+ / quarter** |

---

## 💼 Experience

| Role | Company | Period |
|---|---|---|
| Principal Information Architect, AI Knowledge Systems & Retrieval | **Actian** | Apr 2024 – Present |
| Information Architect | **Adobe** | Sep 2021 – Apr 2024 |
| Senior Technical Writer / Information Architect | **ABB** | Aug 2018 – Sep 2021 |
| Senior Technical Writer / DITA Information Architect | **Aristocrat Technologies** | Jun 2012 – Jul 2018 |

🎓 **B.Tech, Aeronautical Engineering** — R. V. College of Engineering, Bangalore

📜 *Prompt Engineering: How to Talk to the AIs (2025)* · *UX Foundations: Information Architecture* · *Jenkins Essential Training*

---

## 🌐 Connect

[Portfolio](https://bipin-24.github.io/) · [LinkedIn](https://www.linkedin.com/in/bipin-pandey24/) · [IA Playbook](https://information-architecture-playbook.vercel.app/) · pandey.bipin2@gmail.com
