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
import View from './view';
import { Plus, FileText, Download, Eye, AlertTriangle, Clock, CheckCircle, Package, Globe, Bell, MoreVertical, Edit, Trash2, RefreshCw, FileType, FileSpreadsheet, Presentation, FolderOpen, Calendar, User } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HrDocuments() {
  const { t } = useTranslation();
  const { auth, hrDocuments, categories, stats, filters: pageFilters = {}, errors, flash, globalSettings } = usePage().props as any;
  const permissions = auth?.permissions || [];
  
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [categoryFilter, setCategoryFilter] = useState(pageFilters.category_id || '_empty_');
  const [statusFilter, setStatusFilter] = useState(pageFilters.status || '_empty_');

  const [showFilters, setShowFilters] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [viewingItem, setViewingItem] = useState<any>(null);
  
  const hasActiveFilters = () => {
    return categoryFilter !== '_empty_' || statusFilter !== '_empty_' || searchTerm !== '';
  };
  
  const activeFilterCount = () => {
    return (categoryFilter !== '_empty_' ? 1 : 0) + (statusFilter !== '_empty_' ? 1 : 0) + (searchTerm !== '' ? 1 : 0);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  const applyFilters = () => {
    router.get(route('hr.documents.hr-documents.index'), { 
      page: 1,
      search: searchTerm || undefined,
      category_id: categoryFilter !== '_empty_' ? categoryFilter : undefined,
      status: statusFilter !== '_empty_' ? statusFilter : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };
  
  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    
    router.get(route('hr.documents.hr-documents.index'), { 
      sort_field: field, 
      sort_direction: direction, 
      page: 1,
      search: searchTerm || undefined,
      category_id: categoryFilter !== '_empty_' ? categoryFilter : undefined,
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
      case 'download':
        window.open(route('hr.documents.hr-documents.download', item.id), '_blank');
        break;
      case 'update-status':
        setIsStatusModalOpen(true);
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
      if (!globalSettings?.is_demo) { toast.loading(t('Uploading document...')); }

      router.post(route('hr.documents.hr-documents.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (!globalSettings?.is_demo) { toast.dismiss(); }
          if (page.props.flash.success) {
            toast.success(t(page.props.flash.success));
          } else if (page.props.flash.error) {
            toast.error(t(page.props.flash.error));
          }
        },
        onError: (errors) => {
          if (!globalSettings?.is_demo) { toast.dismiss(); }
          if (typeof errors === 'string') {
            toast.error(t(errors));
          } else {
            toast.error(t('Failed to upload document: {{errors}}', { errors: Object.values(errors).join(', ') }));
          }
        }
      });
    } else if (formMode === 'edit') {
      if (!globalSettings?.is_demo) { toast.loading(t('Updating document...')); }

      router.put(route('hr.documents.hr-documents.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (!globalSettings?.is_demo) { toast.dismiss(); }
          if (page.props.flash.success) {
            toast.success(t(page.props.flash.success));
          } else if (page.props.flash.error) {
            toast.error(t(page.props.flash.error));
          }
        },
        onError: (errors) => {
          if (!globalSettings?.is_demo) { toast.dismiss(); }
          if (typeof errors === 'string') {
            toast.error(t(errors));
          } else {
            toast.error(t('Failed to update document: {{errors}}', { errors: Object.values(errors).join(', ') }));
          }
        }
      });
    }
  };
  
  const handleDeleteConfirm = () => {
    if (!globalSettings?.is_demo) { toast.loading(t('Deleting document...')); }

    router.delete(route('hr.documents.hr-documents.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        if (!globalSettings?.is_demo) { toast.dismiss(); }
        if (page.props.flash.success) {
          toast.success(t(page.props.flash.success));
        } else if (page.props.flash.error) {
          toast.error(t(page.props.flash.error));
        }
      },
      onError: (errors) => {
        if (!globalSettings?.is_demo) { toast.dismiss(); }
        if (typeof errors === 'string') {
          toast.error(t(errors));
        } else {
          toast.error(t('Failed to delete document: {{errors}}', { errors: Object.values(errors).join(', ') }));
        }
      }
    });
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('_empty_');
    setStatusFilter('_empty_');
    setShowFilters(false);
    
    router.get(route('hr.documents.hr-documents.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };
  
  const handleStatusUpdate = (formData: any) => {
    if (!globalSettings?.is_demo) { toast.loading(t('Updating status...')); }

    router.put(route('hr.documents.hr-documents.update-status', currentItem.id), formData, {
      onSuccess: (page) => {
        setIsStatusModalOpen(false);
        if (!globalSettings?.is_demo) { toast.dismiss(); }
        if (page.props.flash.success) {
          toast.success(t(page.props.flash.success));
        } else if (page.props.flash.error) {
          toast.error(t(page.props.flash.error));
        }
      },
      onError: (errors) => {
        if (!globalSettings?.is_demo) { toast.dismiss(); }
        if (typeof errors === 'string') {
          toast.error(t(errors));
        } else {
          toast.error(t('Failed to update status: {{errors}}', { errors: Object.values(errors).join(', ') }));
        }
      }
    });
  };

  // Stats from controller — always based on all documents, never affected by filters
  const totalDocs        = stats?.total || 0;
  const publishedDocs    = stats?.published || 0;
  const expiringSoonDocs = stats?.expiring_soon || 0;
  const needsAckDocs     = stats?.needs_acknowledgment || 0;

  const pageActions = [];
  
  if (hasPermission(permissions, 'create-hr-documents')) {
    pageActions.push({
      label: t('Upload Document'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Document Management') },
    { title: t('HR Documents') }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-50 text-gray-600 ring-gray-500/10';
      case 'Under Review': return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20';
      case 'Approved': return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'Published': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'Archived': return 'bg-purple-50 text-purple-700 ring-purple-600/20';
      case 'Expired': return 'bg-red-50 text-red-700 ring-red-600/10';
      default: return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft': return <FileText className="h-3 w-3" />;
      case 'Under Review': return <Clock className="h-3 w-3" />;
      case 'Approved': return <CheckCircle className="h-3 w-3" />;
      case 'Published': return <Eye className="h-3 w-3" />;
      case 'Archived': return <FileText className="h-3 w-3" />;
      case 'Expired': return <AlertTriangle className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getFileTypeIcon = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileType className="h-8 w-8 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
      case 'ppt':
      case 'pptx':
        return <Presentation className="h-8 w-8 text-orange-600" />;
      case 'txt':
        return <FileText className="h-8 w-8 text-gray-600" />;
      default:
        return <FileText className="h-8 w-8 text-slate-600" />;
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry > today && expiry <= thirtyDaysFromNow;
  };

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };



  const formatFileSize = (bytes: number) => {
    if (bytes >= 1073741824) {
      return (bytes / 1073741824).toFixed(2) + ' GB';
    } else if (bytes >= 1048576) {
      return (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return bytes + ' bytes';
    }
  };

  const categoryOptions = [
    { value: '_empty_', label: t('All Categories') , disabled: true },
    ...(categories || []).map((cat: any) => ({
      value: cat.id.toString(),
      label: cat.name
    }))
  ];

  const statusOptions = [
    { value: '_empty_', label: t('All Statuses') , disabled: true },
    { value: 'Draft', label: t('Draft') },
    { value: 'Under Review', label: t('Under Review') },
    { value: 'Approved', label: t('Approved') },
    { value: 'Published', label: t('Published') },
    { value: 'Archived', label: t('Archived') },
    { value: 'Expired', label: t('Expired') }
  ];



  const categorySelectOptions = [
    { value: '_empty_', label: t('Select Category') },
    ...(categories || []).map((cat: any) => ({
      value: cat.id.toString(),
      label: cat.name
    }))
  ];

  return (
    <PageTemplate 
      title={t("HR Documents")} 
      url="/hr/documents/hr-documents"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Documents */}
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{t('Total Documents')}</p>
              <p className="text-3xl font-bold text-gray-900">{totalDocs}</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
              <Package className="h-7 w-7 text-slate-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-slate-600 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
          </div>
        </Card>

        {/* Published */}
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{t('Published')}</p>
              <p className="text-3xl font-bold text-gray-900">{publishedDocs}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <Globe className="h-7 w-7 text-blue-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: totalDocs > 0 ? `${Math.min((publishedDocs / totalDocs) * 100, 100)}%` : '0%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {totalDocs > 0 ? `${Math.round((publishedDocs / totalDocs) * 100)}% of total` : 'No documents'}
          </p>
        </Card>

        {/* Expiring Soon */}
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{t('Expiring Soon')}</p>
              <p className="text-3xl font-bold text-gray-900">{expiringSoonDocs}</p>
            </div>
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="h-7 w-7 text-amber-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-amber-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: totalDocs > 0 ? `${Math.min((expiringSoonDocs / totalDocs) * 100, 100)}%` : '0%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{t('Within 30 days')}</p>
        </Card>

        {/* Needs Acknowledgment */}
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{t('Needs Acknowledgment')}</p>
              <p className="text-3xl font-bold text-gray-900">{needsAckDocs}</p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
              <Bell className="h-7 w-7 text-red-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: totalDocs > 0 ? `${Math.min((needsAckDocs / totalDocs) * 100, 100)}%` : '0%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {totalDocs > 0 ? `${Math.round((needsAckDocs / totalDocs) * 100)}% of total` : 'No documents'}
          </p>
        </Card>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[
            {
              name: 'category_id',
              label: t('Category'),
              type: 'select',
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: categoryOptions,
              searchable: true
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              value: statusFilter,
              onChange: setStatusFilter,
              options: statusOptions
            },

          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          onResetFilters={handleResetFilters}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "9"}
          onPerPageChange={(value) => {
            router.get(route('hr.documents.hr-documents.index'), { 
              page: 1, 
              per_page: parseInt(value),
              search: searchTerm || undefined,
              category_id: categoryFilter !== '_empty_' ? categoryFilter : undefined,
              status: statusFilter !== '_empty_' ? statusFilter : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
          perPageOptions={[9, 27, 45, 90]}
        />
      </div>

      {/* Card Grid Layout */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        {hrDocuments?.data && hrDocuments.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {hrDocuments.data.map((document: any) => (
                <Card key={document.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.01] border border-gray-200 flex flex-col">
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="shrink-0">
                        {getFileTypeIcon(document.file_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2">{document.title}</h3>
                        <div className="flex items-center gap-2">
                          <span 
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: `${document.category?.color}15`,
                              color: document.category?.color || '#3B82F6'
                            }}
                          >
                            {document.category?.name || '-'}
                          </span>
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${getStatusColor(document.status)}`}>
                            {getStatusIcon(document.status)}
                            {t(document.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Warnings - Only show if applicable */}
                    {(document.requires_acknowledgment || isExpiringSoon(document.expiry_date) || (isExpired(document.expiry_date) && document.status !== 'Expired')) && (
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {document.requires_acknowledgment && (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>{t('Requires Acknowledgment')}</span>
                          </div>
                        )}
                        {isExpiringSoon(document.expiry_date) && !isExpired(document.expiry_date) && (
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{t('Expiring Soon')}</span>
                          </div>
                        )}
                        {isExpired(document.expiry_date) && document.status !== 'Expired' && (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>{t('Expired')}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dates */}
                    <div className="flex-1">
                      {(document.effective_date || document.expiry_date) && (
                        <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
                          {document.effective_date && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-medium text-gray-500">{t('Effective')}:</span>
                              <span>{window.appSettings?.formatDateTimeSimple(document.effective_date, false) || document.effective_date}</span>
                            </div>
                          )}
                          {document.expiry_date && (
                            <div className={`flex items-center gap-1.5 ${isExpired(document.expiry_date) ? 'text-red-600' : ''}`}>
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-medium text-gray-500">{t('Expires')}:</span>
                              <span>{window.appSettings?.formatDateTimeSimple(document.expiry_date, false) || document.expiry_date}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer - Always at bottom */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {document.uploader?.avatar ? (
                          <img 
                            src={document.uploader.avatar} 
                            alt={document.uploader.name} 
                            className="h-6 w-6 rounded-full object-cover ring-2 ring-gray-100"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-semibold ring-2 ring-gray-100">
                            {document.uploader?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <span className="truncate max-w-[100px]">{document.uploader?.name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {hasPermission(permissions, 'view-hr-documents') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction('view', document)}
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            title={t('View')}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                        {hasPermission(permissions, 'view-hr-documents') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction('download', document)}
                            className="h-8 w-8 p-0 hover:bg-green-50"
                            title={t('Download')}
                          >
                            <Download className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {(hasPermission(permissions, 'edit-hr-documents') || hasPermission(permissions, 'delete-hr-documents')) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100" title={t('More')}>
                                <MoreVertical className="h-4 w-4 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {hasPermission(permissions, 'edit-hr-documents') && (
                                <>
                                  <DropdownMenuItem onClick={() => handleAction('edit', document)}>
                                    <Edit className="h-4 w-4 mr-2 text-amber-500" />
                                    {t('Edit')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAction('update-status', document)}>
                                    <RefreshCw className="h-4 w-4 mr-2 text-purple-500" />
                                    {t('Update Status')}
                                  </DropdownMenuItem>
                                </>
                              )}
                              {hasPermission(permissions, 'delete-hr-documents') && (
                                <DropdownMenuItem onClick={() => handleAction('delete', document)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t('Delete')}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Pagination
              from={hrDocuments?.from || 0}
              to={hrDocuments?.to || 0}
              total={hrDocuments?.total || 0}
              links={hrDocuments?.links}
              entityName={t("documents")}
              onPageChange={(url) => router.get(url)}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('No documents found')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('Upload your first document to get started')}</p>
            {hasPermission(permissions, 'create-hr-documents') && (
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                {t('Upload Document')}
              </Button>
            )}
          </div>
        )}
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        errors={errors}
        formConfig={{
          fields: [
            // Basic Information Section
            { 
              name: '_section_basic', 
              label: t('Basic Information'), 
              type: 'section'
            },
            { 
              name: 'title', 
              label: t('Document Title'), 
              type: 'text', 
              required: true 
            },
            { 
              name: 'category_id', 
              label: t('Category'), 
              type: 'select', 
              required: true,
              options: categorySelectOptions.filter(opt => opt.value !== '_empty_'),
              searchable: true
            },
            { 
              name: 'description', 
              label: t('Description'), 
              type: 'textarea',
              rows: 3
            },
            // File Upload Section
            { 
              name: '_section_file', 
              label: t('File Upload'), 
              type: 'section'
            },
            { 
              name: 'file', 
              label: t('File'), 
              type: 'custom',
              required: formMode === 'create',
              render: (field, formData, handleChange) => (
                <div>
                  <MediaPicker
                    value={String(formData[field.name] || formData.file_path || '')}
                    onChange={(url) => handleChange(field.name, url)}
                    placeholder={t('Select document file...')}
                  />
                </div>
              ),
              helpText: t('Max file size: 10MB. Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT')
            },
            // Validity & Settings Section
            { 
              name: '_section_validity', 
              label: t('Validity & Settings'), 
              type: 'section'
            },
            { 
              name: 'effective_date', 
              label: t('Effective Date'), 
              type: 'date'
            },
            { 
              name: 'expiry_date', 
              label: t('Expiry Date'), 
              type: 'date'
            },
            { 
              name: 'requires_acknowledgment', 
              label: t('Requires Acknowledgment'), 
              type: 'checkbox',
              helpText: t('Users must acknowledge reading this document')
            }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem ? {
          ...currentItem,
          effective_date: currentItem.effective_date ? window.appSettings.formatDateTimeSimple(currentItem.effective_date, false) : currentItem.effective_date
        } : null}
        title={
          formMode === 'create'
            ? t('Upload New Document')
            : t('Edit Document')
        }
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.title || ''}
        entityName="document"
      />
      
      <CrudFormModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={handleStatusUpdate}
        formConfig={{
          fields: [
            {
              name: '_workflow_stepper',
              label: '',
              type: 'custom',
              render: () => {
                const getTimelineColor = (status: string) => {
                  switch (status) {
                    case 'Draft': return 'bg-gray-600';
                    case 'Under Review': return 'bg-yellow-600';
                    case 'Approved': return 'bg-green-600';
                    case 'Published': return 'bg-blue-600';
                    case 'Archived': return 'bg-purple-600';
                    case 'Expired': return 'bg-red-600';
                    default: return 'bg-gray-600';
                  }
                };
                
                const getTimelineTextColor = (status: string) => {
                  switch (status) {
                    case 'Draft': return 'text-gray-600';
                    case 'Under Review': return 'text-yellow-600';
                    case 'Approved': return 'text-green-600';
                    case 'Published': return 'text-blue-600';
                    case 'Archived': return 'text-purple-600';
                    case 'Expired': return 'text-red-600';
                    default: return 'text-gray-600';
                  }
                };
                
                return (
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      {['Draft', 'Under Review', 'Approved', 'Published', 'Archived', 'Expired'].map((status, index, array) => (
                        <div key={status} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              currentItem?.status === status 
                                ? `${getTimelineColor(status)} text-white` 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {status === 'Draft' && <FileText className="h-5 w-5" />}
                              {status === 'Under Review' && <Clock className="h-5 w-5" />}
                              {status === 'Approved' && <CheckCircle className="h-5 w-5" />}
                              {status === 'Published' && <Eye className="h-5 w-5" />}
                              {status === 'Archived' && <FileText className="h-5 w-5" />}
                              {status === 'Expired' && <AlertTriangle className="h-5 w-5" />}
                            </div>
                            <span className={`text-xs mt-2 text-center ${
                              currentItem?.status === status ? `font-semibold ${getTimelineTextColor(status)}` : 'text-gray-500'
                            }`}>
                              {t(status)}
                            </span>
                          </div>
                          {index < array.length - 1 && (
                            <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              required: true,
              options: [
                { value: 'Draft', label: t('Draft') },
                { value: 'Under Review', label: t('Under Review') },
                { value: 'Approved', label: t('Approved') },
                { value: 'Published', label: t('Published') },
                { value: 'Archived', label: t('Archived') },
                { value: 'Expired', label: t('Expired') }
              ]
            }
          ]
        }}
        initialData={{ status: currentItem?.status }}
        title={t('Update Document Status')}
        mode="edit"
        errors={errors}
      />
      {/* View Modal */}
      <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
        {viewingItem && <View document={viewingItem} />}
      </Dialog>
    </PageTemplate>
  );
}