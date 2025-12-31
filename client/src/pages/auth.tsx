import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState<string>("");

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setLoading(true);
    try {
      const result = await api.requestOTP(phone);
      
      // In development, the API returns the OTP code
      if (result.devCode) {
        setDevCode(result.devCode);
        toast({
          title: "OTP Sent",
          description: `Development code: ${result.devCode}`,
        });
      } else {
        toast({
          title: "OTP Sent",
          description: "Check your phone for the verification code.",
        });
      }
      
      setStep('otp');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) return;

    setLoading(true);
    try {
      await login(phone, otp);
      toast({
        title: "Welcome!",
        description: "You've successfully signed in.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid or expired code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
           <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-2xl shadow-xl shadow-primary/20 mb-4">
             U
           </div>
           <h1 className="text-3xl font-display font-bold tracking-tight">Welcome to Undr</h1>
           <p className="text-muted-foreground">The premium marketplace for exclusive deals.</p>
        </div>

        <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>{step === 'phone' ? 'Sign in with Phone' : 'Verify OTP'}</CardTitle>
            <CardDescription>
              {step === 'phone' 
                ? 'Enter your phone number to receive a verification code.' 
                : `We sent a 4-digit code to ${phone}. Enter it below.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone"
                      placeholder="+974 0000 0000" 
                      className="pl-9 h-11"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      type="tel"
                      autoFocus
                      data-testid="input-phone"
                    />
                  </div>
                </div>
                <Button className="w-full h-11" disabled={!phone || loading} data-testid="button-send-otp">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2 flex flex-col items-center">
                  <InputOTP maxLength={4} value={otp} onChange={setOtp} data-testid="input-otp">
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="h-14 w-14 text-2xl" />
                      <InputOTPSlot index={1} className="h-14 w-14 text-2xl" />
                      <InputOTPSlot index={2} className="h-14 w-14 text-2xl" />
                      <InputOTPSlot index={3} className="h-14 w-14 text-2xl" />
                    </InputOTPGroup>
                  </InputOTP>
                  <p className="text-xs text-muted-foreground mt-2">
                    {devCode ? `Dev code: ${devCode}` : "Try '1234' for demo"}
                  </p>
                </div>
                <Button className="w-full h-11" disabled={otp.length !== 4 || loading} data-testid="button-verify-otp">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify & Sign In <KeyRound className="ml-2 h-4 w-4" /></>}
                </Button>
                <Button variant="link" className="w-full" size="sm" onClick={() => { setStep('phone'); setOtp(""); }} type="button" data-testid="button-change-phone">
                  Change phone number
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
