import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (formData: {
    email: string;
    password: string;
    name: string;
    bio: string;
    location: string;
    plan: string;
    role: string;
  }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    };
    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data:{user}, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if(user?.id){ localStorage.setItem("user_id", user.id);
};
    return {};
  };

  const signUp = async (formData: {
      email: string;
      password: string;
      name: string;
      bio: string;
      location: string;
      plan: string;
      role: string;
    }) => {
      console.log(formData);
    const { data,error } = await supabase.auth.signUp({ 
      email:formData.email, 
      password: formData.password 
    });
    if (error) return { error: error.message };
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    });
    if (signInError) return { error: signInError.message };
       const userId = signInData.user?.id;
       
      await supabase.from("profiles").insert([
      {
        user_id: userId,
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        plan: formData.plan,
        role: formData.role
      }
    ]);
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    const { data,error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: siteUrl,
      },
    });
    console.log(data);
    if (error) return { error: error.message };
    return {};
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


