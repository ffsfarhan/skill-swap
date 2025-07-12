'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { users as initialUsers, swapRequests } from '@/lib/mock-data';
import type { User, SwapRequest } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldBan, ShieldCheck, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>(initialUsers);

    useEffect(() => {
        if (!loading && (!user || !user.isAdmin)) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleToggleUserBan = (userId: string) => {
        let userName = '';
        let wasBanned = false;
        
        const updatedUsers = users.map(u => {
            if (u.id === userId) {
                userName = u.name;
                wasBanned = !!u.isBanned;
                return { ...u, isBanned: !u.isBanned };
            }
            return u;
        });

        setUsers(updatedUsers);

        toast({
            title: wasBanned ? 'User Unbanned' : 'User Banned',
            description: `${userName} has been ${wasBanned ? 'unbanned' : 'banned'}.`,
            variant: wasBanned ? 'default' : 'destructive',
        });
    };

    const downloadJSON = (data: unknown, filename: string) => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(data, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = filename;
        link.click();
        toast({ title: 'Download Started', description: `${filename} is being downloaded.` });
    };

    const handleDownloadUserActivity = () => {
        downloadJSON(users, 'user-activity.json');
    };

    const handleDownloadFeedbackLogs = () => {
        const feedbackData = swapRequests
            .filter(swap => swap.fromUserFeedback || swap.toUserFeedback)
            .map(swap => ({
                swapId: swap.id,
                fromUser: swap.fromUser.name,
                toUser: swap.toUser.name,
                fromUserRating: swap.fromUserRating,
                fromUserFeedback: swap.fromUserFeedback,
                toUserRating: swap.toUserRating,
                toUserFeedback: swap.toUserFeedback,
            }));
        downloadJSON(feedbackData, 'feedback-logs.json');
    };

    const handleDownloadSwapStats = () => {
         const swapStats = {
            totalSwaps: swapRequests.length,
            pending: swapRequests.filter(s => s.status === 'pending').length,
            accepted: swapRequests.filter(s => s.status === 'accepted').length,
            completed: swapRequests.filter(s => s.status === 'completed').length,
            rejected: swapRequests.filter(s => s.status === 'rejected').length,
            cancelled: swapRequests.filter(s => s.status === 'cancelled').length,
        };
        downloadJSON(swapStats, 'swap-stats.json');
    }
    
    if (loading || !user || !user.isAdmin) {
        return <div className="text-center p-8">Redirecting...</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users, monitor swaps, and platform settings.</p>

             <Tabs defaultValue="users">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="swaps">Swap Monitoring</TabsTrigger>
                    <TabsTrigger value="reporting">Reporting</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u.id} className={u.isBanned ? 'bg-destructive/10' : ''}>
                                            <TableCell className="font-medium">{u.name}</TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>
                                                {u.isAdmin ? (
                                                    <Badge variant="destructive">Admin</Badge>
                                                ) : (
                                                    <Badge variant="secondary">User</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {u.isBanned ? (
                                                     <Badge variant="destructive">Banned</Badge>
                                                ) : (
                                                     <Badge variant="outline">Active</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!u.isAdmin && (
                                                     <Button variant="ghost" size="sm" onClick={() => handleToggleUserBan(u.id)}>
                                                        {u.isBanned ? <ShieldCheck className="mr-2"/> : <ShieldBan className="mr-2"/>}
                                                        {u.isBanned ? 'Unban' : 'Ban'}
                                                     </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="swaps">
                     <Card>
                        <CardHeader>
                            <CardTitle>All Swap Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>From</TableHead>
                                        <TableHead>To</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Offered Skill</TableHead>
                                        <TableHead>Wanted Skill</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {swapRequests.map((swap) => (
                                        <TableRow key={swap.id}>
                                            <TableCell>{swap.fromUser.name}</TableCell>
                                            <TableCell>{swap.toUser.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={swap.status === 'accepted' ? 'default' : (swap.status === 'pending' ? 'secondary' : 'destructive')}>{swap.status}</Badge>
                                            </TableCell>
                                            <TableCell>{swap.offeredSkill.name}</TableCell>
                                            <TableCell>{swap.wantedSkill.name}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reporting">
                    <Card>
                        <CardHeader>
                            <CardTitle>Download Reports</CardTitle>
                            <CardDescription>Download platform data in JSON format.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">User Activity</h3>
                                    <p className="text-sm text-muted-foreground">A complete list of all users and their profile data.</p>
                                </div>
                                <Button onClick={handleDownloadUserActivity}><Download className="mr-2"/>Download</Button>
                            </div>
                             <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">Feedback Logs</h3>
                                    <p className="text-sm text-muted-foreground">All ratings and feedback submitted for completed swaps.</p>
                                </div>
                                <Button onClick={handleDownloadFeedbackLogs}><Download className="mr-2"/>Download</Button>
                            </div>
                             <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">Swap Statistics</h3>
                                    <p className="text-sm text-muted-foreground">An overview of swap request statuses across the platform.</p>
                                </div>
                                <Button onClick={handleDownloadSwapStats}><Download className="mr-2"/>Download</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
