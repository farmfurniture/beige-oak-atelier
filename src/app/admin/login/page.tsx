// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import { validateAdminCredentials, createAdminSession } from "@/config/admin-config";
// import { Lock, Mail } from "lucide-react";

// export default function AdminLoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!email || !password) {
//       toast.error("Please enter email and password");
//       return;
//     }

//     setLoading(true);

//     // Simulate a small delay for better UX
//     await new Promise(resolve => setTimeout(resolve, 500));

//     if (validateAdminCredentials(email, password)) {
//       createAdminSession();
//       toast.success("Login successful!");
//       router.push("/admin/orders");
//     } else {
//       toast.error("Invalid credentials");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1 text-center">
//           <div className="flex justify-center mb-4">
//             <div className="p-3 rounded-full bg-primary/10">
//               <Lock className="h-8 w-8 text-primary" />
//             </div>
//           </div>
//           <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
//           <CardDescription>
//             Enter your credentials to access the admin panel
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleLogin} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="admin@farmscraft.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="Enter password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>

//             <Button
//               type="submit"
//               className="w-full"
//               disabled={loading}
//             >
//               {loading ? "Logging in..." : "Login"}
//             </Button>
//           </form>

//           <div className="mt-6 p-4 bg-muted rounded-lg">
//             <p className="text-xs text-muted-foreground text-center">
//               Default credentials are set in <code className="bg-background px-1 py-0.5 rounded">src/config/admin-config.ts</code>
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
