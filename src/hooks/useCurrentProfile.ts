"use client";

import * as React from "react";

import type { Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

export function useCurrentProfile() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const supabase = createClient();
        if (!supabase) {
          if (active) setProfile(null);
          return;
        }
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (active) setProfile(null);
          return;
        }
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (active) setProfile((data as Profile | null) ?? null);
      } catch {
        if (active) setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, []);

  return { profile, loading };
}
