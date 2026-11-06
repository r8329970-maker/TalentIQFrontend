'use client';

import { useState } from 'react';
import { User, Bell, Shield, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AvatarName } from '@/components/shared/avatar-name';
import { PageHeader } from '@/components/shared/page-elements';
import { mockRecruiter } from '@/lib/mock-data';
import { formatDate } from '@/lib/format';

export default function SettingsPage() {
  const [name, setName] = useState('Priya Sharma');
  const [email, setEmail] = useState(mockRecruiter.email);
  const [notifications, setNotifications] = useState({
    evaluations: true,
    uploads: true,
    jobs: false,
    weekly: true,
  });

  const handleSave = () => {
    toast.success('Settings saved');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your recruiter profile and notification preferences."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-muted-foreground" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <AvatarName name={name} size="lg" />
              <div>
                <p className="font-medium">{name}</p>
                <p className="text-sm text-muted-foreground">Recruiter</p>
                <p className="text-xs text-muted-foreground">Member since {formatDate(mockRecruiter.createdAt)}</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotifToggle
              label="Evaluation completions"
              desc="When candidate evaluations finish."
              checked={notifications.evaluations}
              onChange={(v) => setNotifications((n) => ({ ...n, evaluations: v }))}
            />
            <Separator />
            <NotifToggle
              label="Resume uploads"
              desc="When resume processing completes."
              checked={notifications.uploads}
              onChange={(v) => setNotifications((n) => ({ ...n, uploads: v }))}
            />
            <Separator />
            <NotifToggle
              label="Job status changes"
              desc="When jobs are activated or closed."
              checked={notifications.jobs}
              onChange={(v) => setNotifications((n) => ({ ...n, jobs: v }))}
            />
            <Separator />
            <NotifToggle
              label="Weekly summary"
              desc="A digest of your pipeline activity."
              checked={notifications.weekly}
              onChange={(v) => setNotifications((n) => ({ ...n, weekly: v }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Shield className="h-4 w-4" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sign out</p>
              <p className="text-xs text-muted-foreground">End your current session.</p>
            </div>
            <Button variant="outline" onClick={() => toast.info('Mock: signed out')}>
              Sign out
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Connected email</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> {mockRecruiter.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotifToggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
