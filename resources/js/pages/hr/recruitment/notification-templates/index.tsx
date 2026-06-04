import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Mail, MessageSquare, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function NotificationTemplateIndex() {
  const { t } = useTranslation();
  const { templates, filters, statusOptions } = usePage().props as any;
  const [search, setSearch] = useState(filters.search || '');
  const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
  const [statusFilter, setStatusFilter] = useState(filters.status_key || 'all');

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Recruitment') },
    { title: t('Notification Templates') },
  ];

  const handleFilterChange = () => {
    router.get(route('hr.recruitment.notification-templates.index'), {
      search,
      type: typeFilter === 'all' ? '' : typeFilter,
      status_key: statusFilter === 'all' ? '' : statusFilter,
    }, { preserveState: true, replace: true });
  };

  const handleToggleStatus = (template: any) => {
    if (confirm(t('Are you sure you want to toggle this template status?'))) {
      router.put(route('hr.recruitment.notification-templates.toggle-status', template.id));
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />;
  };

  const getStatusLabel = (statusKey: string | null) => {
    if (!statusKey) return t('General');
    return statusOptions?.[statusKey] || statusKey;
  };

  return (
    <PageTemplate
      title={t('Notification Templates')}
      breadcrumbs={breadcrumbs}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('Manage Notification Templates')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={t('Search templates...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setTimeout(handleFilterChange, 100); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('All Types')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Types')}</SelectItem>
                <SelectItem value="email">{t('Email')}</SelectItem>
                <SelectItem value="whatsapp">{t('WhatsApp')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setTimeout(handleFilterChange, 100); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('All Statuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Statuses')}</SelectItem>
                {statusOptions && Object.entries(statusOptions).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleFilterChange}>
              <Search className="h-4 w-4 mr-2" />
              {t('Search')}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Name')}</TableHead>
                <TableHead>{t('Type')}</TableHead>
                <TableHead>{t('Candidate Status')}</TableHead>
                <TableHead>{t('Status')}</TableHead>
                <TableHead>{t('Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.data?.map((template: any) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(template.type)}
                      <span className="capitalize">{template.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getStatusLabel(template.status_key)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? 'success' : 'secondary'}>
                      {template.is_active ? t('Active') : t('Inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link
                        href={route('hr.recruitment.notification-templates.edit', template.id)}
                        className="inline-flex items-center"
                      >
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          {t('Edit')}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(template)}
                      >
                        {template.is_active ? (
                          <ToggleLeft className="h-4 w-4 mr-1" />
                        ) : (
                          <ToggleRight className="h-4 w-4 mr-1" />
                        )}
                        {template.is_active ? t('Disable') : t('Enable')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!templates.data || templates.data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    {t('No notification templates found.')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}