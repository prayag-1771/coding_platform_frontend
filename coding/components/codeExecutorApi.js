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


export async function pollJobResult(jobId) {

  while (true) {

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
      await new Promise(r => setTimeout(r, 800));
      continue;
    }

    return data;
  }
}
