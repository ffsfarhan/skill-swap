'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Skill, User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Pen, PlusCircle, Wand2, MapPin, Calendar, X, Star } from 'lucide-react';
import { SuggestSkillsDialog } from '@/components/suggest-skills-dialog';
import { AddSkillDialog } from '@/components/add-skill-dialog';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth-context';
import { useData } from '@/context/data-context';
import {
  CodeIcon,
  DesignIcon,
  BusinessIcon,
  LifestyleIcon,
  OtherIcon,
} from '@/components/icons';


const skillIcons: Record<Skill['category'], React.ElementType> = {
  Tech: CodeIcon,
  Creative: DesignIcon,
  Business: BusinessIcon,
  Lifestyle: LifestyleIcon,
  Other: OtherIcon,
};

const SkillBadge = ({ skill, onRemove }: { skill: Skill; onRemove: () => void; }) => {
  const Icon = skillIcons[skill.category] || OtherIcon;
  return (
    <Badge variant="outline" className="py-2 px-3 text-sm flex items-center gap-2 transition-colors hover:bg-accent/20">
      <Icon className="h-4 w-4 text-primary" />
      <span>{skill.name}</span>
      <button className="ml-2 opacity-50 hover:opacity-100" onClick={onRemove} title={`Remove ${skill.name}`}>
          <X className="h-3 w-3"/>
      </button>
    </Badge>
  );
};

const SkillsList = ({ title, skills, onAdd, onSuggest, onRemove }: { title: string; skills: Skill[]; onAdd: () => void; onSuggest: () => void; onRemove: (skillId: string) => void;}) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex justify-between items-center">
                <span className="font-headline">{title}</span>
                 <Button variant="ghost" size="sm" onClick={onSuggest}>
                    <Wand2 className="mr-2 h-4 w-4" /> Suggest
                </Button>
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            {skills.map(skill => <SkillBadge key={skill.id} skill={skill} onRemove={() => onRemove(skill.id)}/>)}
            <Button variant="outline" className="border-dashed" onClick={onAdd}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
            </Button>
        </CardContent>
    </Card>
);

const UserRating = ({ userId }: { userId: string }) => {
    const { swapRequests } = useData();
    const relevantSwaps = swapRequests.filter(
      (s) =>
        (s.toUser.id === userId || s.fromUser.id === userId) &&
        s.status === 'completed'
    );
  
    const ratings = relevantSwaps.flatMap((s) => {
        const userRatings = [];
        if (s.toUser.id === userId && s.fromUserRating) userRatings.push(s.fromUserRating);
        if (s.fromUser.id === userId && s.toUserRating) userRatings.push(s.toUserRating);
        return userRatings;
    });

    if (ratings.length === 0) {
        return <p className="text-sm text-muted-foreground">No ratings yet</p>;
    }

    const avgRating = ratings.reduce((acc, r) => acc + r, 0) / ratings.length;

    return (
        <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({ratings.length} ratings)</span>
        </div>
    );
};

export default function DashboardPage() {
    const { toast } = useToast();
    const { user, updateUser: updateAuthUser } = useAuth();
    const { updateUser: updateDataContextUser } = useData();
    
    const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [skillListType, setSkillListType] = useState<'offered' | 'wanted'>('offered');

    if (!user) return null;
    
    const handleTogglePrivacy = (isPublic: boolean) => {
        updateDataContextUser(user.id, { isPublic });
        updateAuthUser({ isPublic }); // also update auth context user
        toast({
            title: "Privacy updated",
            description: `Your profile is now ${isPublic ? 'public' : 'private'}.`,
        });
    };

    const handleOpenSuggest = (type: 'offered' | 'wanted') => {
        setSkillListType(type);
        setIsSuggestingSkills(true);
    }
    
    const handleOpenAddSkill = (type: 'offered' | 'wanted') => {
        setSkillListType(type);
        setIsAddingSkill(true);
    }

    const handleAddSkill = (skillName: string, category: Skill['category']) => {
        const newSkill: Skill = {
            id: (Math.random() * 1000).toString(),
            name: skillName,
            category: category,
        };

        let updatedUser;
        if(skillListType === 'offered'){
            const skillsOffered = [...user.skillsOffered, newSkill];
            updatedUser = { ...user, skillsOffered };
            updateDataContextUser(user.id, { skillsOffered });
        } else {
            const skillsWanted = [...user.skillsWanted, newSkill];
            updatedUser = { ...user, skillsWanted };
            updateDataContextUser(user.id, { skillsWanted });
        }
        updateAuthUser(updatedUser);

        toast({
            title: "Skill Added!",
            description: `"${skillName}" has been added to your skills.`,
        });
    }

    const handleRemoveSkill = (skillId: string, type: 'offered' | 'wanted') => {
        let updatedUser;
        if(type === 'offered'){
            const skillsOffered = user.skillsOffered.filter(s => s.id !== skillId);
            updatedUser = { ...user, skillsOffered };
            updateDataContextUser(user.id, { skillsOffered });
        } else {
            const skillsWanted = user.skillsWanted.filter(s => s.id !== skillId);
            updatedUser = { ...user, skillsWanted };
            updateDataContextUser(user.id, { skillsWanted });
        }
        updateAuthUser(updatedUser);

        toast({
            title: "Skill Removed",
            variant: "destructive"
        });
    }
    
    const handleUpdateProfile = (updatedProfile: Partial<User>) => {
        updateDataContextUser(user.id, updatedProfile);
        updateAuthUser(updatedProfile);
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
        });
    }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-md">
        <div className="h-32 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500" />
        <CardContent className="p-4 relative">
          <div className="flex items-end gap-4 -mt-16">
            <Avatar className="h-28 w-28 border-4 border-background ring-2 ring-primary">
              <AvatarImage asChild>
                <Image src={user.avatarUrl!} alt={user.name} width={112} height={112} data-ai-hint="person portrait"/>
              </AvatarImage>
              <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="pb-2 flex-grow">
              <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
              <div className="flex items-center gap-4">
                {user.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                <UserRating userId={user.id} />
              </div>
            </div>
            <div className="flex items-center gap-2 self-end pb-2">
                <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                    <Pen className="mr-2 h-4 w-4"/>Edit Profile
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <SkillsList title="Skills I Offer" skills={user.skillsOffered} onAdd={() => handleOpenAddSkill('offered')} onSuggest={() => handleOpenSuggest('offered')} onRemove={(skillId) => handleRemoveSkill(skillId, 'offered')}/>
            <SkillsList title="Skills I Want" skills={user.skillsWanted} onAdd={() => handleOpenAddSkill('wanted')} onSuggest={() => handleOpenSuggest('wanted')} onRemove={(skillId) => handleRemoveSkill(skillId, 'wanted')}/>
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Profile Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="privacy-switch" className="flex flex-col space-y-1">
                            <span>Public Profile</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Allow others to find you.
                            </span>
                        </Label>
                        <Switch id="privacy-switch" checked={user.isPublic} onCheckedChange={handleTogglePrivacy} />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="font-headline">Availability</CardTitle></CardHeader>
                <CardContent className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5"/>
                    <p>{user.availability}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle className="font-headline">Interests</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground italic">"{user.interests}"</p>
                </CardContent>
            </Card>
        </div>
      </div>
      
      <SuggestSkillsDialog
        open={isSuggestingSkills}
        onOpenChange={setIsSuggestingSkills}
        existingSkills={skillListType === 'offered' ? user.skillsOffered.map(s => s.name) : user.skillsWanted.map(s => s.name)}
        onAddSkill={(skillName) => handleAddSkill(skillName, 'Other')}
      />

      <AddSkillDialog 
        open={isAddingSkill}
        onOpenChange={setIsAddingSkill}
        onAddSkill={handleAddSkill}
      />

      <EditProfileDialog
        open={isEditingProfile}
        onOpenChange={setIsEditingProfile}
        user={user}
        onSave={handleUpdateProfile}
      />
    </div>
  );
}
