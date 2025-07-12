'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/types';
import { Search, MapPin, ShieldBan } from 'lucide-react';
import Image from 'next/image';
import { RequestSwapDialog } from '@/components/request-swap-dialog';
import { useAuth } from '@/context/auth-context';
import { useData } from '@/context/data-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const { users } = useData();

  if (!currentUser) return null;

  const filteredUsers = users.filter(user =>
    user.id !== currentUser.id && user.isPublic && (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.skillsOffered.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );
  
  const handleRequestSwap = (user: User) => {
    setSelectedUser(user);
    setIsSwapDialogOpen(true);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Browse Skills</h1>
        <p className="text-muted-foreground">Find talented people to swap skills with.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by skill or name (e.g., 'Photoshop' or 'Jane Smith')"
          className="pl-10 w-full md:w-1/2 lg:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map(user => (
          <Card key={user.id} className="flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex-row items-center gap-4">
               <Avatar className="h-16 w-16 border-2 border-primary">
                 <AvatarImage asChild>
                    <Image src={user.avatarUrl!} alt={user.name} width={64} height={64} data-ai-hint="person portrait"/>
                 </AvatarImage>
                 <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
               </Avatar>
               <div>
                <CardTitle className="font-headline text-lg">{user.name}</CardTitle>
                 {user.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {user.location}
                    </p>
                 )}
                 {user.isBanned && (
                    <Badge variant="destructive" className="mt-1">
                      <ShieldBan className="mr-1 h-3 w-3" /> Banned
                    </Badge>
                  )}
               </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <h3 className="font-semibold mb-2 text-sm">Skills Offered</h3>
              <div className="flex flex-wrap gap-2">
                {user.skillsOffered.slice(0, 5).map(skill => (
                  <Badge key={skill.id} variant="secondary">{skill.name}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="w-full">
                                <Button 
                                    className="w-full bg-gradient-to-r from-primary to-purple-600 text-white hover:opacity-90 transition-opacity"
                                    onClick={() => handleRequestSwap(user)}
                                    disabled={!!user.isBanned}
                                >
                                    Request Swap
                                </Button>
                            </div>
                        </TooltipTrigger>
                        {user.isBanned && (
                            <TooltipContent>
                                <p>Cannot perform actions with a banned user.</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </CardFooter>
          </Card>
        ))}
      </div>
       {filteredUsers.length === 0 && (
          <div className="text-center col-span-full py-16">
            <p className="text-muted-foreground">No users found for "{searchTerm}". Try another search.</p>
          </div>
        )}

      {selectedUser && (
        <RequestSwapDialog 
            open={isSwapDialogOpen}
            onOpenChange={setIsSwapDialogOpen}
            targetUser={selectedUser}
        />
      )}
    </div>
  );
}
