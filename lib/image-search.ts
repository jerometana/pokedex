"use client";

import type { ImageFeatureExtractionPipeline } from "@huggingface/transformers";

const MODEL = "Xenova/clip-vit-base-patch32";
const DTYPE = "q8";

type Entry = {
  refId: number;
  id: number;
  slug: string;
  label: string;
  isDefault: boolean;
};

type EmbeddingsBundle = {
  data: Float32Array;
  entries: Entry[];
  dim: number;
};

let modelPromise: Promise<ImageFeatureExtractionPipeline> | null = null;
let embedsPromise: Promise<EmbeddingsBundle> | null = null;

async function loadModel(): Promise<ImageFeatureExtractionPipeline> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const { pipeline } = await import("@huggingface/transformers");
      return pipeline("image-feature-extraction", MODEL, {
        dtype: DTYPE,
      });
    })();
  }
  return modelPromise;
}

async function loadEmbeddings(): Promise<EmbeddingsBundle> {
  if (!embedsPromise) {
    embedsPromise = (async () => {
      const [binRes, jsonRes] = await Promise.all([
        fetch("/sprite-embeddings.bin"),
        fetch("/sprite-embeddings.json"),
      ]);
      if (!binRes.ok || !jsonRes.ok)
        throw new Error("Embeddings not generated — run `npm run embed-sprites`.");
      const buf = await binRes.arrayBuffer();
      const meta = (await jsonRes.json()) as {
        dim: number;
        entries: Entry[];
      };
      const data = new Float32Array(buf);
      return { data, entries: meta.entries, dim: meta.dim };
    })();
  }
  return embedsPromise;
}

export type SearchStage = "model" | "embeddings" | "embed" | "rank";
export type ImageSearchResult = {
  id: number;
  score: number;
  formLabel: string | null;
};

export async function searchByImage(
  file: Blob,
  onStage?: (stage: SearchStage) => void,
): Promise<ImageSearchResult[]> {
  onStage?.("model");
  const extractor = await loadModel();
  onStage?.("embeddings");
  const { data: indexData, entries, dim } = await loadEmbeddings();
  onStage?.("embed");
  const { RawImage } = await import("@huggingface/transformers");
  const img = await RawImage.read(file);
  const out = await extractor(img);
  const q = out.data as Float32Array;
  let qn = 0;
  for (let i = 0; i < q.length; i++) qn += q[i] * q[i];
  const inv = 1 / (Math.sqrt(qn) || 1);
  for (let i = 0; i < q.length; i++) q[i] *= inv;
  onStage?.("rank");

  const bestByRef = new Map<number, { score: number; entry: Entry }>();
  for (let i = 0; i < entries.length; i++) {
    const off = i * dim;
    let s = 0;
    for (let k = 0; k < dim; k++) s += q[k] * indexData[off + k];
    const entry = entries[i];
    const prev = bestByRef.get(entry.refId);
    if (!prev || s > prev.score) bestByRef.set(entry.refId, { score: s, entry });
  }

  const results: ImageSearchResult[] = [];
  for (const { score, entry } of bestByRef.values()) {
    results.push({
      id: entry.refId,
      score,
      formLabel: entry.isDefault ? null : entry.label,
    });
  }
  results.sort((a, b) => b.score - a.score);
  return results;
}

export function preloadImageSearch() {
  void loadModel();
  void loadEmbeddings();
}
