"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { auth } from "@/config/firebase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function AdminSetupPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkAdminStatus(currentUser.uid);
      } else {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAdminStatus = async (uid: string) => {
    try {
      setChecking(true);
      const adminDocRef = doc(db, 'admins', uid);
      const adminDoc = await getDoc(adminDocRef);
      
      if (adminDoc.exists() && adminDoc.data().role === 'admin') {
        setIsAdmin(true);
        toast.success("You are already an admin!");
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("Error checking admin status");
    } finally {
      setChecking(false);
    }
  };

  const createAdminUser = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    try {
      setCreating(true);
      const adminDocRef = doc(db, 'admins', user.uid);
      
      await setDoc(adminDocRef, {
        role: 'admin',
        email: user.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      toast.success("Admin user created successfully!");
      setIsAdmin(true);
    } catch (error: any) {
      console.error("Error creating admin user:", error);
      toast.error("Failed to create admin user: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking admin status...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Not Signed In
            </CardTitle>
            <CardDescription>
              Please sign in to set up admin access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/sign-in'} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Setup</h1>

      <div className="space-y-6">
        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-sm">{user.uid}</span>
            </div>
          </CardContent>
        </Card>

        {/* Admin Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isAdmin ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Admin Access Enabled
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Admin Access Not Enabled
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "You have admin access to the order management system"
                : "You need to create an admin document to access the admin panel"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You can now access the admin panel and manage orders.
                </p>
                <Button onClick={() => window.location.href = '/admin/orders'} className="w-full">
                  Go to Admin Orders
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click the button below to create an admin document in Firestore.
                  This will grant you admin access to view and manage all orders.
                </p>
                <Button
                  onClick={createAdminUser}
                  disabled={creating}
                  className="w-full"
                >
                  {creating ? "Creating..." : "Create Admin Access"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>What This Does</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Creating admin access will add a document to the <code className="bg-muted px-1 py-0.5 rounded">admins</code> collection in Firestore:
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`admins/${user.uid}
  - role: "admin"
  - email: "${user.email}"
  - createdAt: <timestamp>
  - updatedAt: <timestamp>`}
            </pre>
            <p className="mt-4">
              This allows the Firestore security rules to identify you as an admin and grant access to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>View all customer orders</li>
              <li>Update order status</li>
              <li>Add tracking information</li>
              <li>Manage order details</li>
            </ul>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        {!isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>If the button doesn't work, you can manually create the admin document:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Go to Firebase Console → Firestore Database</li>
                <li>Create collection: <code className="bg-muted px-1 py-0.5 rounded">admins</code></li>
                <li>Add document with ID: <code className="bg-muted px-1 py-0.5 rounded">{user.uid}</code></li>
                <li>Add fields:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li><code className="bg-muted px-1 py-0.5 rounded">role</code> (string): "admin"</li>
                    <li><code className="bg-muted px-1 py-0.5 rounded">email</code> (string): "{user.email}"</li>
                    <li><code className="bg-muted px-1 py-0.5 rounded">createdAt</code> (timestamp): current time</li>
                  </ul>
                </li>
                <li>Save and refresh this page</li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
