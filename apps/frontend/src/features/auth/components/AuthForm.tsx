"use client";

import { useState } from "react";
import { Mail, Lock, User as UserIcon, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { getErrorMessage } from "@/shared/lib/get-error-message";
import { useSignIn, useSignUp } from "../hooks/useAuth";
import { googleLoginUrl } from "../api";

type Tab = "signin" | "signup";

export function AuthForm() {
  const [tab, setTab] = useState<Tab>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = useSignIn();
  const signUp = useSignUp();

  const pending = signIn.isPending || signUp.isPending;
  const errorMessage = signIn.error
    ? getErrorMessage(signIn.error)
    : signUp.error
      ? getErrorMessage(signUp.error)
      : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === "signin") {
      signIn.mutate({ email, password });
    } else {
      signUp.mutate({ name, email, password });
    }
  }

  const activeIndex = tab === "signin" ? 0 : 1;

  return (
    <div className="w-full max-w-md rounded-md border border-outline-variant bg-surface-container p-8 shadow-2xl">
      {/* Tabs — one sliding indicator, not two separate static borders, so
          there's nothing that can visually mis-align between states. */}
      <div className="relative mb-8 flex border-b border-outline-variant pb-2">
        <button
          type="button"
          onClick={() => setTab("signin")}
          className={`flex-1 py-2 text-center text-body-lg font-medium transition-colors ${
            tab === "signin" ? "font-semibold text-on-surface" : "text-outline"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`flex-1 py-2 text-center text-body-lg font-medium transition-colors ${
            tab === "signup" ? "font-semibold text-on-surface" : "text-outline"
          }`}
        >
          Create Account
        </button>
        <div
          className="absolute bottom-[-2px] h-[3px] w-1/2 rounded-t-full bg-on-surface transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          window.location.href = googleLoginUrl();
        }}
      >
        Sign in with Google
      </Button>

      <div className="relative flex items-center justify-center py-6">
        <div className="absolute inset-x-0 border-t border-outline-variant" />
        <span className="relative bg-surface-container px-4 text-label-sm text-outline">
          {tab === "signin" ? "or continue with email" : "or register with email"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {tab === "signup" && (
          <Input
            label="Full name"
            icon={<UserIcon size={16} />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
          />
        )}

        <Input
          label="Email address"
          type="email"
          icon={<Mail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-label-sm text-on-surface-variant"
            >
              Password
            </label>
            {tab === "signin" && (
              <a
                href="#"
                className="text-label-sm font-medium text-on-surface-variant hover:text-on-surface"
              >
                Forgot password?
              </a>
            )}
          </div>
          <Input
            id="password"
            type="password"
            icon={<Lock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              tab === "signin" ? "••••••••" : "Create a strong password"
            }
            required
          />
        </div>

        {errorMessage && (
          <p className="text-label-sm text-error">{errorMessage}</p>
        )}

        <Button type="submit" disabled={pending} className="mt-2">
          {pending
            ? "Please wait..."
            : tab === "signin"
              ? "Sign In"
              : "Create Account"}
          {!pending &&
            (tab === "signin" ? (
              <ArrowRight size={16} />
            ) : (
              <UserPlus size={16} />
            ))}
        </Button>

        {tab === "signup" && (
          <p className="mt-2 text-center text-label-sm text-outline">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-on-surface-variant hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-on-surface-variant hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        )}
      </form>
    </div>
  );
}