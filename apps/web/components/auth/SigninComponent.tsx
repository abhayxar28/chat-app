  "use client";

  import { useAuthStore } from "@/store/useAuthStore";
  import axios from "axios";
  import { useRouter } from "next/navigation";
  import { useState } from "react";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
  } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Label } from "@/components/ui/label";

  export default function SigninComponent() {
    const router = useRouter();
    const { setUserId } = useAuthStore();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true)
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/signin`, {
          email,
          password,
        });

        const token = res.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", res.data.userId);
        setUserId(res.data.userId);
        router.push("/rooms");
        setLoading(false)
      } catch (err) {
        console.error("❌ Signin failed:", err);
        setLoading(false)
        setEmail("");
        setPassword("")
      }
    };

    return (
      <div className="flex justify-center items-center min-h-screen  bg-gray-100 dark:bg-[#171717]  px-4">
        <Card className="w-full max-w-sm shadow-lg border">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
            <CardAction>
              <Button variant="link" onClick={() => router.push("/signup")} className="cursor-pointer">
                Sign Up
              </Button>
            </CardAction>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="flex flex-col gap-6">

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white"
                  />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 mt-4">
            <Button type="submit" className="w-full cursor-pointer">
              {loading ? "Logining in...":"Login"}
            </Button>
          </CardFooter>
          </form>
        </Card>
      </div>
    );
  }
