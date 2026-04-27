"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  User, 
  Shield, 
  Palette, 
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/loader";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        const json = await res.json();
        if (json.success) {
          reset(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [reset]);

  const onUpdateProfile = async (data: z.infer<typeof profileSchema>) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Profile updated successfully!");
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update failed", err);
      toast.error("An error occurred during update");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loader size="lg" text="Loading your preferences..." className="min-h-[400px]" />;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-text-muted">Manage your account and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="profile" className="gap-2 cursor-pointer">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 cursor-pointer">
            <Palette className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2 cursor-pointer">
            <Shield className="h-4 w-4" /> Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
                </div>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
              <CardDescription>Customize how the app looks for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-xs text-text-muted">Switch between light and dark themes.</p>
                </div>
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={(checked) => {
                    setTheme(checked ? "dark" : "light");
                    toast.info(`Theme switched to ${checked ? "dark" : "light"} mode`);
                  }} 
                  className="cursor-pointer"
                />
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-text-muted">More appearance settings coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Permanent actions for your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/10 bg-destructive/5">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">Sign Out</p>
                  <p className="text-xs text-text-muted">Log out of your current session.</p>
                </div>
                <Button variant="destructive" onClick={() => {
                  toast.promise(signOut(), {
                    loading: "Signing out...",
                    success: "Signed out successfully",
                    error: "Failed to sign out"
                  });
                }}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              </div>
              <div className="p-4 rounded-lg border border-border bg-surface text-center opacity-50 pointer-events-none">
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-xs text-text-muted">Coming soon in future updates.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
