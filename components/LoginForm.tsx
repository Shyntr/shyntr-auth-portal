'use client';

import * as React from "react";
import { useTranslations } from "next-intl";
import { AuthMethod } from "@/lib/shyntr-api";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginFormProps {
  loginChallenge: string;
  tenantName: string;
  clientName: string;
  methods: AuthMethod[];
}

export function LoginForm({ loginChallenge, tenantName, clientName, methods }: LoginFormProps) {
  const t = useTranslations("login");
  const commonT = useTranslations("common");

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const passwordMethod = methods.find((m) => m.type === "password");
  const ssoMethods = methods.filter((m) => m.type !== "password");

  const handleLocalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_challenge: loginChallenge,
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error === "invalid_credentials" ? t("invalidCredentials") : data.error);
      }

      if (data.redirect_to) {
        window.location.href = data.redirect_to;
      }
    } catch (err: any) {
      setError(err.message || commonT("error"));
      setIsSubmitting(false);
    }
  };

  const handleSSORedirect = (loginUrl?: string) => {
    if (!loginUrl) return;
    window.location.href = `${process.env.NEXT_PUBLIC_SHYNTR_CORE_URL || ''}${loginUrl}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{t("signIn")}</CardTitle>
          <CardDescription>
            {clientName} {t("toContinueTo")} <span className="font-semibold text-foreground">{tenantName}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {passwordMethod && (
            <form onSubmit={handleLocalSubmit} className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="username">{t("username")}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t("enterUsername")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("enterPassword")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t("signingIn") : t("signIn")}
              </Button>
            </form>
          )}

          {passwordMethod && ssoMethods.length > 0 && (
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">veya</span>
              </div>
            </div>
          )}

          {ssoMethods.length > 0 && (
            <div className="space-y-2">
              {ssoMethods.map((provider) => (
                <Button
                  key={provider.id}
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => handleSSORedirect(provider.login_url)}
                  disabled={isSubmitting}
                >
                  {provider.name} ile {t("signIn")}
                </Button>
              ))}
            </div>
          )}

          {methods.length === 0 && !error && (
            <Alert>
              <AlertDescription className="text-center">
                Bu uygulama/tenant için tanımlanmış bir giriş yöntemi bulunamadı.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            {commonT("shyntr")}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}