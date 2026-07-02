import { Button } from "@/components/ui/button";
import { AlertCircle, LoaderCircle, LockKeyhole, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { documentApi } from "@/features/documents/api-client";
import { getFriendlyError } from "@/features/documents/ui-state";

type AuthPageProps = {
  mode: "login" | "register";
};

export default function AuthPage({ mode }: AuthPageProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState("/app");

  const title = mode === "login" ? "Login" : "Register";

  useEffect(() => {
    setRedirectPath(getRedirectPath());
  }, []);

  async function submit(event: { preventDefault: () => void }) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (mode === "login") {
        await documentApi.login({ email, password });
      } else {
        await documentApi.register({ displayName, email, password });
      }

      window.location.assign(redirectPath);
    } catch (caught) {
      const message = getFriendlyError(caught);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <ToastContainer position="bottom-right" hideProgressBar newestOnTop />
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.65fr)]">
        <section
          className="relative hidden min-h-screen bg-cover bg-center lg:block"
          style={{ backgroundImage: "url('/images/landing-human.jpg')" }}
          aria-label="Doc-Me-In workspace preview"
        >
          <div className="absolute inset-0 bg-black/62" />
          <div className="relative flex min-h-screen max-w-3xl flex-col justify-end px-10 py-12 text-white">
            <p className="text-xs font-semibold uppercase">Doc-Me-In</p>
            <h1 className="mt-2 text-[40px] font-bold leading-[48px]">Keep every document easy to find.</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-white/86">
              Write, review, and share team documents from one organized workspace.
            </p>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8">
          <div className="w-full max-w-md">
            <a className="text-sm font-semibold text-primary hover:text-primary-strong" href="/">
              Doc-Me-In
            </a>
            <div className="mt-8 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-strong text-on-primary">
                  {mode === "login" ? <LockKeyhole className="h-5 w-5" aria-hidden="true" /> : <UserPlus className="h-5 w-5" aria-hidden="true" />}
                </span>
                <div>
                  <h1 className="text-2xl font-bold leading-8 text-on-surface">{title}</h1>
                  <p className="text-sm text-on-surface-variant">{mode === "login" ? "Welcome back. Continue your work." : "Create your workspace account."}</p>
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={submit}>
                {mode === "register" ? (
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-on-surface" htmlFor="display-name">
                      Display name
                    </label>
                    <input
                      id="display-name"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="Your name"
                      className="h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm outline-none focus:border-primary-strong focus:ring-2 focus:ring-primary/20"
                      autoComplete="name"
                    />
                  </div>
                ) : null}

                <div>
                  <label className="mb-1 block text-sm font-semibold text-on-surface" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm outline-none focus:border-primary-strong focus:ring-2 focus:ring-primary/20"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-on-surface" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={mode === "login" ? "Your password" : "At least 8 characters"}
                    className="h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm outline-none focus:border-primary-strong focus:ring-2 focus:ring-primary/20"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                </div>

                {error ? (
                  <div className="flex items-start gap-2 rounded-lg border border-error bg-red-50 px-3 py-2 text-sm text-error">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                ) : null}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  {title}
                </Button>
              </form>

              <p className="mt-5 text-sm text-on-surface-variant">
                {mode === "login" ? "Need account?" : "Already registered?"}{" "}
                <a className="font-semibold text-primary hover:text-primary-strong" href={mode === "login" ? "/register" : "/login"}>
                  {mode === "login" ? "Register" : "Login"}
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function getRedirectPath() {
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  if (redirect?.startsWith("/app")) {
    return redirect;
  }

  return "/app";
}
