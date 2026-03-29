import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BookOpen, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { error } = await signIn(form.get('email') as string, form.get('password') as string);
    if (error) {
      toast.error(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { error } = await signUp(
      form.get('email') as string,
      form.get('password') as string,
      form.get('displayName') as string,
    );
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল যাচাই করুন।');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center bg-[#FDFCFB] relative px-4 sm:px-6 py-12">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md px-4 relative z-10 animate-in-fade">
        <div className="text-center mb-8 space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2.5rem] gradient-primary shadow-elevated ring-4 ring-white active:scale-95 transition-transform duration-300">
            <BookOpen className="h-10 w-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">নাহু শিখি</h1>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-1">আরবি ব্যাকরণ শেখার জগত</p>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 shadow-elevated border-white/60">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1.5 bg-secondary/30 rounded-2xl mb-8">
              <TabsTrigger value="login" className="rounded-xl font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">লগইন</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">শুরু করুন</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-6 animate-in-fade">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="font-bold text-xs uppercase tracking-wider ml-1">ইমেইল</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input id="login-email" name="email" type="email" required placeholder="name@example.com" 
                      className="pl-11 h-12 rounded-2xl border-none bg-secondary/40 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="font-bold text-xs uppercase tracking-wider ml-1">পাসওয়ার্ড</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input id="login-password" name="password" type="password" required placeholder="••••••••" 
                      className="pl-11 h-12 rounded-2xl border-none bg-secondary/40 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl gradient-primary shadow-elevated text-base font-black tracking-wide group" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      প্রবেশ করুন
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6 animate-in-fade">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="font-bold text-xs uppercase tracking-wider ml-1">আপনার নাম</Label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input id="signup-name" name="displayName" required placeholder="আপনার নাম লিখুন" 
                      className="pl-11 h-12 rounded-2xl border-none bg-secondary/40 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="font-bold text-xs uppercase tracking-wider ml-1">ইমেইল</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input id="signup-email" name="email" type="email" required placeholder="name@example.com" 
                      className="pl-11 h-12 rounded-2xl border-none bg-secondary/40 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="font-bold text-xs uppercase tracking-wider ml-1">পাসওয়ার্ড</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input id="signup-password" name="password" type="password" required minLength={6} placeholder="কমপক্ষে ৬ অক্ষর" 
                      className="pl-11 h-12 rounded-2xl border-none bg-secondary/40 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl gradient-primary shadow-elevated text-base font-black tracking-wide group" disabled={loading}>
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      রেজিস্ট্রেশন করুন
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        <p className="text-center mt-8 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
          © {new Date().getFullYear()} নাহু শিখি টিম
        </p>
      </div>
    </div>
  );
}
