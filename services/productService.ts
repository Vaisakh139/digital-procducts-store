import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { deleteFileByRef } from "@/services/storageService";
import type { Product, ProductCategory, ProductInput, ProductStatus } from "@/types/product";

const PRODUCTS_COLLECTION = "products";

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

const productConverter: FirestoreDataConverter<Product> = {
  toFirestore(product: Product): DocumentData {
    const { id: _id, ...rest } = product;
    void _id;
    return rest;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): Product {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      title: typeof data.title === "string" ? data.title : "",
      description: typeof data.description === "string" ? data.description : "",
      longDescription:
        typeof data.longDescription === "string" ? data.longDescription : "",
      category: (data.category as ProductCategory) ?? "Templates",
      price: typeof data.price === "number" ? data.price : 0,
      thumbnail: typeof data.thumbnail === "string" ? data.thumbnail : "",
      images: toStringArray(data.images),
      videoUrl: typeof data.videoUrl === "string" ? data.videoUrl : null,
      downloadFile:
        typeof data.downloadFile === "string" ? data.downloadFile : null,
      rating: typeof data.rating === "number" ? data.rating : 0,
      downloads: typeof data.downloads === "number" ? data.downloads : 0,
      isFeatured: Boolean(data.isFeatured),
      status: (data.status as ProductStatus) ?? "active",
      features: toStringArray(data.features),
      requirements: toStringArray(data.requirements),
      whatsIncluded: toStringArray(data.whatsIncluded),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};

const productsRef = collection(db, PRODUCTS_COLLECTION).withConverter(
  productConverter,
);

/**
 * Resolves an image reference to a usable URL. Firestore documents may store
 * either a fully-qualified download URL or a raw Firebase Storage path -
 * paths are resolved through the Storage SDK.
 */
async function resolveImageUrl(path: string): Promise<string> {
  if (!path) return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  try {
    return await getDownloadURL(ref(storage, path));
  } catch {
    return path;
  }
}

async function hydrateProductImages(product: Product): Promise<Product> {
  const [thumbnail, images] = await Promise.all([
    resolveImageUrl(product.thumbnail),
    Promise.all(product.images.map(resolveImageUrl)),
  ]);
  return { ...product, thumbnail, images };
}

async function hydrateAll(products: Product[]): Promise<Product[]> {
  return Promise.all(products.map(hydrateProductImages));
}

// ---------------------------------------------------------------------------
// Public storefront reads — published ("active") products only.
// ---------------------------------------------------------------------------

export async function fetchProducts(): Promise<Product[]> {
  const productsQuery = query(
    productsRef,
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(productsQuery);
  return hydrateAll(snapshot.docs.map((docSnapshot) => docSnapshot.data()));
}

export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError: (error: Error) => void,
): () => void {
  const productsQuery = query(
    productsRef,
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    productsQuery,
    (snapshot) => {
      hydrateAll(snapshot.docs.map((docSnapshot) => docSnapshot.data()))
        .then(onData)
        .catch((error: unknown) => {
          onError(error instanceof Error ? error : new Error(String(error)));
        });
    },
    (error) => onError(error),
  );
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const snapshot = await getDoc(doc(productsRef, id));
  if (!snapshot.exists()) return null;
  return hydrateProductImages(snapshot.data());
}

// ---------------------------------------------------------------------------
// Admin reads — every product regardless of status.
// ---------------------------------------------------------------------------

export function subscribeToAllProductsAdmin(
  onData: (products: Product[]) => void,
  onError: (error: Error) => void,
): () => void {
  const productsQuery = query(productsRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    productsQuery,
    (snapshot) => {
      hydrateAll(snapshot.docs.map((docSnapshot) => docSnapshot.data()))
        .then(onData)
        .catch((error: unknown) => {
          onError(error instanceof Error ? error : new Error(String(error)));
        });
    },
    (error) => onError(error),
  );
}

// ---------------------------------------------------------------------------
// Admin writes.
// ---------------------------------------------------------------------------

/** Generates a new product document ID without writing anything yet. */
export function generateProductId(): string {
  return doc(collection(db, PRODUCTS_COLLECTION)).id;
}

export async function createProduct(
  id: string,
  input: ProductInput,
): Promise<void> {
  await setDoc(doc(db, PRODUCTS_COLLECTION, id), {
    ...input,
    rating: 0,
    downloads: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<void> {
  await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(product: Product): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, product.id));

  await Promise.all([
    deleteFileByRef(product.thumbnail),
    ...product.images.map(deleteFileByRef),
    product.downloadFile ? deleteFileByRef(product.downloadFile) : null,
  ]);
}
