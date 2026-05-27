// pages/hr/attendance-policies/index.tsx
import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus, Clock, DollarSign, Shield, Users, Eye, Edit, Trash2, Lock, CheckCircle } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import View from './view';

export default function AttendancePolicies() {
  const { t } = useTranslation();
  const { auth, attendancePolicies, stats, filters: pageFilters = {}, globalSettings } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [viewingItem, setViewingItem] = useState<any>(null);

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedStatus !== 'all';
  };

  // Count active filters
  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('hr.attendance-policies.index'), {
      page: 1,
      search: searchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('hr.attendance-policies.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);

    switch (action) {
      case 'view':
        setViewingItem(item);
        break;
      case 'edit':
        setFormMode('edit');
        setIsFormModalOpen(true);
        break;
      case 'delete':
        setIsDeleteModalOpen(true);
        break;
      case 'toggle-status':
        handleToggleStatus(item);
        break;
    }
  };

  const handleAddNew = () => {
    setCurrentItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (formData: any) => {
    if (formMode === 'create') {
      if (!globalSettings?.is_demo) toast.loading(t('Creating attendance policy...'));

      router.post(route('hr.attendance-policies.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (!globalSettings?.is_demo) toast.dismiss();
          if (page.props.flash.success) {
            toast.success(t(page.props.flash.success));
          } else if (page.props.flash.error) {
            toast.error(t(page.props.flash.error));
          }
        },
        onError: (errors) => {
          if (!globalSettings?.is_demo) toast.dismiss();
          if (typeof errors === 'string') {
            toast.error(errors);
          } else {
            toast.error(`Failed to create attendance policy: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    } else if (formMode === 'edit') {
      if (!globalSettings?.is_demo) toast.loading(t('Updating attendance policy...'));

      router.put(route('hr.attendance-policies.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (!globalSettings?.is_demo) toast.dismiss();
          if (page.props.flash.success) {
            toast.success(t(page.props.flash.success));
          } else if (page.props.flash.error) {
            toast.error(t(page.props.flash.error));
          }
        },
        onError: (errors) => {
          if (!globalSettings?.is_demo) toast.dismiss();
          if (typeof errors === 'string') {
            toast.error(errors);
          } else {
            toast.error(`Failed to update attendance policy: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!globalSettings?.is_demo) toast.loading(t('Deleting attendance policy...'));

    router.delete(route('hr.attendance-policies.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        if (!globalSettings?.is_demo) toast.dismiss();
        if (page.props.flash.success) {
          toast.success(t(page.props.flash.success));
        } else if (page.props.flash.error) {
          toast.error(t(page.props.flash.error));
        }
      },
      onError: (errors) => {
        if (!globalSettings?.is_demo) toast.dismiss();
        if (typeof errors === 'string') {
          toast.error(errors);
        } else {
          toast.error(`Failed to delete attendance policy: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleToggleStatus = (policy: any) => {
    const newStatus = policy.status === 'active' ? 'inactive' : 'active';
    if (!globalSettings?.is_demo) toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} attendance policy...`);

    router.put(route('hr.attendance-policies.toggle-status', policy.id), {}, {
      onSuccess: (page) => {
        if (!globalSettings?.is_demo) toast.dismiss();
        if (page.props.flash.success) {
          toast.success(t(page.props.flash.success));
        } else if (page.props.flash.error) {
          toast.error(t(page.props.flash.error));
        }
      },
      onError: (errors) => {
        if (!globalSettings?.is_demo) toast.dismiss();
        if (typeof errors === 'string') {
          toast.error(errors);
        } else {
          toast.error(`Failed to update attendance policy status: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setShowFilters(false);

    router.get(route('hr.attendance-policies.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  // Define page actions
  const pageActions = [];

  // Add the "Add New Attendance Policy" button if user has permission
  if (hasPermission(permissions, 'create-attendance-policies')) {
    pageActions.push({
      label: t('Add Attendance Policy'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Attendance') },
    { title: t('Attendance Policies') }
  ];

  // Define table columns
  const columns = [
    {
      key: 'name',
      label: t('Policy Name'),
      sortable: true
    },
    {
      key: 'late_arrival_grace',
      label: t('Late Grace (mins)'),
      render: (value: number) => (
        <span className="font-mono text-orange-600">{value}</span>
      )
    },
    {
      key: 'early_departure_grace',
      label: t('Early Grace (mins)'),
      render: (value: number) => (
        <span className="font-mono text-blue-600">{value}</span>
      )
    },
    {
      key: 'overtime_rate_per_hour',
      label: t('Overtime Rate'),
      render: (value: number) => (
        <span className="font-mono text-green-600">{window.appSettings?.formatCurrency(value)}/hr</span>
      )
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value === 'active'
            ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
            : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
            }`}>
            {value === 'active' ? t('Active') : t('Inactive')}
          </span>
        );
      }
    }
  ];

  // Define table actions
  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-attendance-policies'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-attendance-policies'
    },
    {
      label: t('Toggle Status'),
      icon: 'Lock',
      action: 'toggle-status',
      className: 'text-amber-500',
      requiredPermission: 'edit-attendance-policies'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-attendance-policies'
    }
  ];

  // Prepare options for filters
  const statusOptions = [
    { value: 'all', label: t('All Statuses') , disabled : true},
    { value: 'active', label: t('Active') },
    { value: 'inactive', label: t('Inactive') }
  ];



  // Render policy card
  const renderPolicyCard = (policy: any) => {
    return (
      <Card key={policy.id} className="group hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {policy.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${policy.status === 'active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                    {policy.status === 'active' ? t('Active') : t('Inactive')}
                  </span>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              {hasPermission(permissions, 'view-attendance-policies') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleAction('view', policy)}
                  className="h-8 w-8 p-0 text-blue-500"
                  title={t('View Policy')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {hasPermission(permissions, 'edit-attendance-policies') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleAction('edit', policy)}
                  className="h-8 w-8 p-0 text-amber-500"
                  title={t('Edit Policy')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {hasPermission(permissions, 'edit-attendance-policies') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleAction('toggle-status', policy)}
                  className={`h-8 w-8 p-0 text-amber-500 ${
                    policy.status === 'active' 
                      ? 'hover:text-amber-600' 
                      : 'hover:text-green-600'
                  }`}
                  title={policy.status === 'active' ? t('Deactivate Policy') : t('Activate Policy')}
                >
                  <Lock className="h-4 w-4" />
                </Button>
              )}
              {hasPermission(permissions, 'delete-attendance-policies') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleAction('delete', policy)}
                  className="h-8 w-8 p-0 text-red-500"
                  title={t('Delete Policy')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {policy.late_arrival_grace} {t('minutes')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('Late Arrival Grace')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {policy.early_departure_grace} {t('minutes')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('Early Departure Grace')}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <DollarSign className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {window.appSettings?.formatCurrency(policy.overtime_rate_per_hour)}/hr
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('Overtime Rate')}</p>
                </div>
              </div>
            </div>
          </div>
          {policy.description && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{policy.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <PageTemplate
      title={t("Attendance Policies")}
      url="/hr/attendance-policies"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      {/* Search and filters section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-6 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              value: selectedStatus,
              onChange: setSelectedStatus,
              options: statusOptions
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          onResetFilters={handleResetFilters}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "9"}
          onPerPageChange={(value) => {
            router.get(route('hr.attendance-policies.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
          perPageOptions={[9, 27, 45, 90]}
        />
      </div>

      {/* Content section */}
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('Total Policies')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total || 0}</p>
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Shield className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('Active Policies')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.active || 0}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('Avg Late Grace')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.avg_late_grace || 0} {t('min')}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('Avg Overtime Rate')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {window.appSettings?.formatCurrency(stats?.avg_overtime_rate || 0)}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {attendancePolicies?.data?.map((policy: any) => renderPolicyCard(policy))}
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <Pagination
            from={attendancePolicies?.from || 0}
            to={attendancePolicies?.to || 0}
            total={attendancePolicies?.total || 0}
            links={attendancePolicies?.links}
            entityName={t("attendance policies")}
            onPageChange={(url) => {
              const page = new URL(url).searchParams.get('page') || '1';
              router.get(route('hr.attendance-policies.index'), {
                page,
                search: searchTerm || undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                sort_field: pageFilters.sort_field || undefined,
                sort_direction: pageFilters.sort_direction || undefined,
                per_page: pageFilters.per_page,
              }, { preserveState: true, preserveScroll: true });
            }}
          />
        </div>
      </div>

      {/* Form Modal */}
      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { name: 'name', label: t('Policy Name'), type: 'text', required: true, placeholder: t('e.g. Standard Attendance Policy') },
            { name: 'description', label: t('Description'), type: 'textarea', placeholder: t('e.g. Default attendance policy for all employees...') },
            { name: 'late_arrival_grace', label: t('Late Arrival Grace (minutes)'), type: 'number', required: true, min: 0, placeholder: t('e.g. 15'), defaultValue: 15 },
            { name: 'early_departure_grace', label: t('Early Departure Grace (minutes)'), type: 'number', required: true, min: 0, placeholder: t('e.g. 15'), defaultValue: 15 },
            { name: 'overtime_rate_per_hour', label: t('Overtime Rate Per Hour'), type: 'number', required: true, min: 0, step: 0.01, placeholder: t('e.g. 150.00'), defaultValue: 150 },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              required: true,
              placeholder: t('Select Status'),
              options: [
                { value: 'active', label: t('Active') },
                { value: 'inactive', label: t('Inactive') }
              ],
              defaultValue: 'active'
            }
          ],
          modalSize: 'lg'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Attendance Policy')
            : t('Edit Attendance Policy')
        }
        mode={formMode}
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.name || ''}
        entityName="attendance policy"
      />
      {/* View Modal */}
      <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
        {viewingItem && <View policy={viewingItem} />}
      </Dialog>
    </PageTemplate>
  );
}