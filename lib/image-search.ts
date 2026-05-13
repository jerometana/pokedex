"use client";

import type { ImageFeatureExtractionPipeline } from "@huggingface/transformers";

const MODEL = "Xenova/clip-vit-base-patch32";
const DTYPE = "q8";

let modelPromise: Promise<ImageFeatureExtractionPipeline> | null = null;
type EmbeddingsBundle = { data: Float32Array; ids: Set<number>; dim: number };
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
        ids: number[];
        maxId: number;
      };
      const data = new Float32Array(buf);
      return { data, ids: new Set(meta.ids), dim: meta.dim };
    })();
  }
  return embedsPromise;
}

export type SearchStage = "model" | "embeddings" | "embed" | "rank";
export type ImageSearchResult = { id: number; score: number };

export async function searchByImage(
  file: Blob,
  onStage?: (stage: SearchStage) => void,
): Promise<ImageSearchResult[]> {
  onStage?.("model");
  const extractor = await loadModel();
  onStage?.("embeddings");
  const { data: indexData, ids: indexIds, dim } = await loadEmbeddings();
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
  const maxId = indexData.length / dim;
  const results: ImageSearchResult[] = [];
  for (let id = 1; id <= maxId; id++) {
    if (!indexIds.has(id)) continue;
    const off = (id - 1) * dim;
    let s = 0;
    for (let k = 0; k < dim; k++) s += q[k] * indexData[off + k];
    results.push({ id, score: s });
  }
  results.sort((a, b) => b.score - a.score);
  return results;
}

export function preloadImageSearch() {
  void loadModel();
  void loadEmbeddings();
}
