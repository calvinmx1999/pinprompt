export function cloudConfig() {
  return {
    url: process.env.SUPABASE_URL || "https://zayfzpsrhxiaetrcttko.supabase.co",
    publicKey: process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_Z4b-LXyOAGf5rECj64ILZA_Pu-mTrIk",
    secretKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}
