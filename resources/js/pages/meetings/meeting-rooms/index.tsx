import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { Dialog } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import View from './view';
import { Plus, MapPin, Monitor, Users, DoorOpen, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function MeetingRooms() {
  const { t } = useTranslation();
  const { auth, meetingRooms, stats, filters: pageFilters = {}, globalSettings } = usePage().props as any;
  const permissions = auth?.permissions || [];
  
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [typeFilter, setTypeFilter] = useState(pageFilters.type || '_empty_');
  const [statusFilter, setStatusFilter] = useState(pageFilters.status || '_empty_');
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [viewingItem, setViewingItem] = useState<any>(null);
  
  const hasActiveFilters = () => {
    return typeFilter !== '_empty_' || statusFilter !== '_empty_' || searchTerm !== '';
  };
  
  const activeFilterCount = () => {
    return (typeFilter !== '_empty_' ? 1 : 0) + (statusFilter !== '_empty_' ? 1 : 0) + (searchTerm !== '' ? 1 : 0);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  const applyFilters = () => {
    router.get(route('meetings.meeting-rooms.index'), { 
      page: 1,
      search: searchTerm || undefined,
      type: typeFilter !== '_empty_' ? typeFilter : undefined,
      status: statusFilter !== '_empty_' ? statusFilter : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };
  
  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    
    router.get(route('meetings.meeting-rooms.index'), { 
      sort_field: field, 
      sort_direction: direction, 
      page: 1,
      search: searchTerm || undefined,
      type: typeFilter !== '_empty_' ? typeFilter : undefined,
      status: statusFilter !== '_empty_' ? statusFilter : undefined,
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
    // Convert equipment string to array if needed
    if (formData.equipment && typeof formData.equipment === 'string') {
      formData.equipment = formData.equipment.split(',').map((item: string) => item.trim()).filter(Boolean);
    }

    if (formMode === 'create') {
      if (!globalSettings?.is_demo) {
        toast.loading(t('Creating meeting room...'));
      }
      
      router.post(route('meetings.meeting-rooms.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (!globalSettings?.is_demo) {
            toast.dismiss();
          }
          if (page.props.flash.success) {
            toast.success(t(page.props.flash.success));
          } else if (page.props.flash.error) {
            toast.error(t(page.props.flash.error));
          }
        },
        onError: (errors) => {
          if (!globalSettings?.is_demo) {
            toast.dismiss();
          }
          if (typeof errors === 'string') {
            toast.error(errors);
          } else {
            toast.error(`Failed to create meeting room: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    } else if (formMode === 'edit') {
      if (!globalSettings?.is_demo) {
        toast.loading(t('Updating meeting room...'));
      }
      
      router.put(route('meetings.meeting-rooms.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (!globalSettings?.is_demo) {
            toast.dismiss();
          }
          if (page.props.flash.success) {
            toast.success(t(page.props.flash.success));
          } else if (page.props.flash.error) {
            toast.error(t(page.props.flash.error));
          }
        },
        onError: (errors) => {
          if (!globalSettings?.is_demo) {
            toast.dismiss();
          }
          if (typeof errors === 'string') {
            toast.error(errors);
          } else {
            toast.error(`Failed to update meeting room: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    }
  };
  
  const handleDeleteConfirm = () => {
    if (!globalSettings?.is_demo) {
      toast.loading(t('Deleting meeting room...'));
    }
    
    router.delete(route('meetings.meeting-rooms.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        if (!globalSettings?.is_demo) {
          toast.dismiss();
        }
        if (page.props.flash.success) {
          toast.success(t(page.props.flash.success));
        } else if (page.props.flash.error) {
          toast.error(t(page.props.flash.error));
        }
      },
      onError: (errors) => {
        if (!globalSettings?.is_demo) {
          toast.dismiss();
        }
        if (typeof errors === 'string') {
          toast.error(errors);
        } else {
          toast.error(`Failed to delete meeting room: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };
  
  const handleToggleStatus = (meetingRoom: any) => {
    const newStatus = meetingRoom.status === 'active' ? 'inactive' : 'active';
    if (!globalSettings?.is_demo) {
      toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} meeting room...`);
    }
    
    router.put(route('meetings.meeting-rooms.toggle-status', meetingRoom.id), {}, {
      onSuccess: (page) => {
        if (!globalSettings?.is_demo) {
          toast.dismiss();
        }
        if (page.props.flash.success) {
          toast.success(t(page.props.flash.success));
        } else if (page.props.flash.error) {
          toast.error(t(page.props.flash.error));
        }
      },
      onError: (errors) => {
        if (!globalSettings?.is_demo) {
          toast.dismiss();
        }
        if (typeof errors === 'string') {
          toast.error(errors);
        } else {
          toast.error(`Failed to update meeting room status: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('_empty_');
    setStatusFilter('_empty_');
    setShowFilters(false);
    
    router.get(route('meetings.meeting-rooms.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const pageActions = [];
  
  if (hasPermission(permissions, 'create-meeting-rooms')) {
    pageActions.push({
      label: t('Add Meeting Room'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Meetings')},
    { title: t('Meeting Rooms') }
  ];

  const columns = [
    { 
      key: 'name', 
      label: t('Name'), 
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            row.type === 'Physical' ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            {row.type === 'Physical' ? (
              <MapPin className={`h-4 w-4 ${
                row.type === 'Physical' ? 'text-green-700' : 'text-blue-700'
              }`} />
            ) : (
              <Monitor className={`h-4 w-4 ${
                row.type === 'Physical' ? 'text-green-700' : 'text-blue-700'
              }`} />
            )}
          </div>
          <div>
            <div className="font-bold text-gray-900">{value}</div>
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
              row.type === 'Physical' 
                ? 'bg-green-50 text-green-700 ring-green-600/20' 
                : 'bg-blue-50 text-blue-700 ring-blue-600/20'
            }`}>
              {row.type}
            </span>
          </div>
        </div>
      )
    },
    { 
      key: 'location', 
      label: t('Location'),
      render: (value, row) => {
        if (row.type === 'Virtual') {
          return row.booking_url ? (
            <a href={row.booking_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
              {t('Join Link')}
            </a>
          ) : '-';
        }
        return value || '-';
      }
    },
    { 
      key: 'capacity', 
      label: t('Capacity'),
      render: (value) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-500" />
          <span>{value}</span>
        </div>
      )
    },
    { 
      key: 'equipment', 
      label: t('Equipment'),
      render: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) return '-';
        return (
          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
            🔧 {value.length} {value.length === 1 ? 'item' : 'items'}
          </span>
        );
      }
    },
    { 
      key: 'meetings_count', 
      label: t('Meetings'),
      render: (value) => (
        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
          {value || 0}
        </span>
      )
    },
    { 
      key: 'status', 
      label: t('Status'),
      render: (value: string, row: any) => {
        if (!hasPermission(permissions, 'edit-meeting-rooms')) {
          return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
              value === 'active'
                ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
            }`}>
              {value === 'active' ? t('Active') : t('Inactive')}
            </span>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={value === 'active'}
              onCheckedChange={() => handleToggleStatus(row)}
            />
            <span className="text-xs text-gray-600">
              {value === 'active' ? t('Active') : t('Inactive')}
            </span>
          </div>
        );
      }
    }
  ];

  const actions = [
    { 
      label: t('View'), 
      icon: 'Eye', 
      action: 'view', 
      className: 'text-blue-500',
      requiredPermission: 'view-meeting-rooms'
    },
    { 
      label: t('Edit'), 
      icon: 'Edit', 
      action: 'edit', 
      className: 'text-amber-500',
      requiredPermission: 'edit-meeting-rooms'
    },
    { 
      label: t('Delete'), 
      icon: 'Trash2', 
      action: 'delete', 
      className: 'text-red-500',
      requiredPermission: 'delete-meeting-rooms'
    }
  ];

  const typeOptions = [
    { value: '_empty_', label: t('All Types') , disabled: true },
    { value: 'Physical', label: t('Physical') },
    { value: 'Virtual', label: t('Virtual') }
  ];

  const statusOptions = [
    { value: '_empty_', label: t('All Statuses') , disabled: true },
    { value: 'active', label: t('Active') },
    { value: 'inactive', label: t('Inactive') }
  ];

  return (
    <PageTemplate 
      title={t("Meeting Rooms")} 
      url="/meetings/meeting-rooms"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('Total Rooms')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DoorOpen className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('Active Rooms')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.active || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DoorOpen className="h-6 w-6 text-green-700" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('Physical Rooms')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.physical || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="h-6 w-6 text-green-700" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('Virtual Rooms')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.virtual || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Monitor className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[
            {
              name: 'type',
              label: t('Type'),
              type: 'select',
              value: typeFilter,
              onChange: setTypeFilter,
              options: typeOptions
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              value: statusFilter,
              onChange: setStatusFilter,
              options: statusOptions
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
            router.get(route('meetings.meeting-rooms.index'), { 
              page: 1, 
              per_page: parseInt(value),
              search: searchTerm || undefined,
              type: typeFilter !== '_empty_' ? typeFilter : undefined,
              status: statusFilter !== '_empty_' ? statusFilter : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        {meetingRooms?.data && meetingRooms.data.length > 0 ? (
          <>
            <CrudTable
              columns={columns}
              actions={actions}
              data={meetingRooms.data}
              from={meetingRooms.from || 1}
              onAction={handleAction}
              sortField={pageFilters.sort_field}
              sortDirection={pageFilters.sort_direction}
              onSort={handleSort}
              permissions={permissions}
              entityPermissions={{
                view: 'view-meeting-rooms',
                create: 'create-meeting-rooms',
                edit: 'edit-meeting-rooms',
                delete: 'delete-meeting-rooms'
              }}
            />

            <Pagination
              from={meetingRooms.from || 0}
              to={meetingRooms.to || 0}
              total={meetingRooms.total || 0}
              links={meetingRooms.links}
              entityName={t("meeting rooms")}
              onPageChange={(url) => router.get(url)}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <DoorOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('No meeting rooms found')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('Get started by adding your first meeting room')}
            </p>
            {hasPermission(permissions, 'create-meeting-rooms') && (
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                {t('Add Meeting Room')}
              </button>
            )}
          </div>
        )}
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { 
              name: 'name', 
              label: t('Room Name'), 
              type: 'text', 
              required: true 
            },
            { 
              name: 'description', 
              label: t('Description'), 
              type: 'textarea' 
            },
            { 
              name: 'type', 
              label: t('Type'), 
              type: 'select', 
              required: true,
              options: typeOptions.filter(opt => opt.value !== '_empty_')
            },
            { 
              name: 'capacity', 
              label: t('Capacity'), 
              type: 'number', 
              required: true,
              min: 1,
              helpText: t('Maximum number of participants')
            },
            { 
              name: 'location', 
              label: t('Location'), 
              type: 'text',
              required: true,
              helpText: t('Physical location for this room'),
              conditional: (mode, formData) => formData.type === 'Physical'
            },
            { 
              name: 'booking_url', 
              label: t('Booking URL'), 
              type: 'text',
              required: true,
              helpText: t('Meeting link for virtual rooms'),
              conditional: (mode, formData) => formData.type === 'Virtual'
            },
            { 
              name: 'equipment', 
              label: t('Equipment'), 
              type: 'text',
              helpText: t('Comma-separated list of available equipment')
            },
            { 
              name: 'status', 
              label: t('Status'), 
              type: 'select', 
              required: true,
              options: statusOptions.filter(opt => opt.value !== '_empty_')
            }
          ],
          modalSize: 'lg'
        }}
        initialData={currentItem ? {
          ...currentItem,
          equipment: currentItem.equipment ? currentItem.equipment.join(', ') : ''
        } : null}
        title={
          formMode === 'create'
            ? t('Add New Meeting Room')
            : t('Edit Meeting Room')
        }
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.name || ''}
        entityName="meeting room"
      />
      {/* View Modal */}
      <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
        {viewingItem && <View meetingRoom={viewingItem} />}
      </Dialog>
    </PageTemplate>
  );
}