"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createSession, createProfile } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function AuthForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [role, setRole] = useState<"freelancer" | "agency">("freelancer");
  const [name, setName] = useState(""); // Full Name or Company Name

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Ensure profile exists (Default to freelancer if new via Google, logic can be improved)
      // Check if this is a new user is tricky on client solely via creds metadata sometimes
      // Safest is to try createProfile, if exists it returns success.
      // Problem: We don't have the "Role" if they just clicked Google.
      // For now, we'll Create Profile with default "freelancer" if it doesn't exist,
      // or we could interrupt.
      // Let's assume standard "Freelancer" for Google Signups for MVP simplicity
      // or prompt later.
      // Ideally we would check if profile exists first.

      const idToken = await user.getIdToken();

      // Attempt to create profile (will be ignored by server action if exists)
      await createProfile({
        uid: user.uid,
        email: user.email!,
        role: "freelancer", // Defaulting for Google Sign In for now
        name: user.displayName || "User",
      });

      // Create Session
      await createSession(idToken);
      router.refresh(); // Refresh middleware/server state
      router.push("/clients");
    } catch (e) {
      console.error(e);
      setError((e as Error).message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword,
      );
      const idToken = await userCredential.user.getIdToken();
      await createSession(idToken);
      router.refresh();
      router.push("/clients");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword,
      );
      const user = userCredential.user;

      // Create Firestore Profile
      await createProfile({
        uid: user.uid,
        email: user.email!,
        role: role,
        name: name,
      });

      const idToken = await user.getIdToken();
      await createSession(idToken);
      router.refresh();
      router.push("/clients");
    } catch (error: unknown) {
      // Correctly cast error to access properties safely
      const e = error as { code?: string; message: string };
      console.error(e);
      if (e.code === "auth/email-already-in-use") {
        setError("This email is already in use.");
      } else {
        setError(e.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[400px]">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Sign in to your account</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  type="button"
                  disabled={loading}
                >
                  Google
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Start managing your clients</CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <RadioGroup
                    defaultValue="freelancer"
                    onValueChange={(val) =>
                      setRole(val as "freelancer" | "agency")
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="freelancer" id="r1" />
                      <Label htmlFor="r1">Freelancer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="agency" id="r2" />
                      <Label htmlFor="r2">Agency</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    {role === "agency" ? "Agency Name" : "Full Name"}
                  </Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === "agency" ? "Acme Media" : "John Doe"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-pass">Password</Label>
                  <Input
                    id="reg-pass"
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </Button>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  type="button"
                  disabled={loading}
                >
                  Google
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
