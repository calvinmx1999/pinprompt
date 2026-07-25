import { createClient } from "@supabase/supabase-js";

const DIRECT_SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://zayfzpsrhxiaetrcttko.supabase.co";
const SUPABASE_URL =
  typeof window !== "undefined" && /^https?:$/.test(window.location.protocol)
    ? `${window.location.origin}/api/supabase`
    : DIRECT_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_Z4b-LXyOAGf5rECj64ILZA_Pu-mTrIk";

let client;

export function getSupabase() {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "sb-zayfzpsrhxiaetrcttko-auth-token",
      },
      realtime: {
        params: { eventsPerSecond: 2 },
      },
    });
  }
  return client;
}

export function toPinPromptUser(user) {
  if (!user?.id) return null;
  const now = new Date().toISOString();
  return {
    id: user.id,
    name:
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "PinPrompt 用户",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url || "",
    role: "owner",
    plan: "free",
    provider: "supabase",
    createdAt: user.created_at || now,
    updatedAt: user.updated_at || now,
  };
}

export async function getCloudUser() {
  const { data, error } = await getSupabase().auth.getUser();
  if (error && error.name !== "AuthSessionMissingError") throw error;
  return toPinPromptUser(data?.user);
}

export async function signInCloud(email, password) {
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email: String(email || "").trim(),
    password,
  });
  if (error) throw error;
  return toPinPromptUser(data.user);
}

export async function signUpCloud(email, password) {
  const { data, error } = await getSupabase().auth.signUp({
    email: String(email || "").trim(),
    password,
  });
  if (error) throw error;
  return {
    user: toPinPromptUser(data.user),
    hasSession: Boolean(data.session),
  };
}

export async function signOutCloud() {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

async function fetchRows(table, userId) {
  const { data, error } = await getSupabase()
    .from(table)
    .select("id, data")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((row) => ({
    ...(row.data || {}),
    id: row.data?.id || row.id,
    userId,
  }));
}

export async function fetchCloudLibrary(userId) {
  const [prompts, projects] = await Promise.all([
    fetchRows("prompts", userId),
    fetchRows("projects", userId),
  ]);
  return { prompts, projects };
}

async function upsertRow(table, userId, record) {
  const data = { ...record, userId };
  const { error } = await getSupabase()
    .from(table)
    .upsert(
      {
        id: data.id,
        user_id: userId,
        data,
      },
      { onConflict: "id,user_id" }
    );
  if (error) throw error;
}

export function upsertCloudPrompt(userId, prompt) {
  return upsertRow("prompts", userId, prompt);
}

export function upsertCloudProject(userId, project) {
  return upsertRow("projects", userId, project);
}

export async function upsertCloudPrompts(userId, prompts) {
  if (!prompts.length) return;
  const rows = prompts.map((prompt) => ({
    id: prompt.id,
    user_id: userId,
    data: { ...prompt, userId },
  }));
  const { error } = await getSupabase()
    .from("prompts")
    .upsert(rows, { onConflict: "id,user_id" });
  if (error) throw error;
}

export async function upsertCloudProjects(userId, projects) {
  if (!projects.length) return;
  const rows = projects.map((project) => ({
    id: project.id,
    user_id: userId,
    data: { ...project, userId },
  }));
  const { error } = await getSupabase()
    .from("projects")
    .upsert(rows, { onConflict: "id,user_id" });
  if (error) throw error;
}

export async function deleteCloudPrompt(userId, promptId) {
  const { error } = await getSupabase()
    .from("prompts")
    .delete()
    .eq("id", promptId)
    .eq("user_id", userId);
  if (error) throw error;
}
