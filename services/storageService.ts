import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Uploads a file to Firebase Storage at the given path, reporting progress
 * (0-100) as it goes, and resolves with the file's public download URL.
 */
export function uploadFile(
  path: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snapshot) => {
        if (!onProgress) return;
        const percent =
          snapshot.totalBytes > 0
            ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            : 0;
        onProgress(percent);
      },
      (error) => reject(error),
      () => {
        getDownloadURL(task.snapshot.ref).then(resolve).catch(reject);
      },
    );
  });
}

/**
 * Deletes a file referenced by its Storage path or full download URL.
 * Silently ignores files that no longer exist.
 */
export async function deleteFileByRef(pathOrUrl: string): Promise<void> {
  if (!pathOrUrl) return;
  try {
    await deleteObject(ref(storage, pathOrUrl));
  } catch {
    // File may already be deleted, or the reference may be invalid — safe to ignore.
  }
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}
