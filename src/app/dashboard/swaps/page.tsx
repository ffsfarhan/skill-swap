'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { swapRequests as initialSwapRequests } from '@/lib/mock-data';
import type { SwapRequest } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowDown, Check, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth-context';

const SwapCard = ({ swap, onUpdateStatus, currentUserId }: { swap: SwapRequest, onUpdateStatus: (swapId: string, status: SwapRequest['status']) => void, currentUserId: string }) => {
  const isIncoming = swap.toUser.id === currentUserId;
  const otherUser = isIncoming ? swap.fromUser : swap.toUser;
  
  const handleAccept = () => onUpdateStatus(swap.id, 'accepted');
  const handleReject = () => onUpdateStatus(swap.id, 'rejected');
  const handleCancel = () => onUpdateStatus(swap.id, 'cancelled');

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage asChild>
                <Image src={otherUser.avatarUrl!} alt={otherUser.name} width={40} height={40} data-ai-hint="person avatar"/>
            </AvatarImage>
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-semibold">{otherUser.name}</span>
        </div>
        <CardDescription className="pt-2 text-xs">
          {swap.status === 'pending' ? `Requested ${formatDistanceToNow(swap.createdAt, { addSuffix: true })}` : `Accepted ${formatDistanceToNow(swap.createdAt, { addSuffix: true })}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 flex-grow">
        <p className="text-sm text-muted-foreground">
          {isIncoming ? `${otherUser.name} wants your...` : 'You requested their...'}
        </p>
        <div className="font-semibold p-2 bg-accent/30 rounded-md text-center">{isIncoming ? swap.wantedSkill.name : swap.offeredSkill.name}</div>
        <div className="flex justify-center items-center my-1">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          {isIncoming ? '...in exchange for their:' : '...in exchange for your:'}
        </p>
        <div className="font-semibold p-2 bg-secondary rounded-md text-center">{isIncoming ? swap.offeredSkill.name : swap.wantedSkill.name}</div>
      </CardContent>
      {swap.status === 'pending' && (
        <CardFooter className="flex gap-2">
          {isIncoming ? (
            <>
              <Button size="sm" variant="outline" className="w-full" onClick={handleReject}>
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button size="sm" className="w-full" onClick={handleAccept}>
                <Check className="mr-2 h-4 w-4" /> Accept
              </Button>
            </>
          ) : (
            <Button size="sm" variant="destructive" className="w-full" onClick={handleCancel}>
              <Trash2 className="mr-2 h-4 w-4" /> Cancel
            </Button>
          )}
        </CardFooter>
      )}
       {swap.status === 'accepted' && (
        <CardFooter>
            <Button variant="outline" className="w-full">Message {otherUser.name}</Button>
        </CardFooter>
      )}
    </Card>
  );
};


export default function SwapsPage() {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>(initialSwapRequests);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  if (!currentUser) return null;

  const handleUpdateStatus = (swapId: string, status: SwapRequest['status']) => {
    setSwapRequests(prev => prev.map(req => req.id === swapId ? {...req, status} : req));
    toast({
        title: `Request ${status}`,
        description: `The swap request has been ${status}.`
    });
  }
  
  const incomingRequests = swapRequests.filter(
    (req) => req.toUser.id === currentUser.id && req.status === 'pending'
  );
  const outgoingRequests = swapRequests.filter(
    (req) => req.fromUser.id === currentUser.id && req.status === 'pending'
  );
  const activeSwaps = swapRequests.filter(
    (req) => (req.fromUser.id === currentUser.id || req.toUser.id === currentUser.id) && req.status === 'accepted'
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Swaps</h1>
        <p className="text-muted-foreground">Manage your skill swap requests and active exchanges.</p>
      </div>

      <Tabs defaultValue="incoming">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="incoming">Incoming</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
            {incomingRequests.length > 0 ? (
              incomingRequests.map(swap => <SwapCard key={swap.id} swap={swap} onUpdateStatus={handleUpdateStatus} currentUserId={currentUser.id} />)
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-8">No incoming requests.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="outgoing">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
            {outgoingRequests.length > 0 ? (
              outgoingRequests.map(swap => <SwapCard key={swap.id} swap={swap} onUpdateStatus={handleUpdateStatus} currentUserId={currentUser.id} />)
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-8">No outgoing requests.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="active">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
             {activeSwaps.length > 0 ? (
              activeSwaps.map(swap => <SwapCard key={swap.id} swap={swap} onUpdateStatus={handleUpdateStatus} currentUserId={currentUser.id} />)
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-8">No active swaps.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
