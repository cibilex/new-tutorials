# RAG & Document Search Notes

Running log of RAG (Retrieval-Augmented Generation) and document search concepts, built topic-by-topic through discussion. Each section: what we discussed, where my understanding was off, and what we settled on.

---

## Topics to Learn Properly

Touched briefly, not yet studied in depth:

1. **Vector databases** — only overview so far (see section 6); need: ANN indexes in practice (HNSW), filtering, hybrid search, real usage.

---

## Topics Covered

### 1. Keyword Search Fundamentals: Normalization, Tokenization, Stopwords, TF-IDF

We can build a search pipeline from scratch with the following steps — this is basically what Lucene/Elasticsearch do under the hood before any fancy ranking model kicks in.

1. **Normalization** — lowercase + trim before comparing text, so `"King"`, `"king"`, `"  king"` all get treated as the same thing.
2. **Tokenization** — instead of matching whole strings, we split text into tokens. `"The lord of the rings"` becomes `["the", "lord", "of", "the", "rings"]`.
3. **Stopword removal** — low-value high-frequency words like `the`, `a`, `of` get dropped from the token list so they don't pollute scoring. We're left with `["lord", "rings"]`.
4. **Stemming** — a step we hadn't originally mentioned, but it belongs in the same preprocessing stage. It's a different job from stopwords: stopwords *remove* words entirely, stemming *merges* variants of a word we're keeping into one root form. So `running`/`runs`/`ran` all collapse down to `run`.

Once preprocessing is done, we get to **TF-IDF**, which combines two signals per term per document. It clicks best with actual numbers, so let's use a tiny example: 4 movie one-liners, after stopword removal —

- D1: `lion, king, rules, jungle` (4 tokens)
- D2: `king, pop, sings` (3 tokens)
- D3: `queen, rules, kingdom` (3 tokens)
- D4: `movie, dog` (2 tokens)

Someone searches for **"king"**. It shows up once in D1 and once in D2, nowhere else.

- **TF (Term Frequency)** — count of the term in a doc, scaled by how long that doc is, so a long doc can't win purely by being long. For D1: `king` appears 1 time out of 4 tokens → TF = 1/4 = 0.25. For D2: 1 time out of 3 tokens → TF = 1/3 = 0.33. D2 already scores higher on TF alone — both docs mention "king" once, but D2 is shorter, so that one mention carries more relative weight.
- **IDF (Inverse Document Frequency)** — a different question: across all 4 docs, how special is the word "king"? It shows up in 2 of 4 docs (`df=2`, `N=4`), so `IDF = log(N/df) = log(4/2) ≈ 0.69`. Compare to "kingdom," which shows up in only 1 doc (`df=1`) → `IDF = log(4/1) ≈ 1.39`. Bigger IDF = rarer word = more useful as a distinguishing signal. A word in every doc (`df=N`) collapses toward IDF ≈ 0 — it's everywhere, so it tells us nothing about which doc is relevant (exactly the case for something like "the"). In practice the naive `log(N/df)` breaks when `df=N` gives exactly 0, or during incremental indexing where division-by-zero can occur, so real implementations smooth it — scikit-learn's TfidfVectorizer uses `log((1+N)/(1+df)) + 1`.
- **TF-IDF weight** — multiply the two together per word per doc: `weight(king, D2) = 0.33 × 0.69 ≈ 0.23`, `weight(king, D1) = 0.25 × 0.69 ≈ 0.17`. So for "king" alone, D2 outranks D1. Every doc ends up with one such weight per word in the vocabulary — that whole row of numbers *is* the vector for that document.

Real queries usually have more than one word, so let's extend the example: someone searches **"king rules"**. For each doc we just add up its weight for every query word (0 if the word isn't in that doc): D1 = 0.17 (king) + 0.17 (rules) = 0.34, D2 = 0.23 (king) + 0 = 0.23, D3 = 0 + 0.23 (rules) = 0.23, D4 = 0. D1 wins because it's the only doc getting credit from *both* query words.

**TF-IDF is a ranking mechanism, not a search algorithm** — it doesn't decide *which* documents match, it decides *how relevant* the already-matched documents are, so we can sort them. It's the ranking mechanism we plug into lexical/keyword search.

TF-IDF isn't what modern search engines actually rank with anymore, though — **BM25** is, and it's the default in Elasticsearch/Lucene today. Two concrete problems it fixes:

1. **Term-frequency saturation** — in TF-IDF, a term appearing 20 times in a doc keeps adding roughly proportional weight forever, but realistically the 20th occurrence of "king" shouldn't matter much more than the 5th. BM25 caps this out with a saturation curve, so extra repeats give rapidly diminishing returns.
2. **Document length normalization** — TF-IDF's handling of document length is a rough by-product of the TF calculation, while BM25 normalizes for document length explicitly and tunably, comparing each doc's length against the average length across the whole corpus, so long and short docs get compared more fairly.

Both are still lexical/token-matching — BM25 is just a better-tuned scoring formula on top of the same idea.

### 2. BM25 Search Flow

BM25 = TF-IDF's idea with a better-tuned formula: TF saturation via `k1` (repeats give diminishing returns, score capped at `k1+1`) and explicit doc-length normalization via `b` (longer than average → penalty, shorter → boost). Standard values: `k1 = 1.5`, `b = 0.75`.

1. Tokenize the query (same pipeline as indexing: normalize → stopwords → stem).
2. Collect candidate docs from the inverted index (docs containing ≥ 1 query token) — matching step; the rest of the corpus is never scored.
3. Per candidate: `score = Σ over query tokens of (bm25_idf × bm25_tf)`.
4. Sort by score descending, return top N.

### 3. Lexical Search vs. Semantic Search

**Keyword search** = **lexical search** — matching on the literal tokens, no notion of meaning. The opposite approach is **semantic search**: it finds results where words have *similar meanings* instead of similar spelling, matching by embedding similarity rather than shared tokens.

**When to use semantic search:**
- **Synonyms** — "scary movies" matches descriptions saying "terrifying", "horror", "sinister" even though the token "scary" never appears. 
- **Natural language queries** — instead of typing "The Lord of the Rings", describe it: "a movie set in Middle-earth where a fellowship forms around a ring." No shared tokens with the title needed; meaning carries the match.

**When to use lexical search:**
- **Exact/known terms** — titles, names, product codes, error messages, quotes, technical jargon, rare words. Matching runs on spelling (plus stemming), with zero contextual interpretation — which is exactly what you want here: synonym drift would only hurt.
- **Cheap and fast** — no embedding model, just an inverted index.

### 4. Vectors & Embeddings

**Core definitions**

- **Vector** — a list of numbers representing data (text, image, PDF); geometrically, a point in N-dimensional space. More dimensions = richer representation. Intuition: describe foods by color + taste (2D), add size + weight (4D) — each added axis captures more nuance.
- **Embedding** — the process of converting data into vectors using a model (also the name of the resulting vector itself). Real embedding dimensions are *learned* by the model, not human-labeled axes like the food example — dim 417 doesn't mean anything nameable.
- **Embedding is one-way.** A vector can't be converted back to its text — pooling/averaging destroys the words, keeping only a summary of meaning (smoothie: strawberry in, no way back). Consequence: always store the original data alongside the vectors, linked by position/id — vectors *find* the match, originals *display* it.
- **Key property: similar meaning → nearby points.** "Scary" and "terrifying" land close; "scary" and "banana" far. Distance ≈ meaning difference — this is what makes semantic search work.

**Why vectors, not categories/rules/text?**

Meaning is graded, categories are buckets: "is this movie scary?" isn't yes/no, it's *how much* — a vector lets a movie be 0.7 horror-ish, 0.2 comedy-ish, and similarity between two things becomes a sortable number (0.93 vs 0.31). Binary/category comparison only gives equal/not-equal or tag overlap — too coarse. Search is a ranking problem; ranking needs numbers. Hand-built rules and taxonomies were tried for decades (expert systems, WordNet) and lose: someone must enumerate every synonym and relation, and the rulebook is never complete. Embeddings flip it — nobody writes the rules; the model *learns* them from billions of text examples, compressing the messy web of meaning humans couldn't enumerate into geometry automatically.

**Where embedding models sit (AI/ML/DL)**

AI ⊃ machine learning ⊃ deep learning. ML = programs that learn patterns from data instead of being explicitly programmed. Deep learning = ML using neural networks (loosely brain-inspired layers of simple units): each layer transforms its input and passes the result on, learning increasingly abstract features — early layers detect low-level patterns, later layers meaning. Layers learn their jobs during training; they aren't assigned domains. Embedding models are deep learning models.

**Dimension rules**

All vectors from one embedding model share the same dimension (e.g. every text → 768 numbers), regardless of input length — required for comparability: distance math pairs coordinates one-by-one, so a 4-dim vs 7-dim distance is undefined. Same dimension isn't enough, though — each model has its own learned logic and structure, so the same word gets different numbers per model: "family" might embed with first dimension 0.25 in model A but 0.2 in model B — comparing across them is garbage. Rule: embed data and queries with the *same model*; switch models → re-embed everything.

**Max sequence length**

Input cap, in tokens (256 for our model, ~190–200 English words). Longer input → silently cut off, rest never read; the vector represents only what survived. Two gotchas: (1) "token" here ≠ keyword-search token — embedding models use a *subword* tokenizer (common words = 1 token, rare ones split: `unbelievable` → `un ##believ ##able`), with no stopword removal or stemming — the model wants full raw text, function words carry meaning ("not scary"!). No custom text preprocessing needed at all: the model's tokenizer handles raw text internally (casing, punctuation, splitting) — the lexical-search cleanup pipeline would actually *hurt* here. (Don't confuse this with *vector* normalization — scaling the output vector to length 1 — which models also do, on the output side.) (2) Silent truncation: a 500-word description → embedding "sees" only the first ~200 words; the ending is invisible to search. Standard fix = chunking (split long docs, embed each piece).

**Choosing a model**

Example: `sentence-transformers/all-MiniLM-L6-v2` — creates vectors from text, 384 dimensions, max sequence length 256 tokens (so input text should stay under that). It's a *general-purpose* model: trained on text from everywhere, good all-round default. Alternatives exist for specific needs — a domain-specific model when vocabulary is specialized (e.g. a medical model for hospital data, where "MI" must mean myocardial infarction, not Michigan), or a different-modality model when data isn't text (e.g. an image model). Language matters too: some models are single-language (many, like the example above, are English-only), others are multilingual (e.g. supporting Chinese) — good multilingual models put all languages in one shared space, so a query in one language can match documents in another. Pick by domain, modality, and the size/speed/quality tradeoff. To stay up to date and compare models, use the [MTEB leaderboard](https://huggingface.co/spaces/mteb/leaderboard) — ranks embedding models on standardized benchmarks (retrieval, classification, etc.), filterable by size and language.

**Local vs API embedding**

Two ways to run an embedding model:

1. **Local** — install the model and run the embedding process on our own server/computer. Weights are downloaded once and cached; every embedding is computed locally — text never leaves the machine, no per-use cost, fast for small models.
2. **API** — text is sent over HTTPS to a provider's servers, the vector comes back. Access to bigger/better models, but per-token cost, network latency, and a third party sees your data.

### 5. Vector Similarity: Dot Product & Cosine Similarity

**Dot product** — multiply the two vectors dimension-by-dimension, sum the results → one number. Same direction → big positive; perpendicular (unrelated) → ~0; opposite → negative. Catch: it measures direction *and* magnitude together — a vector twice as long produces a dot product twice as big without meaning more.

**Magnitude** — the vector's size: its length as an arrow from the origin (`√(sum of squared components)`). Bigger magnitude = longer vector.

**Cosine similarity** — direction only, magnitude removed:

```
cosine_similarity = dot_product(A, B) / (magnitude(A) × magnitude(B))
```

Two steps:
1. the dot product measures how much the vectors align; 
2. dividing by the magnitudes removes length bias. Result is the cosine of the angle between them, range -1 (opposite) … 0 (unrelated) … +1 (same direction). This is the standard similarity metric for semantic search.

**Shortcut:** many embedding models normalize their output vectors to length 1. Then the denominator is 1 × 1, and dot product = cosine similarity exactly — the cheap operation becomes the correct metric. That's why models normalize.

**Analogy to lexical search:** cosine similarity enhances the dot product the same way BM25 enhances and fixes problems with TF-IDF.

### 6. Semantic Search Flow

1. **Embed documents** (done once) — convert documents to vectors.
2. **Store documents** (done once) — store embedded documents in a vector store.
3. **Embed query** (per search) — convert the user query to a vector.
4. **Calculate similarities** — compare the query vector to all document vectors (cosine similarity).
5. **Rank and return** — sort by similarity and return the top results.

The core of steps 3–5 in code:

```python

def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)

    if norm1 == 0 or norm2 == 0:
        return 0.0

    return dot_product / (norm1 * norm2)

query_embedding = self.generate_embedding(query)          # embed the query (same model as docs!)
scored = [
    (cosine_similarity(query_embedding, doc_embedding), doc)
    for doc_embedding, doc in zip(self.embeddings, self.documents)
]
scored.sort(key=lambda item: item[0], reverse=True)       # highest similarity first
```

`zip` walks the vector matrix and the original documents side by side (position = the link between them), scores every document against the query, and glues each score to its document *before* sorting — so the score/document pairing can't break when the sort shuffles order. Then take the top N.

**Vector storage & databases (quick overview).** A vector is just an array of floats, so any database can *store* one (e.g. an `embedding` field in a MongoDB document, a column in SQL) — storing vector + original text in the same record also solves the position-link fragility. *Searching* efficiently is the real feature: it needs an ANN index. Three options:       
(1) **dedicated vector databases** (Pinecone, Qdrant, Weaviate, Milvus) — these are databases built around ANN search;    
(2) **existing databases with vector features added** — MongoDB Atlas (`$vectorSearch`), Postgres + pgvector, Elasticsearch, Redis — keep your stack, add an index (note: self-hosted community MongoDB can store vectors but has no vector index — search means brute force in app code);     
(3) **DIY file** (like a `.npy` matrix) — fine for small datasets. Common default: option 2, data and vectors in one place; dedicated DBs win at serious scale.

### 7. Chunking

Instead of embedding a whole document into a single vector, split it into pieces and embed each piece — precise, concise vectors instead of generic ones.

**Why chunk:**
1. **Precision** — one vector for a long multi-topic text is an average of everything (start, action, and ending of a story all mushed together) and matches nothing sharply. Chunks isolate each part.
2. **Token limit** — embedding models silently truncate input past their max sequence length (no error — the extra content just never gets embedded and is unsearchable). LLMs typically do throw errors on overflow. Chunking keeps every piece under the limit.
3. **Better retrieval** — return the matching *piece*, not the whole document. For RAG this is the point: the chunk is the unit pasted into the LLM prompt.

**How to chunk:**
- **Fixed-size** — every N words. Simplest, but cuts blind: `"my father is" | "the best in town"` — neither piece carries the thought.
- **Overlap** — each chunk repeats the last few units of the previous one (step = chunk size − overlap), so boundary sentences get a whole home in at least one chunk; no hard breaks between related context. Costs extra vectors. Rule of thumb: overlap ≈ 10–20% of chunk size — more just multiplies near-duplicate vectors.
- **Sentence/boundary chunking** — split at natural structure (sentence ends via `.!?`, paragraphs, headings). Respects meaning units. (Often marketed as "semantic chunking"; strictly, semantic chunking = cut where embedding similarity between consecutive sentences drops.)

**Hard-won details:**
- **Chunks must carry their identity** — a chunk like "They contain quercetin..." embeds with no clue what "they" is. Prefix each chunk with its title/context before embedding.
- **Chunk size is a sharp tunable** — too big → dilution (relevant sentence drowned by neighbors); too small → precise but context-less. Changing size reshuffles results.
- **Aggregation** — doc score from its chunks: *max* (best single chunk; standard, but one lucky chunk can surface a bad doc) or *top-k mean* (rewards sustained relevance, damps flukes).
- **Chunking isn't always better** — for short single-topic texts, whole-doc averaging *concentrates* the theme (noise cancels); chunking shines on long, heterogeneous content and detail queries, whole-doc on gist queries.

### 8. Dense Embeddings vs. ColBERT

Embedding models are usually Transformer *encoders* — BERT (**B**idirectional **E**ncoder **R**epresentations from **T**ransformers) and newer families like E5, BGE, Jina. A traditional dense model: tokenize → contextualized token embeddings via the Transformer → **pool** into one vector (mean pooling or the `[CLS]` token). Like a smoothie: all ingredients blended into one representation — so that single vector must represent *every* concept in the text. A prescription covering headaches, dosage, and side effects scores lower than expected for "medicine for headache," because the vector also carries all the unrelated concepts (dilution).

**ColBERT** (Contextualized **l**ate interaction over BERT) skips pooling: it stores a contextual embedding for **every document token** (precomputed offline). At query time, query tokens embed individually and each one matches against its most relevant document token; the per-token maxima are summed (**late interaction / MaxSim**). Fine-grained matching — "headache" hits the headache tokens without dilution from the rest.

**Trade-offs:** far more storage (many vectors per doc instead of one; ColBERTv2 compresses to cope) and slower retrieval than dense — but still much faster than cross-encoders, with higher accuracy than dense. Sits between the two. Chunking is the poor man's ColBERT: sentence-level granularity instead of token-level, at a fraction of the cost.

### 9. Hybrid Search

No single engine wins everywhere: keyword (BM25) wins on exact/known terms, semantic wins on synonyms and natural language, chunked wins on buried details. Hybrid search runs multiple engines on the same query and **fuses** their results. Two fusion strategies:

**1. Weighted (score fusion).** Problem: engine scores live on different scales — BM25 is unbounded, cosine lives in -1..1. Example: for the same query, BM25 might return `14, 20, 15.5, 85.2` while semantic returns `0.12, -0.12, 0.65`. Added raw, BM25 drowns semantic completely (85.2 + 0.65 ≈ 85.2 — the semantic opinion vanishes). Fix: **min-max normalization** squeezes each engine's score list into [0, 1]:

```
normalized = (score - min_score) / (max_score - min_score)
```

Applied per engine: BM25's `85.2` (its max) → 1.0 and `14` (its min) → 0.0; semantic's `0.65` → 1.0 and `-0.12` → 0.0. Now both engines speak the same 0-to-1 language and can be blended fairly.

(edge cases: empty list → nothing; all scores equal → all 1.0). Then blend per document with a tunable weight:

```
hybrid_score = alpha × bm25_score + (1 - alpha) × semantic_score
```

`alpha` = the dial: 1.0 → pure keyword, 0.0 → pure semantic, 0.5 → equal. A document missing from one engine's results gets 0 for that side. Weakness: min-max is batch-relative (worst fetched result = 0.0 even if decent) and one outlier stretches everyone else down.

**2. RRF — Reciprocal Rank Fusion (rank fusion).** Ignores scores entirely; uses each document's *position* per engine:

```
rrf_score = Σ over engines of  1 / (k + rank)
```

`k` (standard: 60) is a damping constant — with it, rank 1 (1/61) and rank 2 (1/62) are nearly equal, so no cliff at the top; consensus across the list decides. Engines are equal voters: BM25 rank 1 = semantic rank 1, no weights (a weighted-RRF variant exists but vanilla is deliberately tuning-free — the default in Elasticsearch/OpenSearch hybrid modes). Scores come out tiny (max ≈ 2/(k+1)); only the *order* means anything. Appearing in both lists at mediocre ranks often beats appearing in one list at a great rank — consensus is structurally rewarded.

**Weighted vs RRF:** weighted = "I know which engine to trust" (nuanced, needs tuning + normalization); RRF = "positions never lie" (robust, zero tuning, less nuanced). Both fetch a wide net from each engine (e.g. 500× the final limit) so the lists overlap and, for weighted, the normalization has a real distribution to work with.

### 10. LLMs & Query Enhancement

An **LLM** is a transformer neural network trained on vast text corpora via next-token prediction; scale makes it general-purpose — one model handles any language task through prompting alone (vs. old one-model-per-task NLP). Chat models add post-training (instruction tuning, RLHF) on top of the base predictor. In a search/RAG pipeline the LLM is useful at **both ends**: before retrieval to **enhance the query**, after retrieval to **re-rank results** (and, in full RAG, to generate the final answer from retrieved context).

**Query enhancement** — users type messy queries; engines want clean ones. Nothing forces you to search the user's raw text. Send the query to an LLM first with one of these transforms:

- **Spell correction** — fix only high-confidence typos, change nothing else, output the query text alone. Prompt must include the escape hatch "if unsure, return unchanged" — LLM eagerness is the failure mode.
- **Rewriting** — vague description → specific searchable terms, exploiting the LLM's world knowledge ("that bear movie where leo gets attacked" → "The Revenant Leonardo DiCaprio bear attack"). Google-style, short, no boolean logic.
- **Expansion** — append synonyms/related concepts to widen recall ("grizzly" alone misses other bears; "funny" → "comedy humorous amusing"). LLM returns only the extra terms; code appends them to the original so the user's words always survive. Expansion doesn't need an LLM — a genre/synonym table in your DB is expansion too (and that lookup is itself RAG).
- **Mix** — methods chain: spell-fix first, then rewrite or expand the corrected query. One `--enhance` dispatch point (dict of method → function) makes adding/combining methods trivial. Alternative to chaining (N calls): one combined prompt does all steps in a single LLM call —

  ```
  Improve the movie search query below in three steps:
  1. Fix obvious typos.
  2. Rewrite it as a specific, Google-style search query (under 10 words, no boolean logic).
  3. Append a few synonyms or related terms that might appear in movie descriptions.
  If unsure about a step, skip it. Output only the final query text, nothing else.
  User query: "{query}"
  ```

Implementation notes: OpenAI SDK works for any OpenAI-compatible API (DeepSeek, OpenRouter) — just change `base_url` + key; keys live in `.env` (gitignored), loaded with `python-dotenv`; always show the user `'original' -> 'enhanced'` so the transform is transparent; each method = a prompt with instructions + the query injected at the end, and `response.usage` reports prompt/completion token spend.

### 11. LLM Re-ranking

Second place the LLM helps: **after** retrieval. Two-stage pattern — retrieval is fast but coarse (ranks by token/vector similarity, doesn't read anything); the LLM is slow but actually reads. So: fetch a **wider candidate set** than needed (e.g. 5× the final limit) with cheap retrieval, let the LLM reorder it, truncate to limit. Never run the LLM over the whole corpus — re-ranking only pays because the candidate set is small. This is the same slot a cross-encoder fills; an LLM prompt is just the lazy/general version of one.

**Individual scoring** — one LLM call per candidate: "rate 0–10 how well this movie matches the query, output only the number", then sort by score descending. Granular and simple, but N calls = slow + rate-limit pain (sleep between calls on free tiers), and each doc is judged in isolation — the model never *compares* candidates.

**Batch ranking** — one LLM call with all candidates listed as `id: title - description`: "return the movie IDs as a raw JSON array, best match first", `json.loads` the reply, sort by position. One call instead of N (faster, cheaper, no rate-limit dance) and the model ranks candidates *relative to each other*. Costs: candidate set must fit the context window (truncate long descriptions), and output is structured — malformed JSON / markdown-wrapped replies happen, so parse-with-retry; IDs the model drops go to the back of the list.

**LLM output is untrusted input** — both methods parse model text (`float()`, `json.loads`); always retry-on-garbage with a sane fallback instead of crashing. Full pipeline now: `query → enhance (LLM) → retrieve wide (BM25 + semantic → RRF) → re-rank (LLM) → truncate → results`.

### 12. Evaluation: Precision, Recall, F1

Vibes aren't a metric. A **golden dataset** — real queries + human-curated correct docs per query — is the fixture: run any search config against it, get a number, compare across experiments. Never expect 100%: that means either an eval bug or a dataset that doesn't represent real usage.

**Precision** asks: "How much of what you found is relevant?"
**Recall** asks: "How much of what's relevant did you find?"

```
precision = relevant_retrieved / total_retrieved
recall = relevant_retrieved / total_relevant
```

Precision@k / recall@k = both measured against the top-k results only. They trade off: widen the net (bigger k, query expansion) → recall up, precision down (more junk let in); narrow it → precision up, recall down (real matches missed). Which matters more is a product call — a re-ranker can't fix a doc retrieval never surfaced, so early pipeline stages should lean recall; user-facing top results should lean precision.

**F1** — harmonic mean of the two, one number balancing both equally:

```
f1 = 2 * (precision * recall) / (precision + recall)
```

### 13. How to Test the System

Zero to hero, three levels of rigor:

**0. Vibe check** — run a few queries by hand, eyeball the results. Fast, catches nothing systematically, no number to track over time. Fine for a first sanity pass, never the final word.

**1. Golden dataset + eval script/pipeline** — curated queries + known-correct docs (section 12), one script (`evaluation_cli.py`) that runs every test case through the current pipeline and prints precision/recall/F1@k. This is what makes search work *testable*: change a knob (chunk size, alpha, rerank method), rerun the same script, compare numbers instead of vibes. Ground truth is exact and trustworthy (a human decided it), but it's expensive to build/maintain and only covers the queries someone thought to curate — it doesn't scale to "every query a real user might type."

**2. LLM-as-judge** — where curation doesn't scale, have an LLM grade relevance instead of a human. Send the query + candidate results, ask for a graded score per result rather than a binary yes/no:

```
prompt = f"""Rate how relevant each result is to this query:

Query: "{query}"
Results: {format_results(results)}

Rate each 0-3 where:
- 3: Highly relevant
- 2: Relevant
- 1: Marginally relevant
- 0: Not relevant"""
```

Graded 0–3 scores (vs. golden dataset's binary relevant/not) support finer-grained metrics like nDCG, and cost nothing to extend to new queries — no human has to sit down and curate them. Trade-off: it's an LLM's opinion standing in for a human's, so it inherits LLM bias/inconsistency and needs periodic spot-checking against real human judgment (or the golden dataset itself) to make sure the judge is still trustworthy. In practice: golden dataset for the core regression suite (small, trusted, run every change), LLM-as-judge to cover breadth (many more queries, cheaper per query, looser trust).

### 14. RAG — The Big Picture

**RAG (Retrieval-Augmented Generation) is not a framework, AI model, or DBMS.** It's an architectural pattern/pipeline combining information retrieval with a generative model. It extends an LLM's knowledge by feeding it custom, private, or up-to-date data at inference time — the model never had this data during training, so retrieval is what makes the answer accurate and context-aware instead of a hallucinated guess.

```
1. User enters a query
          |
          v
2. Query is converted into an embedding
          |
          v
3. Retrieval system searches for relevant information
   (vector DB / hybrid search / BM25 / etc.)
          |
          v
4. Relevant documents or chunks are retrieved
          |
          v
5. LLM receives:
      - User query
      - Retrieved context
          |
          v
6. LLM generates an answer using the provided context
          |
          v
7. Response is returned to the user
```

Every LLM-facing command in `augmented_generation_cli.py` (`rag`, `summarize`, `citations`, `question`) is this same 7-step loop — steps 1–4 are identical (RRF search), only step 5's instructions change (comprehensive answer vs. synthesis vs. cited sources vs. casual tone).

**Where RAG fits:** customer support bots answering from a company's actual docs/policies (not the model's stale training data), internal knowledge-base Q&A over private docs the model never saw, coding assistants grounded in a specific repo, chat over recent/frequently-changing data (news, prices, inventory) an LLM can't know from pretraining, and any case needing citations/traceability back to a real source instead of an opaque model claim.

A general-purpose RAG answering prompt, built to handle more than one question shape in a single call instead of branching code per type:

```
prompt = f"""Answer the following question based on the provided documents.

Question: {query}

Documents:
{context}

General instructions:
- Answer directly and concisely
- Use only information from the documents
- If the answer isn't in the documents, say "I don't have enough information"
- Cite sources when possible

Guidance on types of questions:
- Factual questions: Provide a direct answer
- Analytical questions: Compare and contrast information from the documents
- Opinion-based questions: Acknowledge subjectivity and provide a balanced view

Answer:"""
```

The "guidance by question type" block is the reusable trick here — instead of classifying the question first and picking a different prompt, one prompt tells the model how to shape its answer once it figures out which kind of question it's looking at.

Harmonic mean punishes imbalance harder than a plain average: 100%/0% → regular mean 50%, F1 0% (a system perfect on one axis and dead on the other doesn't deserve credit). Only use plain F1 when precision and recall matter equally; otherwise weighted F-scores or just optimize the metric that matters.
