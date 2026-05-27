// pages/hr/assets/show.tsx
import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, QrCode, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { hasPermission } from '@/utils/authorization';
import { CrudFormModal } from '@/components/CrudFormModal';
import { toast } from '@/components/custom-toast';
import { Progress } from '@/components/ui/progress';

export default function AssetShow() {
  const { t } = useTranslation();
  const { auth, asset, employees, globalSettings } = usePage().props as any;
  const permissions = auth?.permissions || [];
  
  // State
  const [isUpdateMaintenanceModalOpen, setIsUpdateMaintenanceModalOpen] = useState(false);
  const [currentMaintenance, setCurrentMaintenance] = useState<any>(null);
  
  const handleBackToList = () => {
    router.get(route('hr.assets.index'));
  };
  
  const handleUpdateMaintenance = (maintenance: any) => {
    setCurrentMaintenance(maintenance);
    setIsUpdateMaintenanceModalOpen(true);
  };
  
  const handleDownloadQrCode = () => {
    window.open(route('hr.assets.download-qrcode', asset.id), '_blank');
  };
  
  const handleDownloadDocument = () => {
    window.open(route('hr.assets.download-document', asset.id), '_blank');
  };
  
  const handleViewImage = () => {
    window.open(route('hr.assets.view-image', asset.id), '_blank');
  };
  
  const handleUpdateMaintenanceSubmit = (formData: any) => {
    if (!globalSettings?.is_demo) toast.loading(t('Updating maintenance'));
    
    router.put(route('hr.assets.update-maintenance', currentMaintenance.id), formData, {
      onSuccess: (page) => {
        setIsUpdateMaintenanceModalOpen(false);
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
          toast.error(t('Failed to update maintenance {{errors}}', { errors: Object.values(errors).join(', ') }));
        }
      }
    });
  };
  
  // Define page actions
  const pageActions = [];
  
  // Add the "Back to List" button
  pageActions.push({
    label: t('Back'),
    icon: <ArrowLeft className="h-4 w-4 mr-2" />,
    variant: 'outline' as const,
    onClick: handleBackToList
  });
  
  if (asset.qr_code) {
    pageActions.push({
      label: t('QR Code'),
      icon: <QrCode className="h-4 w-4 mr-2" />,
      variant: 'outline' as const,
      onClick: handleDownloadQrCode
    });
  }
  
  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Asset Management') },
    { title: t('Assets'), href: route('hr.assets.index') },
    { title: asset.name }
  ];
  
  // Status colors for badges
  const statusColors = {
    'available': 'bg-green-50 text-green-700 ring-green-600/20',
    'assigned': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'under_maintenance': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'disposed': 'bg-red-50 text-red-700 ring-red-600/20'
  };
  
  // Status labels
  const statusLabels = {
    'available': t('Available'),
    'assigned': t('Assigned'),
    'under_maintenance': t('Under Maintenance'),
    'disposed': t('Disposed')
  };
  
  // Condition colors for badges
  const conditionColors = {
    'new': 'bg-green-50 text-green-700 ring-green-600/20',
    'good': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'fair': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'poor': 'bg-red-50 text-red-700 ring-red-600/20'
  };
  
  // Maintenance status colors
  const maintenanceStatusColors = {
    'scheduled': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'in_progress': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'completed': 'bg-green-50 text-green-700 ring-green-600/20',
    'cancelled': 'bg-red-50 text-red-700 ring-red-600/20'
  };
  
  // Calculate depreciation percentage
  const calculateDepreciationPercentage = () => {
    if (!asset.purchase_cost || asset.purchase_cost === 0 || !asset.depreciation) return 0;
    return ((asset.purchase_cost - asset.depreciation.current_value) / asset.purchase_cost) * 100;
  };
  
  return (
    <PageTemplate 
      title={asset.name} 
      url={`/hr/assets/${asset.id}`}
      actions={pageActions}
      breadcrumbs={breadcrumbs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Details */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{asset.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {asset.asset_type?.name || t('Unknown Type')}
                  </CardDescription>
                </div>
                <div>
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ${statusColors[asset.status] || ''}`}>
                    {statusLabels[asset.status] || asset.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Asset Code')}</h3>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{asset.asset_code || '-'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Serial Number')}</h3>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{asset.serial_number || '-'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Purchase Date')}</h3>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{asset.purchase_date ? (window.appSettings?.formatDateTimeSimple(asset.purchase_date, false) || new Date(asset.purchase_date).toLocaleDateString()) : '-'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Purchase Cost')}</h3>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{window.appSettings?.formatCurrency(asset.purchase_cost) || '-'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Condition')}</h3>
                  <p className="mt-1">
                    {asset.condition ? (
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${conditionColors[asset.condition] || ''}`}>
                        {asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1)}
                      </span>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Location')}</h3>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{asset.location || '-'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Supplier')}</h3>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{asset.supplier || '-'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Warranty')}</h3>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                    {asset.warranty_info || '-'}
                    {asset.warranty_expiry_date && (
                      <span className="block text-xs text-gray-600 dark:text-gray-400">
                        {t('Expires')}: {window.appSettings?.formatDateTimeSimple(asset.warranty_expiry_date, false) || format(new Date(asset.warranty_expiry_date), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              {asset.description && (
                <div className="mt-4">
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide">{t('Description')}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{asset.description}</p>
                </div>
              )}

              {/* Image & Document Preview */}
              {(asset.image_url || asset.document_url) && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {asset.image_url && (
                      <div>
                        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-2">{t('Image')}</h3>
                        <a href={asset.image_url} target="_blank" className="group block relative overflow-hidden rounded-lg border bg-gray-50 hover:border-primary transition-colors h-48">
                          <img
                            src={asset.image_url}
                            alt={asset.name}
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x200?text=Image+Not+Found'; }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                            <Eye className="h-6 w-6 text-white" />
                          </div>
                        </a>
                      </div>
                    )}
                    {asset.document_url && (
                      <div>
                        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-2">{t('Document')}</h3>
                        <a href={asset.document_url} target="_blank" className="group block relative overflow-hidden rounded-lg border bg-gray-50 hover:border-primary transition-colors h-48">
                          <iframe
                            src={asset.document_url}
                            title={t('Asset Document')}
                            className="w-full h-full pointer-events-none"
                            scrolling="no"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                            <Eye className="h-6 w-6 text-white" />
                          </div>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Tabs for different sections */}
          <Tabs defaultValue="assignments" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="assignments">{t('Assignments')}</TabsTrigger>
              <TabsTrigger value="maintenance">{t('Maintenance')}</TabsTrigger>
              <TabsTrigger value="depreciation">{t('Depreciation')}</TabsTrigger>
            </TabsList>
            
            {/* Assignments Tab */}
            <TabsContent value="assignments">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Assignment History')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {asset.assignments && asset.assignments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('Employee')}</TableHead>
                          <TableHead>{t('Check-Out Date')}</TableHead>
                          <TableHead>{t('Return Date')}</TableHead>
                          <TableHead>{t('Status')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {asset.assignments.map((assignment: any) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">
                              {assignment.employee?.name || '-'}
                            </TableCell>
                            <TableCell>
                              {window.appSettings?.formatDateTimeSimple(assignment.checkout_date, false) || format(new Date(assignment.checkout_date), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              {assignment.checkin_date 
                                ? (window.appSettings?.formatDateTimeSimple(assignment.checkin_date, false) || format(new Date(assignment.checkin_date), 'MMM dd, yyyy')) 
                                : assignment.expected_return_date 
                                  ? `${t('Expected')} ${window.appSettings?.formatDateTimeSimple(assignment.expected_return_date, false) || format(new Date(assignment.expected_return_date), 'MMM dd, yyyy')}` 
                                  : '-'}
                            </TableCell>
                            <TableCell>
                              {assignment.checkin_date 
                                ? <Badge variant="outline" className="bg-green-50 text-green-700">{t('Returned')}</Badge>
                                : <Badge variant="outline" className="bg-blue-50 text-blue-700">{t('Assigned')}</Badge>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
                      {t('No assignment history available')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Maintenance Tab */}
            <TabsContent value="maintenance">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Maintenance History')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {asset.maintenances && asset.maintenances.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('Type')}</TableHead>
                          <TableHead>{t('Start Date')}</TableHead>
                          <TableHead>{t('End Date')}</TableHead>
                          <TableHead>{t('Status')}</TableHead>
                          <TableHead>{t('Cost')}</TableHead>
                          <TableHead>{t('Actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {asset.maintenances.map((maintenance: any) => (
                          <TableRow key={maintenance.id}>
                            <TableCell className="font-medium">
                              {maintenance.maintenance_type}
                            </TableCell>
                            <TableCell>
                              {window.appSettings?.formatDateTimeSimple(maintenance.start_date, false) || format(new Date(maintenance.start_date), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              {maintenance.end_date 
                                ? (window.appSettings?.formatDateTimeSimple(maintenance.end_date, false) || format(new Date(maintenance.end_date), 'MMM dd, yyyy')) 
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${maintenanceStatusColors[maintenance.status] || ''}`}>
                                {maintenance.status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </span>
                            </TableCell>
                            <TableCell>
                              {maintenance.cost ? window.appSettings?.formatCurrency(maintenance.cost) : '-'}
                            </TableCell>
                            <TableCell>
                              {(maintenance.status === 'scheduled' || maintenance.status === 'in_progress') && 
                               hasPermission(permissions, 'manage-asset-maintenance') && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleUpdateMaintenance(maintenance)}
                                >
                                  {t('Update')}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
                      {t('No maintenance history available')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Depreciation Tab */}
            <TabsContent value="depreciation">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Depreciation Information')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {asset.depreciation ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Depreciation Method')}</h3>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                            {asset.depreciation.method === 'straight_line' ? t('Straight Line') : 
                             asset.depreciation.method === 'reducing_balance' ? t('Reducing Balance') : '-'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Useful Life')}</h3>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{asset.depreciation.useful_life_years} {t('Years')}</p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Purchase Value')}</h3>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{window.appSettings?.formatCurrency(asset.purchase_cost || 0)}</p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Salvage Value')}</h3>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{window.appSettings?.formatCurrency(asset.depreciation.salvage_value || 0)}</p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Current Value')}</h3>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{window.appSettings?.formatCurrency(asset.depreciation.current_value || 0)}</p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Last Calculated')}</h3>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                            {asset.depreciation.last_calculated_date 
                              ? (window.appSettings?.formatDateTimeSimple(asset.depreciation.last_calculated_date, false) || format(new Date(asset.depreciation.last_calculated_date), 'MMM dd, yyyy')) 
                              : '-'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide mb-2">{t('Depreciation Progress')}</h3>
                        <div className="flex justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('Current Value')}</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{calculateDepreciationPercentage().toFixed(2)}% {t('Depreciated')}</p>
                        </div>
                        <Progress 
                          value={calculateDepreciationPercentage()} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
                      {t('No depreciation information available')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Current Assignment and QR Code */}
        <div>
          {/* Current Assignment */}
          {asset.status === 'assigned' && asset.current_assignment && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Current Assignment')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Assigned To')}</h3>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">{asset.current_assignment.employee?.name || '-'}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Check-Out Date')}</h3>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{window.appSettings?.formatDateTimeSimple(asset.current_assignment.checkout_date, false) || format(new Date(asset.current_assignment.checkout_date), 'MMM dd, yyyy')}</p>
                  </div>
                  {asset.current_assignment.expected_return_date && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Expected Return')}</h3>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{window.appSettings?.formatDateTimeSimple(asset.current_assignment.expected_return_date, false) || format(new Date(asset.current_assignment.expected_return_date), 'MMM dd, yyyy')}</p>
                    </div>
                  )}
                  {asset.current_assignment.notes && (
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400  tracking-wide">{t('Notes')}</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{asset.current_assignment.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>

            </Card>
          )}
          
          {/* QR Code */}
          {asset.qr_code && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Asset QR Code')}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <img 
                  src={`/storage/${asset.qr_code}`} 
                  alt="Asset QR Code" 
                  className="max-w-full h-auto"
                />
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadQrCode}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('Download QR Code')}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
      
      {/* Update Maintenance Modal */}
      <CrudFormModal
        isOpen={isUpdateMaintenanceModalOpen}
        onClose={() => setIsUpdateMaintenanceModalOpen(false)}
        onSubmit={handleUpdateMaintenanceSubmit}
        formConfig={{
          fields: [
            { 
              name: 'status', 
              label: t('Status'), 
              type: 'select',
              required: true,
              placeholder: t('Select Status'),
              options: [
                { value: 'scheduled', label: t('Scheduled') },
                { value: 'in_progress', label: t('In Progress') },
                { value: 'completed', label: t('Completed') },
                { value: 'cancelled', label: t('Cancelled') }
              ]
            },
            { 
              name: 'end_date', 
              label: t('End Date'), 
              type: 'date',
              required: true,
              placeholder: t('Select End Date'),
              showWhen: (formData) => ['completed', 'cancelled'].includes(formData.status)
            },
            { 
              name: 'completion_notes', 
              label: t('Completion Notes'), 
              type: 'textarea',
              required: true,
              placeholder: t('e.g. Maintenance completed successfully, all parts replaced...'),
              showWhen: (formData) => ['completed', 'cancelled'].includes(formData.status)
            },
            { 
              name: 'cost', 
              label: t('Cost'), 
              type: 'number',
              min: 0,
              step: 0.01,
              placeholder: t('e.g. 250.00')
            }
          ],
          modalSize: 'md'
        }}
        initialData={currentMaintenance}
        title={t('Update Maintenance')}
        mode="edit"
      />
      
    </PageTemplate>
  );
}