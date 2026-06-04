import { PageTemplate } from '@/components/page-template';
import { usePage, router, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Trash2, Edit, Eye, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function WhatsappTemplateIndex() {
  const { t } = useTranslation();
  const { templates, filters, categories } = usePage().props as any;
  const [search, setSearch] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');

  // New template form
  const { data, setData, post, processing, errors, reset } = useForm({
    friendly_name: '',
    category: 'UTILITY',
    language: 'en',
    body_text: '',
    sample_data: [] as string[],
  });

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Recruitment') },
    { title: t('WhatsApp Templates') },
  ];

  // Extract placeholders from body_text and maintain sample_data array
  const extractPlaceholders = (text: string): number[] => {
    const matches = text.match(/\{\{(\d+)\}\}/g);
    if (!matches) return [];
    const numbers = matches.map(m => parseInt(m.replace(/\{|\}/g, '')));
    return [...new Set(numbers)].sort((a, b) => a - b);
  };

  const placeholders = extractPlaceholders(data.body_text);
  const maxPlaceholder = placeholders.length > 0 ? Math.max(...placeholders) : 0;

  const handleBodyChange = (value: string) => {
    setData('body_text', value);

    // Auto-expand sample_data array to match placeholders
    const newPlaceholders = extractPlaceholders(value);
    const maxP = newPlaceholders.length > 0 ? Math.max(...newPlaceholders) : 0;
    const newSampleData = [...data.sample_data];
    while (newSampleData.length < maxP) {
      newSampleData.push('');
    }
    setData('sample_data', newSampleData.slice(0, maxP));
  };

  const handleSampleDataChange = (index: number, value: string) => {
    const newData = [...data.sample_data];
    newData[index] = value;
    setData('sample_data', newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.recruitment.whatsapp-templates.store'), {
      onSuccess: () => reset(),
    });
  };

  const handleDelete = (template: any) => {
    if (confirm(t('Are you sure you want to delete this template?'))) {
      router.delete(route('hr.recruitment.whatsapp-templates.destroy', template.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return variants[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <PageTemplate
      title={t('WhatsApp Templates (Twilio Content API)')}
      breadcrumbs={breadcrumbs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t('Create New Template')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('Friendly Name')}</Label>
                <Input
                  value={data.friendly_name}
                  onChange={(e) => setData('friendly_name', e.target.value)}
                  placeholder="e.g., application_confirmation"
                  required
                />
                {errors.friendly_name && <p className="text-sm text-red-500 mt-1">{errors.friendly_name}</p>}
              </div>

              <div>
                <Label>{t('Category')}</Label>
                <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat: string) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label>{t('Language')}</Label>
                <Input
                  value={data.language}
                  onChange={(e) => setData('language', e.target.value)}
                  placeholder="en"
                />
                {errors.language && <p className="text-sm text-red-500 mt-1">{errors.language}</p>}
              </div>

              <div>
                <Label>{t('Body Text')}</Label>
                <Textarea
                  value={data.body_text}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  rows={6}
                  placeholder="Hi {{1}}, thank you for applying for {{2}}!"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('Use {{1}}, {{2}}, etc. for dynamic placeholders.')}
                </p>
                {errors.body_text && <p className="text-sm text-red-500 mt-1">{errors.body_text}</p>}
              </div>

              {/* Dynamic Sample Data Inputs */}
              {maxPlaceholder > 0 && (
                <div>
                  <Label>{t('Sample Data for Review')}</Label>
                  <div className="space-y-2 mt-1">
                    {Array.from({ length: maxPlaceholder }, (_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500 w-6">{'{{'}{i + 1}{'}}'}</span>
                        <Input
                          value={data.sample_data[i] || ''}
                          onChange={(e) => handleSampleDataChange(i, e.target.value)}
                          placeholder={`Sample value for {{${i + 1}}}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={processing}>
                <Plus className="h-4 w-4 mr-2" />
                {t('Create & Submit to Twilio')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Templates List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('Templates Dashboard')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder={t('Search templates...')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && router.get(route('hr.recruitment.whatsapp-templates.index'), { search, status: statusFilter })}
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => {
                  setStatusFilter(v);
                  router.get(route('hr.recruitment.whatsapp-templates.index'), { search, status: v });
                }}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={t('All Status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('All Status')}</SelectItem>
                    <SelectItem value="draft">{t('Draft')}</SelectItem>
                    <SelectItem value="pending">{t('Pending')}</SelectItem>
                    <SelectItem value="approved">{t('Approved')}</SelectItem>
                    <SelectItem value="rejected">{t('Rejected')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Name')}</TableHead>
                    <TableHead>{t('Category')}</TableHead>
                    <TableHead>{t('Language')}</TableHead>
                    <TableHead>{t('Status')}</TableHead>
                    <TableHead>{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.data?.map((template: any) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          {template.friendly_name}
                        </div>
                      </TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell>{template.language}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(template.status)}`}>
                          {t(template.status.charAt(0).toUpperCase() + template.status.slice(1))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {template.status === 'approved' && (
                            <Badge variant="outline" className="cursor-pointer">
                              {t('Send Test')}
                            </Badge>
                          )}
                          {template.status === 'pending' && (
                            <Badge variant="outline" className="opacity-50 cursor-not-allowed">
                              {t('Pending Approval')}
                            </Badge>
                          )}
                          {template.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(route('hr.recruitment.whatsapp-templates.preview', template.id), '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {template.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(template)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {template.rejection_reason && (
                            <span className="text-xs text-red-500" title={template.rejection_reason}>
                              {t('Rejected')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!templates.data || templates.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        {t('No WhatsApp templates found. Create your first template.')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}