
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/app/(auth)/context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getAuth, RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const phoneSchema = z.object({
  phoneNumber: z.string().refine(val => /^\+[1-9]\d{1,14}$/.test(val), {
    message: "Please enter a valid phone number with country code (e.g., +15551234567).",
  }),
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: "OTP must be 6 digits." }).max(6),
});

export function PhoneForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { signInWithPhoneNumber, verifyOtp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    const auth = getAuth();
    // Ensure this is only run on the client
    setTimeout(() => {
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer && !recaptchaContainer.hasChildNodes()) {
          // @ts-ignore
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              'size': 'invisible',
          });
      }
    }, 100);
  }, []);

  const handleSendOtp = async (data: z.infer<typeof phoneSchema>) => {
    setIsLoading(true);
    // @ts-ignore
    const appVerifier = window.recaptchaVerifier;
    const result = await signInWithPhoneNumber(data.phoneNumber, appVerifier);
    if (result) {
      setConfirmationResult(result);
      toast({
        title: 'OTP Sent',
        description: 'A one-time code has been sent to your phone.',
      });
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (data: z.infer<typeof otpSchema>) => {
    if (!confirmationResult) return;
    setIsLoading(true);
    try {
      await verifyOtp(confirmationResult, data.otp);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Verifying OTP',
        description: 'The code you entered is invalid. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!confirmationResult ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="space-y-4">
            <FormField
              control={phoneForm.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 555 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Code
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One-Time Code</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Code & Sign In
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
