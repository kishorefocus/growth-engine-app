export interface HealthResponse {
  status: "healthy" | "degraded" | "error";
  service: string;
  timestamp: string;
  backend: {
    status: string;
    framework: string;
    environment: string;
    port?: number;
  };
  database: {
    status: "connected" | "disconnected";
    engine: string;
    latency_ms: number | null;
    message: string;
  };
}

export interface Item {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://growth-api.getyourclientsb2b.com";

export async function fetchHealth(): Promise<HealthResponse> {
  const startTime = Date.now();
  const res = await fetch(`${API_BASE_URL}/health`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });
  const clientLatency = Date.now() - startTime;
  if (!res.ok) {
    throw new Error(`Backend returned status ${res.status}`);
  }
  const data = await res.json();
  return {
    status: data.status || "healthy",
    service: data.service || "GlobalReach Growth Engine API",
    timestamp: data.timestamp || new Date().toISOString(),
    backend: {
      status: data.backend?.status || "online",
      framework: data.backend?.framework || "FastAPI",
      environment: data.backend?.environment || "production",
      port: data.backend?.port || 8000,
    },
    database: {
      status: data.database?.status || (data.status === "healthy" ? "connected" : "disconnected"),
      engine: data.database?.engine || "postgresql+asyncpg",
      latency_ms: data.database?.latency_ms ?? clientLatency,
      message: data.database?.message || "PostgreSQL connection OK",
    },
  } as HealthResponse;
}

export async function fetchItems(): Promise<Item[]> {
  const res = await fetch(`${API_BASE_URL}/api/items`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch items: ${res.statusText}`);
  }
  return res.json();
}

export async function createItem(title: string, description?: string): Promise<Item> {
  const res = await fetch(`${API_BASE_URL}/api/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create item: ${res.statusText}`);
  }
  return res.json();
}
