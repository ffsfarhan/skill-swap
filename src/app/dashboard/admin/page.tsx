'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ShieldBan, ShieldCheck } from 'lucide-react';
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

    const toggleUserBan = (userId: string) => {
        setUsers(currentUsers =>
            currentUsers.map(u => {
                if (u.id === userId) {
                    const wasBanned = u.isBanned;
                    toast({
                        title: wasBanned ? 'User Unbanned' : 'User Banned',
                        description: `${u.name} has been ${wasBanned ? 'unbanned' : 'banned'}.`,
                        variant: wasBanned ? 'default' : 'destructive',
                    });
                    return { ...u, isBanned: !wasBanned };
                }
                return u;
            })
        );
    };

    if (loading || !user || !user.isAdmin) {
        return <div className="text-center p-8">Redirecting...</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users, monitor swaps, and platform settings.</p>

             <Tabs defaultValue="users">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="swaps">Swap Monitoring</TabsTrigger>
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
                                                     <Button variant="ghost" size="sm" onClick={() => toggleUserBan(u.id)}>
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
            </Tabs>
        </div>
    )
}