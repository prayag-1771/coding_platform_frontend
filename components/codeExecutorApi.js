const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function submitJob(
  accessToken,
  language,
  code,
  inputs
) {
  const body = {
    language,
    code,
    inputs
  };

  const res = await fetch(`${BASE_URL}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",

      "X-API-Key": accessToken
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


export async function pollJobResult(accessToken, jobId) {

  while (true) {

    const res = await fetch(
      `${BASE_URL}/result/${jobId}`,
      {
        headers: {
          "X-API-Key": accessToken
        }
      }
    );

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
