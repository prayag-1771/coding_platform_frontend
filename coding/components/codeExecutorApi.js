export async function submitJob(
  language,
  code,
  inputs
) {
  const body = {
    language,
    code,
    inputs
  };

  const res = await fetch("/api/executor/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error("Submit API returned invalid JSON");
  }

  if (!res.ok || !json.success) {
    throw new Error(json?.error || "Submit failed");
  }

  const jobId = json?.data?.job_id;

  if (!jobId) {
    throw new Error("Submit API did not return a job id");
  }

  return jobId;
}


export async function pollJobResult(jobId, options = {}) {
  const maxAttempts = options.maxAttempts ?? 75;
  const pollIntervalMs = options.pollIntervalMs ?? 800;
  const timeoutMs = options.timeoutMs ?? 60000;
  const startedAt = Date.now();

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("Executor job timed out while waiting for results");
    }

    const res = await fetch(`/api/executor/result/${jobId}`);

    let json;
    try {
      json = await res.json();
    } catch {
      throw new Error("Result API returned invalid JSON");
    }

    if (!res.ok || !json.success) {
      throw new Error(json?.error || "Result fetch failed");
    }

    const data = json.data;

    if (!data || !data.status) {
      throw new Error("Invalid result payload from executor");
    }

    if (data.status === "QUEUED" || data.status === "RUNNING") {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      continue;
    }

    return data;
  }

  throw new Error("Executor job did not finish after repeated polling");
}
