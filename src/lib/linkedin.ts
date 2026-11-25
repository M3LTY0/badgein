import { supabase } from "./supabase";

export async function continueWithLinkedIn() {
  sessionStorage.setItem("badgein-linkedin", "1");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "linkedin_oidc",
    options: { redirectTo: `${window.location.origin}/welcome` },
  });
  if (error) {
    sessionStorage.removeItem("badgein-linkedin");
    alert(error.message);
  }
}