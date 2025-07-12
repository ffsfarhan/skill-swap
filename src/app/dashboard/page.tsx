'use client';

import { useState } from 'react';
import Image from 'next/image';
import { currentUser } from '@/lib/mock-data';
import type { Skill } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Pen, PlusCircle, Wand2, MapPin, Calendar, X } from 'lucide-react';
import { SuggestSkillsDialog } from '@/components/suggest-skills-dialog';
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

const SkillBadge = ({ skill }: { skill: Skill }) => {
  const Icon = skillIcons[skill.category] || OtherIcon;
  return (
    <Badge variant="outline" className="py-2 px-3 text-sm flex items-center gap-2 transition-colors hover:bg-accent/20">
      <Icon className="h-4 w-4 text-primary" />
      <span>{skill.name}</span>
      <button className="ml-2 opacity-50 hover:opacity-100"><X className="h-3 w-3"/></button>
    </Badge>
  );
};

const SkillsList = ({ title, skills, onAdd, onSuggest }: { title: string; skills: Skill[]; onAdd: () => void; onSuggest: () => void;}) => (
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
            {skills.map(skill => <SkillBadge key={skill.id} skill={skill} />)}
            <Button variant="outline" className="border-dashed" onClick={onAdd}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
            </Button>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const [user, setUser] = useState(currentUser);
    const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
    const [suggestionType, setSuggestionType] = useState<'offered' | 'wanted'>('offered');
    
    const handleTogglePrivacy = (isPublic: boolean) => {
        setUser(prev => ({...prev, isPublic}));
    };

    const handleOpenSuggest = (type: 'offered' | 'wanted') => {
        setSuggestionType(type);
        setIsSuggestingSkills(true);
    }
    
    const handleAddSkill = (skillName: string) => {
        const newSkill: Skill = {
            id: (Math.random() * 1000).toString(),
            name: skillName,
            category: 'Other',
        };
        if(suggestionType === 'offered'){
            setUser(prev => ({...prev, skillsOffered: [...prev.skillsOffered, newSkill]}));
        } else {
            setUser(prev => ({...prev, skillsWanted: [...prev.skillsWanted, newSkill]}));
        }
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
              {user.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 self-end pb-2">
                <Button variant="outline"><Pen className="mr-2 h-4 w-4"/>Edit Profile</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <SkillsList title="Skills I Offer" skills={user.skillsOffered} onAdd={() => {}} onSuggest={() => handleOpenSuggest('offered')} />
            <SkillsList title="Skills I Want" skills={user.skillsWanted} onAdd={() => {}} onSuggest={() => handleOpenSuggest('wanted')} />
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
        existingSkills={suggestionType === 'offered' ? user.skillsOffered.map(s => s.name) : user.skillsWanted.map(s => s.name)}
        onAddSkill={handleAddSkill}
      />
    </div>
  );
}
