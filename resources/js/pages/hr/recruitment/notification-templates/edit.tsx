import { PageTemplate } from '@/components/page-template';
import { usePage, router, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RichTextField } from '@/components/ui/rich-text-field';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Eye, Info, Mail, MessageSquare, Users } from 'lucide-react';
import { useState } from 'react';

export default function NotificationTemplateEdit() {
  const { t } = useTranslation();
  const { template, availablePlaceholders, statusOptions } = usePage().props as any;
  const [showPreview, setShowPreview] = useState(false);

  const isPendingApproval = template.type === 'whatsapp' && (template.approval_status === 'pending' || template.approval_status === 'rejected');

  const { data, setData, put, processing, errors } = useForm({
    name: template.name || '',
    subject: template.subject || '',
    body: template.body || '',
    is_active: template.is_active ?? true,
    status_key: template.status_key || 'none',
  });

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Recruitment') },
    { title: t('Notification Templates'), href: route('hr.recruitment.notification-templates.index') },
    { title: template.name },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('hr.recruitment.notification-templates.update', template.id));
  };

  const handlePreview = () => {
    router.post(route('hr.recruitment.notification-templates.preview', template.id), {}, {
      preserveState: true,
      onSuccess: (page: any) => {
        const previewData = page.props?.preview;
        if (previewData) {
          const previewWindow = window.open('', '_blank', 'width=800,height=600');
          if (previewWindow) {
            if (template.type === 'email') {
              previewWindow.document.write(previewData.body);
            } else {
              previewWindow.document.write(`<pre style="font-family: Arial; padding: 20px;">${previewData.body}</pre>`);
            }
            previewWindow.document.title = `Preview: ${template.name}`;
          }
        }
      }
    });
  };

  const insertPlaceholder = (placeholder: string) => {
    setData('body', data.body + `{{${placeholder}}}`);
  };

  return (
    <PageTemplate
      title={t('Edit Template')}
      breadcrumbs={breadcrumbs}
      actions={[
        {
          label: t('Back'),
          icon: <ArrowLeft className="h-4 w-4 mr-2" />,
          variant: 'outline',
          onClick: () => router.get(route('hr.recruitment.notification-templates.index'))
        },
      ]}
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {template.type === 'email' ? <Mail className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                  {template.type === 'email' ? t('Email Template') : t('WhatsApp Template')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPendingApproval && (
                  <Badge variant="warning" className="w-full justify-center py-1">
                    {template.approval_status === 'pending'
                      ? t('This template is currently pending approval from Twilio and cannot be edited.')
                      : t('This template was rejected by Twilio and cannot be edited.')}
                  </Badge>
                )}
                <div>
                  <Label>{t('Template Name')}</Label>
                  <Input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    disabled={isPendingApproval}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                {template.type === 'email' && (
                  <div>
                    <Label>{t('Email Subject')}</Label>
                    <Input
                      value={data.subject}
                      onChange={(e) => setData('subject', e.target.value)}
                      placeholder={t('Enter email subject with placeholders...')}
                      error={errors.subject}
                      disabled={isPendingApproval}
                    />
                    {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
                  </div>
                )}

                <div>
                  <Label>{t('Template Body')}</Label>
                  {template.type === 'email' ? (
                    <RichTextField
                      value={data.body}
                      onChange={(value) => setData('body', value)}
                      placeholder={t('Enter template body with placeholders...')}
                      error={errors.body}
                      disabled={isPendingApproval}
                    />
                  ) : (
                    <Textarea
                      value={data.body}
                      onChange={(e) => setData('body', e.target.value)}
                      rows={15}
                      placeholder={t('Enter template body with placeholders...')}
                      error={errors.body}
                      className="font-mono text-sm"
                      disabled={isPendingApproval}
                    />
                  )}
                  {errors.body && <p className="text-sm text-red-500 mt-1">{errors.body}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Candidate Status Mapping */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('Candidate Status Mapping')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <Label>{t('Trigger on Status')}</Label>
                  <Select
                    value={data.status_key}
                    onValueChange={(value) => setData('status_key', value)}
                    disabled={isPendingApproval}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('General (No specific status)')}</SelectItem>
                      {statusOptions && Object.entries(statusOptions).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label as string}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('This template will be sent when a candidate status changes to the selected value.')}
                  </p>
                  {errors.status_key && <p className="text-sm text-red-500 mt-1">{errors.status_key}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Placeholders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  {t('Available Placeholders')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availablePlaceholders?.map((placeholder: string) => (
                    <Badge
                      key={placeholder}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => insertPlaceholder(placeholder)}
                    >
                      {'{{'}{placeholder}{'}}'}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {t('Click a placeholder to insert it at the cursor position in the body field.')}
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t('Actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" className="w-full" disabled={processing || isPendingApproval}>
                  <Save className="h-4 w-4 mr-2" />
                  {t('Save Template')}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={handlePreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  {t('Preview')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </PageTemplate>
  );
}