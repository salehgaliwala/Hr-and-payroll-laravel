import { PageTemplate } from '@/components/page-template';
import { usePage, router, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Send, Mail, MessageSquare, Settings } from 'lucide-react';
import { useState } from 'react';

export default function NotificationSettings() {
  const { t } = useTranslation();
  const { settings } = usePage().props as any;

  const { data, setData, post, processing, errors } = useForm({
    email_notification_enabled: settings.email_notification_enabled === '1' || settings.email_notification_enabled === true,
    whatsapp_notification_enabled: settings.whatsapp_notification_enabled === '1' || settings.whatsapp_notification_enabled === true,
    twilio_sid: settings.twilio_sid || '',
    twilio_auth_token: settings.twilio_auth_token || '',
    twilio_whatsapp_from: settings.twilio_whatsapp_from || '',
  });

  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Recruitment') },
    { title: t('Notification Settings') },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.recruitment.notification-settings.update'));
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setTestingEmail(true);
    router.post(route('hr.recruitment.notification-settings.test-email'), { email: testEmail }, {
      preserveState: true,
      onFinish: () => setTestingEmail(false),
    });
  };

  const handleTestWhatsApp = async () => {
    if (!testPhone) return;
    setTestingWhatsApp(true);
    router.post(route('hr.recruitment.notification-settings.test-whatsapp'), { phone: testPhone }, {
      preserveState: true,
      onFinish: () => setTestingWhatsApp(false),
    });
  };

  return (
    <PageTemplate
      title={t('Notification Settings')}
      breadcrumbs={breadcrumbs}
    >
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            {t('General')}
          </TabsTrigger>
          <TabsTrigger value="twilio">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('WhatsApp (Twilio)')}
          </TabsTrigger>
          <TabsTrigger value="test">
            <Send className="h-4 w-4 mr-2" />
            {t('Test Delivery')}
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSave}>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>{t('General Notification Settings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">{t('Email Notifications')}</Label>
                    <p className="text-sm text-gray-500">{t('Enable or disable all email notifications to candidates')}</p>
                  </div>
                  <Switch
                    checked={data.email_notification_enabled}
                    onCheckedChange={(v) => setData('email_notification_enabled', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">{t('WhatsApp Notifications')}</Label>
                    <p className="text-sm text-gray-500">{t('Enable or disable all WhatsApp notifications to candidates')}</p>
                  </div>
                  <Switch
                    checked={data.whatsapp_notification_enabled}
                    onCheckedChange={(v) => setData('whatsapp_notification_enabled', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="twilio">
            <Card>
              <CardHeader>
                <CardTitle>{t('Twilio WhatsApp Configuration')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('Twilio Account SID')}</Label>
                  <Input
                    value={data.twilio_sid}
                    onChange={(e) => setData('twilio_sid', e.target.value)}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div>
                  <Label>{t('Twilio Auth Token')}</Label>
                  <Input
                    type="password"
                    value={data.twilio_auth_token}
                    onChange={(e) => setData('twilio_auth_token', e.target.value)}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div>
                  <Label>{t('WhatsApp Sender Number')}</Label>
                  <Input
                    value={data.twilio_whatsapp_from}
                    onChange={(e) => setData('twilio_whatsapp_from', e.target.value)}
                    placeholder="+14155238886 (Twilio WhatsApp sandbox number)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('Must be a Twilio WhatsApp-enabled phone number in E.164 format')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {t('Test Email')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('Send test email to')}</Label>
                    <Input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={testingEmail || !testEmail}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {testingEmail ? t('Sending...') : t('Send Test Email')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {t('Test WhatsApp')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('Send test WhatsApp to')}</Label>
                    <Input
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleTestWhatsApp}
                    disabled={testingWhatsApp || !testPhone}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {testingWhatsApp ? t('Sending...') : t('Send Test WhatsApp')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Save Button (always visible) */}
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4 mr-2" />
              {t('Save Settings')}
            </Button>
          </div>
        </form>
      </Tabs>
    </PageTemplate>
  );
}