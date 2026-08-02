import { type JSX } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConforaLogo } from "@/components/ui/ConforaLogo";

export default function UnauthorizedPage(): JSX.Element {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <ConforaLogo size="lg" className="mx-auto max-w-[280px]" />
        <p className="mt-1 text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          LMS
        </p>
      </div>
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle>Nemate ovlasti</CardTitle>
          <CardDescription>
            Ovaj dio aplikacije zahtijeva ulogu za uređivanje sadržaja ili članstvo u odgovarajućoj Cognito
            grupi.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="bg-brand text-white hover:bg-brand/90">
            <Link to="/dashboard" replace>
              Natrag na nadzornu ploču
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/login" replace>
              Druga prijava
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
