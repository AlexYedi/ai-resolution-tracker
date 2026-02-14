import { createClient } from "@/lib/supabase/server";
import { PROJECT_SEED_DATA } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createClient();

  // Upsert projects by number (idempotent)
  const { data, error } = await supabase
    .from("projects")
    .upsert(PROJECT_SEED_DATA, { onConflict: "number" })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `Seeded ${data.length} projects successfully.`,
    projects: data,
  });
}
