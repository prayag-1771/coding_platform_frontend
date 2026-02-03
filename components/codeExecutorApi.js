const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


export async function submitJob(accessToken, language, code, stdin) {

  const body = {
    language,
    code
  };

  if (stdin && stdin.length > 0) {
    body.stdin = stdin;
  }

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
  } catch (e) {
    throw new Error("Submit API returned invalid JSON");
  }

  if (!res.ok) {
    throw new Error(json?.error || "Submit failed");
  }

  console.log("SUBMIT RESPONSE =", json);

const job_id =
  json?.id ??
  json?.job_id ??
  json?.data?.id;

  if (!job_id) {
    throw new Error("Submit API did not return a job id");
  }

  return job_id;
}


export async function pollJobResult(accessToken, job_id) {

  while (true) {

    const res = await fetch(
      `${BASE_URL}/result/${job_id}`,
      {
        headers: {
          "X-API-Key": accessToken
        }
      }
    );

    let json;
    try {
      json = await res.json();
    } catch (e) {
      throw new Error("Result API returned invalid JSON");
    }

    if (!res.ok) {
      throw new Error(json?.error || "Result fetch failed");
    }

    const data = json?.data ?? json;

    if (!data || !data.status) {
      throw new Error("Invalid result payload from executor");
    }

    if (data.status !== "QUEUED" && data.status !== "RUNNING") {
      return data;
    }

    await new Promise(r => setTimeout(r, 800));
  }
}
