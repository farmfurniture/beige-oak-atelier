"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, Package, Heart, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/utils/formatters";
import { getUserOrders } from "@/services/firestore.service";
import { Order, formatOrderStatus, getOrderStatusColor } from "@/types/firestore";
import { updateProfile } from "firebase/auth";
import { firebaseUsersService } from "@/services/firebase-users.service";

export default function Account() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Fetch orders with retry mechanism
  const fetchOrders = useCallback(async (userId: string, attempt: number = 0) => {
    setLoadingOrders(true);
    setOrdersError(null);

    console.log(`Fetching orders for user ${userId}, attempt ${attempt + 1}`);

    try {
      const userOrders = await getUserOrders(userId);
      console.log(`Successfully loaded ${userOrders.length} orders`);
      setOrders(userOrders);
      setOrdersError(null);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      console.error("Error code:", error?.code);
      console.error("Error message:", error?.message);

      const errorMessage = error?.message || "Failed to load order history";
      setOrdersError(errorMessage);

      // Retry logic with exponential backoff (max 3 attempts)
      if (attempt < 2) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`Retrying in ${delay}ms...`);
        setTimeout(() => {
          fetchOrders(userId, attempt + 1);
        }, delay);
      } else {
        toast.error("Unable to load orders. Please refresh the page.");
      }
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    if (user) {
      const fullName = (user.displayName ?? "").trim();
      const [firstName, ...rest] = fullName.length
        ? fullName.split(" ")
        : ["", ""];
      const lastName = rest.join(" ");

      setProfileData({
        firstName: firstName ?? "",
        lastName: lastName ?? "",
        email: user.email ?? "",
        phone: user.phoneNumber ?? "",
      });

      // Fetch orders on mount
      fetchOrders(user.uid);
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    setIsSaving(true);

    try {
      // Update Firebase Auth displayName
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
      await updateProfile(user, { displayName: fullName });

      // Update Firestore user document
      await firebaseUsersService.createOrUpdateUser({
        uid: user.uid,
        email: profileData.email || null,
        phone: profileData.phone || null,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error?.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary/20 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <h1 className="section-title text-foreground mb-4">
            My Account
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your profile, orders, and preferences
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 gap-1">
            <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 sm:px-4 text-xs sm:text-sm">
              <User className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 sm:px-4 text-xs sm:text-sm">
              <Package className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 sm:px-4 text-xs sm:text-sm">
              <Heart className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 sm:px-4 text-xs sm:text-sm">
              <Settings className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-8">
              <h2 className="exo-semibold text-2xl text-foreground mb-6">
                Profile Information
              </h2>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleChange}
                  />
                </div>

                <Separator />

                <div className="flex gap-4">
                  <Button type="submit" className="btn-premium" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="exo-semibold text-2xl text-foreground">
                  Order History
                </h2>
                {!loadingOrders && user && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchOrders(user.uid)}
                  >
                    Refresh
                  </Button>
                )}
              </div>

              {loadingOrders ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading orders...</p>
                </div>
              ) : ordersError ? (
                <Card className="p-12 text-center border-destructive/50">
                  <Package className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Failed to Load Orders
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {ordersError}
                  </p>
                  <Button
                    onClick={() => user && fetchOrders(user.uid)}
                    className="btn-premium"
                  >
                    Try Again
                  </Button>
                </Card>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <Card key={order.orderId} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">
                            Order #{order.orderNumber}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full bg-${getOrderStatusColor(order.status)}-100 text-${getOrderStatusColor(order.status)}-700 capitalize`}>
                            {formatOrderStatus(order.status)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Placed on {order.createdAt.toDate().toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-xl font-bold text-primary">
                            {formatCurrency(order.pricing.total)}
                          </p>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href={`/orders/${order.orderId}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Orders Yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start shopping to see your orders here
                  </p>
                  <Button asChild className="btn-premium">
                    <Link href="/catalog">Browse Catalog</Link>
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card className="p-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Your Wishlist is Empty
              </h3>
              <p className="text-muted-foreground mb-6">
                Save your favorite items for later
              </p>
              <Button asChild className="btn-premium">
                <Link href="/catalog">Browse Catalog</Link>
              </Button>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="exo-medium text-xl text-foreground mb-4">
                  Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates about your orders</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">Receive exclusive offers and news</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-destructive/50">
                <h3 className="exo-medium text-xl text-foreground mb-4">
                  Danger Zone
                </h3>
                <div className="space-y-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sign Out</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to sign out of your account? You will need to sign in again to access your profile, orders, and wishlist.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            await signOut();
                            toast.success("Signed out successfully");
                            router.push("/");
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sign Out
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
