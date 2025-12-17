import React, { useState, useEffect, useRef } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  sendEmailVerification,
  signOut,
  AuthError,
  User
} from 'firebase/auth';
import { auth } from '@/services/firebase';
import { Button, Input } from '@/components/ui';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, RotateCcw, Eye, EyeOff, LogOut, HelpCircle, AlertTriangle, Edit2, Loader2, ExternalLink } from 'lucide-react';

// New Component: Handles the "Waiting for Verification" state
export function VerifyEmail({ user }: { user: User }) {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  
  // Use a ref to track if we've already detected verification to block further checks
  const isVerifiedRef = useRef(false);
  const reloadTimeoutRef = useRef<any>(null);

  // Poll for verification status
  useEffect(() => {
    // If we already know we are verified, do nothing.
    if (isVerified || isVerifiedRef.current) return;

    const interval = setInterval(async () => {
      await checkVerified(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [user, isVerified]); 
  
  // Cleanup timeout on unmount
  useEffect(() => {
      return () => {
          if (reloadTimeoutRef.current) {
              clearTimeout(reloadTimeoutRef.current);
          }
      };
  }, []);

  // Handle auto-send on first signup
  useEffect(() => {
    const shouldSend = sessionStorage.getItem('shouldSendVerification');
    if (shouldSend) {
      sessionStorage.removeItem('shouldSendVerification');
      handleResend();
    }
  }, [user]);

  const checkVerified = async (manual: boolean) => {
    if (isVerifiedRef.current) return;

    if (manual) setIsChecking(true);
    try {
      if (auth.currentUser) {
        // 1. Reload the user metadata from Firebase servers
        await auth.currentUser.reload();
        
        // 2. Check if verified
        if (auth.currentUser.emailVerified) {
          isVerifiedRef.current = true; // Mark immediately to stop interval
          setIsVerified(true);
          
          // 3. FORCE token refresh. This triggers onIdTokenChanged in App.tsx.
          await auth.currentUser.getIdToken(true);

          // 4. FALLBACK: Force reload if navigation doesn't happen automatically
          reloadTimeoutRef.current = setTimeout(() => {
             if (window.location.pathname === '/login' || window.location.pathname === '/') {
                window.location.reload();
             }
          }, 2000);
        } else if (manual) {
          setStatusMsg('Not verified yet. Please click the link in your email.');
          setTimeout(() => setStatusMsg(''), 3000);
        }
      }
    } catch (e: any) {
      console.error("Error checking verification:", e);
      // CRITICAL FIX: If the session is invalid (auth/invalid-credential), sign out immediately.
      // This prevents the "Auth failed" loop and lets the user log in again cleanly.
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-token-expired') {
          await signOut(auth);
      }
    } finally {
      if (manual) setIsChecking(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMsg('');
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setResendMsg('Verification email sent!');
        setTimeout(() => setResendMsg(''), 5000);
      }
    } catch (e: any) {
      if (e.code === 'auth/too-many-requests') {
        setResendMsg('Please wait a minute before sending again.');
      } else {
        setResendMsg('Error sending email. Try again later.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = () => signOut(auth);

  if (isVerified) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full text-green-600 mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Email Verified!</h2>
          <p className="text-slate-500 mb-6">Entering application...</p>
          
          <div className="flex justify-center mb-6">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>

          {/* Manual Controls in case auto-redirect fails */}
          <div className="space-y-2 w-full max-w-xs mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500">
             <Button onClick={() => window.location.reload()} className="w-full bg-slate-900 hover:bg-slate-800">
                Click here to continue
             </Button>
             <Button variant="ghost" onClick={handleLogout} className="w-full text-xs text-slate-400 hover:text-red-500">
                Stuck? Sign Out
             </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full text-blue-600 mb-6">
          <Mail className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Check your Inbox</h2>
        <p className="text-slate-500 mb-4 text-sm">
          We sent a verification link to:
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 flex items-center justify-between group">
           <span className="text-slate-900 font-medium truncate mr-2 text-sm">{user.email}</span>
           <button 
             onClick={handleLogout}
             className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 shrink-0 transition-colors"
             title="Wrong email? Sign out and try again"
           >
             <Edit2 className="w-3 h-3" /> Change
           </button>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => checkVerified(true)} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isChecking}
          >
            {isChecking ? 'Checking...' : "I've Verified My Email"}
          </Button>

          {statusMsg && <p className="text-xs text-amber-600 font-medium">{statusMsg}</p>}

          <div className="relative py-2">
             <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
             <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or</span></div>
          </div>

          <Button 
            onClick={handleResend} 
            variant="secondary" 
            className="w-full border border-slate-200"
            disabled={isResending}
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
          
          {resendMsg && (
            <div className={`text-xs px-2 py-1 rounded ${resendMsg.includes('wait') ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50'}`}>
              {resendMsg}
            </div>
          )}
          
          <button 
            onClick={() => setShowHelp(!showHelp)} 
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mt-2"
          >
            <HelpCircle className="w-3 h-3" />
            Didn't receive the email?
          </button>

          {showHelp && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-left text-xs text-amber-900 space-y-2">
                <div className="font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Troubleshooting Steps:
                </div>
                <ul className="list-disc pl-4 space-y-1 opacity-90">
                    <li>Check your <strong>Spam</strong> or <strong>Junk</strong> folder.</li>
                    <li>Wait 2-3 minutes; delivery can be delayed.</li>
                    <li>Verify the email address above is correct. If not, click "Change".</li>
                </ul>
            </div>
          )}

          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className="w-full text-slate-400 hover:text-slate-600 mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isReset, setIsReset] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const getErrorMessage = (error: AuthError) => {
    switch (error.code) {
      case 'auth/invalid-credential':
        return 'Incorrect email or password.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please Sign In.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later.';
      case 'auth/configuration-not-found':
        return 'Login disabled. Contact admin.';
      default:
        return `Error: ${error.message}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      if (isReset) {
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg('Reset link sent! Please check your inbox.');
        setIsReset(false); 
      } else if (isSignUp) {
        // Create account
        await createUserWithEmailAndPassword(auth, email, password);
        
        // Mark for auto-sending verification in the next screen (VerifyEmail component)
        sessionStorage.setItem('shouldSendVerification', 'true');
        // DO NOT Sign out. Let App.tsx handle the unverified state.
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
        // App.tsx handles the rest
      }
    } catch (err: any) {
      // Don't log full error object to console to avoid confusing the user with raw Firebase errors
      if (err.code === 'auth/invalid-credential') {
        console.warn("Auth failed: Invalid Credential");
      } else {
        console.warn("Auth failed:", err.code); 
      }
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setIsReset(false);
    setError('');
    setSuccessMsg('');
    setPassword('');
  };

  const toggleReset = () => {
    setIsReset(!isReset);
    setIsSignUp(false);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-xl text-white mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isReset ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 mt-2">
            {isReset 
              ? 'Enter your email to receive a reset link' 
              : isSignUp 
                ? 'Join Probability Compass today' 
                : 'Sign in to access your dashboard'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex flex-col items-start gap-1 text-red-700 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            {/* Contextual Action Button for Existing Account Error */}
            {(error.includes('already registered') || error.includes('already exists')) && isSignUp && (
               <Button 
                 variant="secondary"
                 onClick={() => {
                   toggleMode();
                   setError('');
                 }}
                 className="ml-6 mt-1 h-7 text-xs bg-white border border-red-200 text-red-700 hover:bg-red-50 w-auto px-3"
               >
                 Switch to Sign In
               </Button>
            )}
            {error.includes('Incorrect') && (
              <button onClick={toggleReset} className="ml-6 text-xs underline text-red-800 hover:text-red-950">
                Forgot password?
              </button>
            )}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-2 text-green-700 text-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                type="email" 
                placeholder="you@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {!isReset && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                  required
                  minLength={6}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full h-10 mt-2 bg-slate-900" disabled={isLoading}>
            {isLoading ? 'Processing...' : (
              <>
                {isReset ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Sign In'}
                {!isReset && <ArrowRight className="w-4 h-4 ml-2" />}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          {!isReset && !isSignUp && (
            <button 
              type="button" 
              onClick={toggleReset}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-900"
            >
              Forgot your password?
            </button>
          )}

          {isReset && (
             <button 
              type="button" 
              onClick={() => setIsReset(false)}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-900 flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Back to Login
            </button>
          )}

          <div className="relative">
             {!isReset && (
              <>
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or</span>
                </div>
              </>
             )}
          </div>

          <button 
            type="button" 
            onClick={toggleMode}
            className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>

      </div>
    </div>
  );
}