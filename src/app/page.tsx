
'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainCircuit } from "lucide-react";
import { useAuth } from './(auth)/context';
import { useRouter } from 'next/navigation';
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm';
import { PhoneForm } from '@/components/auth/PhoneForm';
import { SocialLogins } from '@/components/auth/SocialLogins';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);


  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    )
  }
  
  // If there is no user, we will be redirected, so we can render nothing or a loading indicator
  // to prevent the layout from briefly appearing before the redirect happens.
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
            <BrainCircuit className="h-12 w-12 text-gradient" />
            <h1 className="text-3xl font-bold font-headline tracking-tight mt-4 text-gradient">
                FlowTask AI
            </h1>
            <p className="text-muted-foreground mt-2">Your smart, energy-aware to-do list.</p>
        </div>
        <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Login with Email</CardTitle>
                        <CardDescription>Enter your email and password to sign in or create an account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EmailPasswordForm />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="phone">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Login with Phone</CardTitle>
                        <CardDescription>Enter your phone number to receive a one-time code.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PhoneForm />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                </span>
            </div>
        </div>
        
        <SocialLogins />
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
}
