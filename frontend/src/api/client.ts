export type ApiError = {
  message?: string;
};

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as ApiError;
    if (data?.message) return data.message;
  } catch {
    // ignore
  }
  return `${res.status} ${res.statusText}`.trim();
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  return (await res.json()) as T;
}

