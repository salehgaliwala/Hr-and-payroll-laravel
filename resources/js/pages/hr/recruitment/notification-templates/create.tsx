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
import { ArrowLeft, Save, Info, Mail, MessageSquare, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function NotificationTemplateCreate() {
  const { t } = useTranslation();
  const { availablePlaceholders, statusOptions, categories } = usePage().props as any;

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    type: 'email',
    purpose: '',
    subject: '',
    body: '',
    status_key: 'none',
    category: 'UTILITY',
    language: 'en',
    sample_data: [] as string[],
  });

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Recruitment') },
    { title: t('Notification Templates'), href: route('hr.recruitment.notification-templates.index') },
    { title: t('Add Template') },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.recruitment.notification-templates.store'));
  };

  const insertPlaceholder = (placeholder: string) => {
    setData('body', data.body + `{{${placeholder}}}`);
  };

  const insertWhatsappPlaceholder = (index: number) => {
    setData('body', data.body + `{{${index + 1}}}`);
  };

  // Sync sample data array with body placeholders for WhatsApp
  useEffect(() => {
    if (data.type === 'whatsapp') {
      const matches = data.body.match(/\{\{(\d+)\}\}/g) || [];
      const placeholderCount = matches.length;
      const uniqueIndices = Array.from(new Set(matches.map(m => parseInt(m.replace(/\{\{|\}\}/g, '')))));
      const maxIndex = uniqueIndices.length > 0 ? Math.max(...uniqueIndices) : 0;

      const newSampleData = [...data.sample_data];
      if (newSampleData.length < maxIndex) {
        for (let i = newSampleData.length; i < maxIndex; i++) {
          newSampleData[i] = '';
        }
        setData('sample_data', newSampleData);
      }
    }
  }, [data.body, data.type]);

  const handleSampleDataChange = (index: number, value: string) => {
    const newSampleData = [...data.sample_data];
    newSampleData[index] = value;
    setData('sample_data', newSampleData);
  };

  return (
    <PageTemplate
      title={t('Add Notification Template')}
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
                <CardTitle>{t('Template Details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('Template Name')}</Label>
                    <Input
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder={t('e.g., Interview Invitation')}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label>{t('Template Type')}</Label>
                    <Select
                      value={data.type}
                      onValueChange={(value: any) => setData('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">{t('Email')}</SelectItem>
                        <SelectItem value="whatsapp">{t('WhatsApp')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>{t('Purpose / Identifier')}</Label>
                  <Input
                    value={data.purpose}
                    onChange={(e) => setData('purpose', e.target.value)}
                    placeholder={t('e.g., interview_invite')}
                  />
                  {errors.purpose && <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>}
                </div>

                {data.type === 'whatsapp' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('WhatsApp Category')}</Label>
                      <Select
                        value={data.category}
                        onValueChange={(value) => setData('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((cat: string) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t('Language Code')}</Label>
                      <Input
                        value={data.language}
                        onChange={(e) => setData('language', e.target.value)}
                        placeholder="en"
                      />
                    </div>
                  </div>
                )}

                {data.type === 'email' && (
                  <div>
                    <Label>{t('Email Subject')}</Label>
                    <Input
                      value={data.subject}
                      onChange={(e) => setData('subject', e.target.value)}
                      placeholder={t('Enter email subject...')}
                    />
                    {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
                  </div>
                )}

                <div>
                  <Label>{t('Template Body')}</Label>
                  {data.type === 'email' ? (
                    <RichTextField
                      value={data.body}
                      onChange={(value) => setData('body', value)}
                      placeholder={t('Enter email body with {{placeholder}}...')}
                      error={errors.body}
                    />
                  ) : (
                    <Textarea
                      value={data.body}
                      onChange={(e) => setData('body', e.target.value)}
                      rows={12}
                      placeholder={t('Enter WhatsApp message with {{1}}, {{2}}...')}
                      className="font-mono text-sm"
                    />
                  )}
                  {errors.body && <p className="text-sm text-red-500 mt-1">{errors.body}</p>}
                </div>

                {data.type === 'whatsapp' && data.sample_data.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <Label className="text-sm font-semibold">{t('Placeholder Sample Data (Required for Twilio)')}</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data.sample_data.map((val, idx) => (
                        <div key={idx}>
                          <Label className="text-xs">{'{{'}{idx + 1}{'}}'}</Label>
                          <Input
                            size={1}
                            value={val}
                            onChange={(e) => handleSampleDataChange(idx, e.target.value)}
                            placeholder={t('Sample value')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  {data.type === 'email' ? (
                    availablePlaceholders?.map((placeholder: string) => (
                      <Badge
                        key={placeholder}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => insertPlaceholder(placeholder)}
                      >
                        {'{{'}{placeholder}{'}}'}
                      </Badge>
                    ))
                  ) : (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => insertWhatsappPlaceholder(i)}
                      >
                        {'{{'}{i + 1}{'}}'}
                      </Badge>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {data.type === 'email'
                    ? t('Click a placeholder to insert it into the body.')
                    : t('WhatsApp uses numbered placeholders. Use {{1}}, {{2}} etc.')}
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button type="submit" className="w-full" disabled={processing}>
                  <Save className="h-4 w-4 mr-2" />
                  {data.type === 'whatsapp' ? t('Submit for Approval') : t('Create Template')}
                </Button>
                {data.type === 'whatsapp' && (
                  <p className="text-[10px] text-center text-gray-500 italic">
                    {t('WhatsApp templates will be submitted to Twilio for approval and remain disabled until approved.')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </PageTemplate>
  );
}
