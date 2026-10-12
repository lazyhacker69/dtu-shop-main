'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, Loader2, Save, Settings2, ShieldCheck, Store } from 'lucide-react';
import { toast } from 'sonner';

interface AdminSettings {
  storeName: string;
  supportEmail: string;
  currency: string;
  lowStockThreshold: number;
  allowRegistrations: boolean;
  maintenanceMode: boolean;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
}

const initialSettings: AdminSettings = {
  storeName: 'DTU Gift Shop',
  supportEmail: '',
  currency: 'INR',
  lowStockThreshold: 5,
  allowRegistrations: true,
  maintenanceMode: false,
  orderNotifications: true,
  lowStockAlerts: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load settings');
        setSettings({ ...initialSettings, ...data.settings });
      } catch (error: any) {
        toast.error(error.message || 'Could not load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const setField = <K extends keyof AdminSettings>(field: K, value: AdminSettings[K]) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save settings');
      setSettings({ ...initialSettings, ...data.settings });
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex min-h-[420px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>
            <p className="text-sm text-gray-600">Manage store preferences, access and admin notifications.</p>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && <span className="text-xs text-gray-500">Saved at {lastSaved}</span>}
            <Button onClick={saveSettings} disabled={saving} className="bg-red-700 hover:bg-red-800">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>

        {settings.maintenanceMode && (
          <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-amber-900">Maintenance mode is enabled</p>
              <p className="text-xs text-amber-700">The setting is active in admin configuration and can be used by the storefront to restrict public access.</p>
            </div>
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Attention</Badge>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-red-50 p-2 text-red-700"><Store className="h-5 w-5" /></div>
                <div>
                  <CardTitle>Store Information</CardTitle>
                  <CardDescription>Basic details used across the admin experience.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="storeName">Store name</Label>
                <Input id="storeName" value={settings.storeName} onChange={(e) => setField('storeName', e.target.value)} placeholder="DTU Gift Shop" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supportEmail">Support email</Label>
                <Input id="supportEmail" type="email" value={settings.supportEmail} onChange={(e) => setField('supportEmail', e.target.value)} placeholder="support@example.com" />
                <p className="text-xs text-gray-500">Used as the admin-facing support contact.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" value="INR (₹)" disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lowStockThreshold">Low stock threshold</Label>
                  <Input id="lowStockThreshold" type="number" min={0} value={settings.lowStockThreshold} onChange={(e) => setField('lowStockThreshold', Math.max(0, Number(e.target.value)))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-gray-100 p-2 text-gray-700"><Settings2 className="h-5 w-5" /></div>
                <div>
                  <CardTitle>System</CardTitle>
                  <CardDescription>Store availability controls.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <SettingToggle
                title="New registrations"
                description="Allow students to create new accounts."
                checked={settings.allowRegistrations}
                onCheckedChange={(checked) => setField('allowRegistrations', checked)}
              />
              <Separator />
              <SettingToggle
                title="Maintenance mode"
                description="Flag the storefront for maintenance."
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setField('maintenanceMode', checked)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-700"><Bell className="h-5 w-5" /></div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Choose which operational alerts admins should receive.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <SettingToggle
                title="Order notifications"
                description="Notify admins when new orders are placed."
                checked={settings.orderNotifications}
                onCheckedChange={(checked) => setField('orderNotifications', checked)}
              />
              <Separator />
              <SettingToggle
                title="Low stock alerts"
                description={`Alert when stock reaches ${settings.lowStockThreshold} units or below.`}
                checked={settings.lowStockAlerts}
                onCheckedChange={(checked) => setField('lowStockAlerts', checked)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-green-50 p-2 text-green-700"><ShieldCheck className="h-5 w-5" /></div>
                <div>
                  <CardTitle>Administration</CardTitle>
                  <CardDescription>Security and management information.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-gray-900">Admin-only access</p>
                    <p className="text-xs text-gray-500">Settings API is protected by admin authentication.</p>
                  </div>
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Protected</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-gray-900">Persistent configuration</p>
                    <p className="text-xs text-gray-500">Changes are stored in the application database.</p>
                  </div>
                  <Badge variant="outline">Database</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function SettingToggle({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="data-[state=checked]:bg-red-700" />
    </div>
  );
}
