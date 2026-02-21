export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const visibility = searchParams.get("visibility");

    let filter = {};

    if (visibility === "public") {
      filter.visibility = "public";
    }

    if (visibility === "private") {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;

      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      let user;
      try {
        user = verifyToken(token);
      } catch {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        );
      }

      filter = {
        visibility: "private",
        ownerId: user._id, // 🔥 fixed
      };
    }

    const problems = await Problem.find(filter);

    return NextResponse.json(problems);

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}