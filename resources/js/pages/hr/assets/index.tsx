import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { Plus, BarChart, QrCode, UserPlus, ArrowDownLeft, Wrench, FileDown, FileUp } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import MediaPicker from '@/components/MediaPicker';
import { ImportModal } from '@/components/ImportModal';

export default function Assets() {
  const { t } = useTranslation();
  const { auth, assets, assetTypes, locations, employees, globalSettings, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];
  
  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedAssetType, setSelectedAssetType] = useState(pageFilters.asset_type_id || '');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || '');
  const [selectedCondition, setSelectedCondition] = useState(pageFilters.condition || '');
  const [selectedLocation, setSelectedLocation] = useState(pageFilters.location || '');
  const [purchaseDateFrom, setPurchaseDateFrom] = useState(pageFilters.purchase_date_from || '');
  const [purchaseDateTo, setPurchaseDateTo] = useState(pageFilters.purchase_date_to || '');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  
  // Check if any filters are active
  const hasActiveFilters = () => {
    return selectedAssetType !== '' || 
           selectedStatus !== '' ||
           selectedCondition !== '' ||
           selectedLocation !== '' ||
           purchaseDateFrom !== '' || 
           purchaseDateTo !== '' || 
           searchTerm !== '';
  };
  
  // Count active filters
  const activeFilterCount = () => {
    return (selectedAssetType !== '' ? 1 : 0) + 
           (selectedStatus !== '' ? 1 : 0) +
           (selectedCondition !== '' ? 1 : 0) +
           (selectedLocation !== '' ? 1 : 0) +
           (purchaseDateFrom !== '' ? 1 : 0) + 
           (purchaseDateTo !== '' ? 1 : 0) + 
           (searchTerm !== '' ? 1 : 0);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  const handleViewDashboard = () => {
    router.get(route('hr.assets.dashboard'));
  };
  
  const handleViewDepreciationReport = () => {
    router.get(route('hr.assets.depreciation-report'));
  };
  
  const applyFilters = () => {
    router.get(route('hr.assets.index'), { 
      page: 1,
      search: searchTerm || undefined,
      asset_type_id: selectedAssetType || undefined,
      status: selectedStatus || undefined,
      condition: selectedCondition || undefined,
      location: selectedLocation || undefined,
      purchase_date_from: purchaseDateFrom || undefined,
      purchase_date_to: purchaseDateTo || undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };
  
  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    
    router.get(route('hr.assets.index'), { 
      sort_field: field, 
      sort_direction: direction, 
      page: 1,
      search: searchTerm || undefined,
      asset_type_id: selectedAssetType || undefined,
      status: selectedStatus || undefined,
      condition: selectedCondition || undefined,
      location: selectedLocation || undefined,
      purchase_date_from: purchaseDateFrom || undefined,
      purchase_date_to: purchaseDateTo || undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };
  
  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);
    
    switch (action) {
      case 'view':
        router.get(route('hr.assets.show', item.id));
        break;
      case 'edit':
        setFormMode('edit');
        setIsFormModalOpen(true);
        break;
      case 'delete':
        setIsDeleteModalOpen(true);
        break;
      case 'assign':
        setIsAssignModalOpen(true);
        break;
      case 'return':
        setIsReturnModalOpen(true);
        break;
      case 'maintenance':
        setIsMaintenanceModalOpen(true);
        break;

      case 'download-document':
        window.open(route('hr.assets.download-document', item.id), '_blank');
        break;
    }
  };
  
  const handleAddNew = () => {
    setCurrentItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };
  
  const handleFormSubmit = (formData: any) => {
    const data = { ...formData };
    if (data.depreciation_method === 'none') {
      data.depreciation_method = null;
    }
    
    if (formMode === 'create') {
      if (!globalSettings?.is_demo) toast.loading(t('Creating asset...'));

      router.post(route('hr.assets.store'), data, {
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
            toast.error(t(errors));
          } else {
            toast.error(t('Failed to create asset: {{errors}}', { errors: Object.values(errors).join(', ') }));
          }
        }
      });
    } else if (formMode === 'edit') {
      if (!globalSettings?.is_demo) toast.loading(t('Updating asset...'));
      
      router.put(route('hr.assets.update', currentItem.id), data, {
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
            toast.error(t(errors));
          } else {
            toast.error(t('Failed to update asset: {{errors}}', { errors: Object.values(errors).join(', ') }));
          }
        }
      });
    }
  };
  
  const handleAssignSubmit = (formData: any) => {
    if (!globalSettings?.is_demo) toast.loading(t('Assigning asset...'));
    
    router.post(route('hr.assets.assign', currentItem.id), formData, {
      onSuccess: (page) => {
        setIsAssignModalOpen(false);
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
          toast.error(t(errors));
        } else {
          toast.error(t('Failed to assign asset: {{errors}}', { errors: Object.values(errors).join(', ') }));
        }
      }
    });
  };
  
  const handleReturnSubmit = (formData: any) => {
    if (!globalSettings?.is_demo) toast.loading(t('Returning asset...'));
    
    router.post(route('hr.assets.return', currentItem.id), formData, {
      onSuccess: (page) => {
        setIsReturnModalOpen(false);
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
          toast.error(t(errors));
        } else {
          toast.error(t('Failed to return asset: {{errors}}', { errors: Object.values(errors).join(', ') }));
        }
      }
    });
  };
  
  const handleMaintenanceSubmit = (formData: any) => {
    if (!globalSettings?.is_demo) toast.loading(t('Scheduling maintenance...'));
    
    router.post(route('hr.assets.schedule-maintenance', currentItem.id), formData, {
      onSuccess: (page) => {
        setIsMaintenanceModalOpen(false);
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
          toast.error(t(errors));
        } else {
          toast.error(t('Failed to schedule maintenance: {{errors}}', { errors: Object.values(errors).join(', ') }));
        }
      }
    });
  };
  
  const handleDeleteConfirm = () => {
    if (!globalSettings?.is_demo) toast.loading(t('Deleting asset...'));
    
    router.delete(route('hr.assets.destroy', currentItem.id), {
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
          toast.error(t(errors));
        } else {
          toast.error(t('Failed to delete asset: {{errors}}', { errors: Object.values(errors).join(', ') }));
        }
      }
    });
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedAssetType('');
    setSelectedStatus('');
    setSelectedCondition('');
    setSelectedLocation('');
    setPurchaseDateFrom('');
    setPurchaseDateTo('');
    setShowFilters(false);
    
    router.get(route('hr.assets.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleExport = async () => {
    try {
      const response = await fetch(route('hr.assets.export'), {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(t(data.message || 'Failed to export assets'));
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error(t('Failed to export assets'));
    }
  };

  // Define page actions
  const pageActions = [];
  
  // Add Export button
  if (hasPermission(permissions, 'export-assets')) {
    pageActions.push({
      label: t('Export'),
      icon: <FileDown className="h-4 w-4 mr-2" />,
      variant: 'outline',
      onClick: handleExport
    });
  }

  // Add Import button
  if (hasPermission(permissions, 'import-assets')) {
    pageActions.push({
      label: t('Import'),
      icon: <FileUp className="h-4 w-4 mr-2" />,
      variant: 'outline',
      onClick: () => setIsImportModalOpen(true)
    });
  }
  
  // Add the "Dashboard" button
  pageActions.push({
    label: t('Dashboard'),
    icon: <BarChart className="h-4 w-4 mr-2" />,
    variant: 'outline',
    onClick: handleViewDashboard
  });
  
  // Add the "Depreciation Report" button
  pageActions.push({
    label: t('Depreciation Report'),
    icon: <BarChart className="h-4 w-4 mr-2" />,
    variant: 'outline',
    onClick: handleViewDepreciationReport
  });
  
  // Add the "Add New Asset" button if user has permission
  if (hasPermission(permissions, 'create-assets')) {
    pageActions.push({
      label: t('Add Asset'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Asset Management') },
    { title: t('Assets') }
  ];

  // Define table columns
  const columns = [
    { 
      key: 'name', 
      label: t('Name'),
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{row.asset_type?.name || '-'}</div>
        </div>
      )
    },
    { 
      key: 'asset_code', 
      label: t('Asset Code'),
      render: (value, row) => (
        <div>
          <div>{value || '-'}</div>
          <div className="text-xs text-gray-500">{row.serial_number || '-'}</div>
        </div>
      )
    },
    { 
      key: 'status', 
      label: t('Status'),
      render: (value) => {
        const statusClasses = {
          'available': 'bg-green-50 text-green-700 ring-green-600/20',
          'assigned': 'bg-blue-50 text-blue-700 ring-blue-600/20',
          'under_maintenance': 'bg-amber-50 text-amber-700 ring-amber-600/20',
          'disposed': 'bg-red-50 text-red-700 ring-red-600/20'
        };
        
        const statusLabels = {
          'available': t('Available'),
          'assigned': t('Assigned'),
          'under_maintenance': t('Under Maintenance'),
          'disposed': t('Disposed')
        };
        
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusClasses[value] || ''}`}>
            {statusLabels[value] || value}
          </span>
        );
      }
    },
    { 
      key: 'assigned_to', 
      label: t('Assigned To'),
      render: (_, row) => {
        if (row.status !== 'assigned' || !row.current_assignment?.employee) {
          return '-';
        }
        
        return (
          <div>
            <div className="font-medium">{row.current_assignment.employee.name}</div>
            <div className="text-xs text-gray-500">{row.current_assignment.employee.employee_id}</div>
          </div>
        );
      }
    },
    { 
      key: 'purchase_date', 
      label: t('Purchase Date'),
      sortable: true,
      render: (value) => value ? (window.appSettings?.formatDateTimeSimple(value,false) || new Date(value).toLocaleString()) : '-'
    },
    { 
      key: 'purchase_cost', 
      label: t('Purchase Cost'),
      sortable: true,
      render: (value) => value ? window.appSettings.formatCurrency(value): '-'
    },
    { 
      key: 'location', 
      label: t('Location'),
      render: (value) => value || '-'
    }
  ];

  // Define table actions
  const actions = [
    { 
      label: t('View'), 
      icon: 'Eye', 
      action: 'view', 
      className: 'text-blue-500',
      requiredPermission: 'view-assets'
    },
    { 
      label: t('Edit'), 
      icon: 'Edit', 
      action: 'edit', 
      className: 'text-amber-500',
      requiredPermission: 'edit-assets'
    },
    { 
      label: t('Assign'), 
      icon: 'UserPlus', 
      action: 'assign', 
      className: 'text-green-500',
      requiredPermission: 'assign-assets',
      showWhen: (item) => item.status === 'available'
    },
    { 
      label: t('Return'), 
      icon: 'ArrowDownLeft', 
      action: 'return', 
      className: 'text-purple-500',
      requiredPermission: 'assign-assets',
      showWhen: (item) => item.status === 'assigned'
    },
    { 
      label: t('Maintenance'), 
      icon: 'Wrench', 
      action: 'maintenance', 
      className: 'text-indigo-500',
      requiredPermission: 'manage-asset-maintenance',
      showWhen: (item) => item.status !== 'disposed'
    },

    { 
      label: t('Delete'), 
      icon: 'Trash2', 
      action: 'delete', 
      className: 'text-red-500',
      requiredPermission: 'delete-assets',
      showWhen: (item) => item.status !== 'assigned'
    }
  ];

  // Prepare asset type options for filter
  const assetTypeOptions = [
    { value: '_none_', label: t('All Types') },
    ...(assetTypes || []).map((type: any) => ({
      value: type.id.toString(),
      label: type.name
    }))
  ];

  // Prepare status options for filter
  const statusOptions = [
    { value: '_none_', label: t('All Statuses') },
    { value: 'available', label: t('Available') },
    { value: 'assigned', label: t('Assigned') },
    { value: 'under_maintenance', label: t('Under Maintenance') },
    { value: 'disposed', label: t('Disposed') }
  ];

  // Prepare condition options for filter
  const conditionOptions = [
    { value: '_none_', label: t('All Conditions') },
    { value: 'new', label: t('New') },
    { value: 'good', label: t('Good') },
    { value: 'fair', label: t('Fair') },
    { value: 'poor', label: t('Poor') }
  ];

  // Prepare location options for filter
  const locationOptions = [
    { value: '_none_', label: t('All Locations') },
    ...(locations || []).map((location: string) => ({
      value: location,
      label: location
    }))
  ];

  return (
    <PageTemplate 
      title={t("Assets")} 
      url="/hr/assets"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      {/* Search and filters section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[
            {
              name: 'asset_type_id',
              label: t('Asset Type'),
              type: 'select',
              value: selectedAssetType,
              onChange: setSelectedAssetType,
              options: assetTypeOptions
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              value: selectedStatus,
              onChange: setSelectedStatus,
              options: statusOptions
            },
            {
              name: 'condition',
              label: t('Condition'),
              type: 'select',
              value: selectedCondition,
              onChange: setSelectedCondition,
              options: conditionOptions
            },
            {
              name: 'location',
              label: t('Location'),
              type: 'select',
              value: selectedLocation,
              onChange: setSelectedLocation,
              options: locationOptions
            },
            {
              name: 'purchase_date_from',
              label: t('Purchase Date From'),
              type: 'date',
              value: purchaseDateFrom,
              onChange: setPurchaseDateFrom
            },
            {
              name: 'purchase_date_to',
              label: t('Purchase Date To'),
              type: 'date',
              value: purchaseDateTo,
              onChange: setPurchaseDateTo
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          onResetFilters={handleResetFilters}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('hr.assets.index'), { 
              page: 1, 
              per_page: parseInt(value),
              search: searchTerm || undefined,
              asset_type_id: selectedAssetType || undefined,
              status: selectedStatus || undefined,
              condition: selectedCondition || undefined,
              location: selectedLocation || undefined,
              purchase_date_from: purchaseDateFrom || undefined,
              purchase_date_to: purchaseDateTo || undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      {/* Content section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={assets?.data || []}
          from={assets?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-assets',
            create: 'create-assets',
            edit: 'edit-assets',
            delete: 'delete-assets'
          }}
        />

        {/* Pagination section */}
        <Pagination
          from={assets?.from || 0}
          to={assets?.to || 0}
          total={assets?.total || 0}
          links={assets?.links}
          entityName={t("assets")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      {/* Form Modal */}
      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { 
              name: 'name', 
              label: t('Name'), 
              type: 'text',
              required: true,
              placeholder: t('e.g. MacBook Pro 14"')
            },
            { 
              name: 'asset_type_id', 
              label: t('Asset Type'), 
              type: 'select',
              required: true,
              placeholder: t('Select Asset Type'),
              options: assetTypeOptions.filter(opt => opt.value !== '_none_')
            },
            { 
              name: 'serial_number', 
              label: t('Serial Number'), 
              type: 'text',
              required: true,
              placeholder: t('e.g. SN-2024-001234')
            },
            { 
              name: 'asset_code', 
              label: t('Asset Code'), 
              type: 'text',
              required: true,
              placeholder: t('e.g. AST-001')
            },
            { 
              name: 'purchase_date', 
              label: t('Purchase Date'), 
              type: 'date',
              required: true,
              placeholder: t('Select Purchase Date')
            },
            { 
              name: 'purchase_cost', 
              label: t('Purchase Cost'), 
              type: 'number',
              required: true,
              min: 0,
              step: 0.01,
              placeholder: t('e.g. 1500.00')
            },
            { 
              name: 'status', 
              label: t('Status'), 
              type: 'select',
              required: true,
              placeholder: t('Select Status'),
              options: [
                { value: 'available', label: t('Available') },
                { value: 'assigned', label: t('Assigned') },
                { value: 'under_maintenance', label: t('Under Maintenance') },
                { value: 'disposed', label: t('Disposed') }
              ]
            },
            { 
              name: 'condition', 
              label: t('Condition'), 
              type: 'select',
              required: true,
              placeholder: t('Select Condition'),
              options: [
                { value: 'new', label: t('New') },
                { value: 'good', label: t('Good') },
                { value: 'fair', label: t('Fair') },
                { value: 'poor', label: t('Poor') }
              ]
            },
            { 
              name: 'description', 
              label: t('Description'), 
              type: 'textarea',
              placeholder: t('e.g. Additional details about the asset...')
            },
            { 
              name: 'location', 
              label: t('Location'), 
              type: 'text',
              required: true,
              placeholder: t('e.g. Head Office - Floor 2')
            },
            { 
              name: 'supplier', 
              label: t('Supplier'), 
              type: 'text',
              placeholder: t('e.g. Dell Technologies')
            },
            { 
              name: 'warranty_info', 
              label: t('Warranty Information'), 
              type: 'text',
              placeholder: t('e.g. 2 Year On-site Warranty')
            },
            { 
              name: 'warranty_expiry_date', 
              label: t('Warranty Expiry Date'), 
              type: 'date',
              placeholder: t('Select Warranty Expiry Date')
            },
            { 
              name: 'images', 
              label: t('Images'), 
              type: 'custom',
              render: (field, formData, handleChange) => (
                <MediaPicker
                  value={String(formData[field.name] || '')}
                  onChange={(url) => handleChange(field.name, url)}
                  placeholder={t('Select image file...')}
                />
              ),
              helpText: t('Upload image file (max 5MB)')
            },
            { 
              name: 'documents', 
              label: t('Documents'), 
              type: 'custom',
              render: (field, formData, handleChange) => (
                <MediaPicker
                  value={String(formData[field.name] || '')}
                  onChange={(url) => handleChange(field.name, url)}
                  placeholder={t('Select document file...')}
                />
              ),
              helpText: t('Upload PDF or Word document (max 5MB)')
            },
            { 
              name: 'depreciation_method', 
              label: t('Depreciation Method'), 
              type: 'select',
              placeholder: t('Select Depreciation Method'),
              options: [
                { value: 'none', label: t('No Depreciation') },
                { value: 'straight_line', label: t('Straight Line') },
                { value: 'reducing_balance', label: t('Reducing Balance') }
              ],
              showWhen: (formData) => formData.purchase_cost && formData.purchase_date
            },
            { 
              name: 'useful_life_years', 
              label: t('Useful Life (Years)'), 
              type: 'number',
              min: 1,
              step: 1,
              defaultValue: 5,
              placeholder: t('e.g. 5'),
              showWhen: (formData) => formData.depreciation_method && formData.depreciation_method !== 'none'
            },
            { 
              name: 'salvage_value', 
              label: t('Salvage Value'), 
              type: 'number',
              min: 0,
              step: 0.01,
              placeholder: t('e.g. 200.00'),
              showWhen: (formData) => formData.depreciation_method && formData.depreciation_method !== 'none'
            }
          ],
          modalSize: 'lg'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Asset')
            : formMode === 'edit'
              ? t('Edit Asset')
              : t('View Asset')
        }
        mode={formMode}
      />

      {/* Assign Modal */}
      <CrudFormModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleAssignSubmit}
        formConfig={{
          fields: [
            { 
              name: 'employee_id', 
              label: t('Employee'), 
              type: 'select',
              required: true,
              placeholder: t('Select Employee'),
              options: (employees || []).map((emp: any) => ({
                value: emp.id.toString(),
                label: `${emp.name} (${emp.employee_id})`
              }))
            },
            { 
              name: 'checkout_date', 
              label: t('Checkout Date'), 
              type: 'date',
              required: true,
              placeholder: t('Select Checkout Date'),
              defaultValue: new Date().toISOString().split('T')[0]
            },
            { 
              name: 'expected_return_date', 
              label: t('Expected Return Date'), 
              type: 'date',
              required: true,
              placeholder: t('Select Expected Return Date')
            },
            { 
              name: 'checkout_condition', 
              label: t('Checkout Condition'), 
              type: 'select',
              required: true,
              placeholder: t('Select Condition'),
              options: [
                { value: 'new', label: t('New') },
                { value: 'good', label: t('Good') },
                { value: 'fair', label: t('Fair') },
                { value: 'poor', label: t('Poor') }
              ],
              defaultValue: currentItem?.condition
            },
            { 
              name: 'notes', 
              label: t('Notes'), 
              type: 'textarea',
              placeholder: t('e.g. Assigned for project use until end of quarter...')
            }
          ],
          modalSize: 'md'
        }}
        initialData={{}}
        title={t('Assign Asset')}
        mode="create"
      />

      {/* Return Modal */}
      <CrudFormModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSubmit={handleReturnSubmit}
        formConfig={{
          fields: [
            { 
              name: 'checkin_date', 
              label: t('Check-in Date'), 
              type: 'date',
              required: true,
              placeholder: t('Select Check-in Date'),
              defaultValue: new Date().toISOString().split('T')[0]
            },
            { 
              name: 'checkin_condition', 
              label: t('Check-in Condition'), 
              type: 'select',
              required: true,
              placeholder: t('Select Condition'),
              options: [
                { value: 'new', label: t('New') },
                { value: 'good', label: t('Good') },
                { value: 'fair', label: t('Fair') },
                { value: 'poor', label: t('Poor') }
              ],
              defaultValue: currentItem?.condition
            },
            { 
              name: 'notes', 
              label: t('Notes'), 
              type: 'textarea',
              placeholder: t('e.g. Returned in good condition, minor scratches on lid...')
            }
          ],
          modalSize: 'md'
        }}
        initialData={{}}
        title={t('Return Asset')}
        mode="create"
      />

      {/* Maintenance Modal */}
      <CrudFormModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onSubmit={handleMaintenanceSubmit}
        formConfig={{
          fields: [
            { 
              name: 'maintenance_type', 
              label: t('Maintenance Type'), 
              type: 'select',
              required: true,
              placeholder: t('Select Maintenance Type'),
              options: [
                { value: 'repair', label: t('Repair') },
                { value: 'preventive', label: t('Preventive') },
                { value: 'calibration', label: t('Calibration') },
                { value: 'software update', label: t('Software Update') },
                { value: 'hardware upgrade', label: t('Hardware Upgrade') }
              ]
            },
            { 
              name: 'start_date', 
              label: t('Start Date'), 
              type: 'date',
              required: true,
              placeholder: t('Select Start Date'),
              defaultValue: new Date().toISOString().split('T')[0]
            },
            { 
              name: 'end_date', 
              label: t('End Date'), 
              type: 'date',
              required: true,
              placeholder: t('Select End Date')
            },
            { 
              name: 'cost', 
              label: t('Cost'), 
              type: 'number',
              required: true,
              min: 0,
              step: 0.01,
              placeholder: t('e.g. 250.00')
            },
            { 
              name: 'details', 
              label: t('Details'), 
              type: 'textarea',
              required: true,
              placeholder: t('e.g. Replace battery and clean internal components...')
            },
            { 
              name: 'supplier', 
              label: t('Supplier'), 
              type: 'text',
              placeholder: t('e.g. TechFix Services Ltd.')
            }
          ],
          modalSize: 'md'
        }}
        initialData={{}}
        title={t('Schedule Maintenance')}
        mode="create"
      />



      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.name || ''}
        entityName="asset"
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title={t('Import Assets from CSV/Excel')}
        importRoute="hr.assets.import"
        parseRoute="hr.assets.parse"
        sampleRoute="hr.assets.download.template"
        importNotes={t('Ensure that the values entered for Asset Type, status, condition & depreciation method match the existing records in your system.')}
        modalSize="xl"
        databaseFields={[
          { key: 'name', required: true },
          { key: 'asset_type', required: true },
          { key: 'serial_number' },
          { key: 'asset_code' },
          { key: 'purchase_date' },
          { key: 'purchase_cost' },
          { key: 'status' },
          { key: 'condition' },
          { key: 'description' },
          { key: 'location' },
          { key: 'supplier' },
          { key: 'warranty_info' },
          { key: 'warranty_expiry_date' }
        ]}
      />
    </PageTemplate>
  );
}