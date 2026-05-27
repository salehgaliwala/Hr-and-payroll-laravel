// pages/hr/assets/depreciation-report.tsx
import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { List, BarChart, Download, Printer, ShoppingCart, TrendingDown, DollarSign, TrendingUp } from 'lucide-react';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { CrudTable } from '@/components/CrudTable';

export default function DepreciationReport() {
  const { t } = useTranslation();
  const { 
    assets, 
    assetTypes, 
    totalPurchaseValue, 
    totalCurrentValue, 
    totalDepreciation,
    filters: pageFilters = {} 
  } = usePage().props as any;
  
  // State
  const [selectedAssetType, setSelectedAssetType] = useState(pageFilters.asset_type_id || '');
  const [purchaseDateFrom, setPurchaseDateFrom] = useState(pageFilters.purchase_date_from || '');
  const [purchaseDateTo, setPurchaseDateTo] = useState(pageFilters.purchase_date_to || '');
  const [showFilters, setShowFilters] = useState(false);
  
  const handleViewAssets = () => {
    router.get(route('hr.assets.index'));
  };
  
  const handleViewDashboard = () => {
    router.get(route('hr.assets.dashboard'));
  };
  
  // Check if any filters are active
  const hasActiveFilters = () => {
    return selectedAssetType !== '' || 
           purchaseDateFrom !== '' || 
           purchaseDateTo !== '';
  };
  
  // Count active filters
  const activeFilterCount = () => {
    return (selectedAssetType !== '' ? 1 : 0) + 
           (purchaseDateFrom !== '' ? 1 : 0) + 
           (purchaseDateTo !== '' ? 1 : 0);
  };
  
  const applyFilters = () => {
    router.get(route('hr.assets.depreciation-report'), {
      page: 1,
      asset_type_id: selectedAssetType || undefined,
      purchase_date_from: purchaseDateFrom || undefined,
      purchase_date_to: purchaseDateTo || undefined,
      sort_field: pageFilters.sort_field || undefined,
      sort_direction: pageFilters.sort_direction || undefined,
      per_page: pageFilters.per_page,
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('hr.assets.depreciation-report'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      asset_type_id: selectedAssetType || undefined,
      purchase_date_from: purchaseDateFrom || undefined,
      purchase_date_to: purchaseDateTo || undefined,
      per_page: pageFilters.per_page,
    }, { preserveState: true, preserveScroll: true });
  };

  const handleResetFilters = () => {
    setSelectedAssetType('');
    setPurchaseDateFrom('');
    setPurchaseDateTo('');
    setShowFilters(false);
    router.get(route('hr.assets.depreciation-report'), {
      page: 1,
      per_page: pageFilters.per_page,
    }, { preserveState: true, preserveScroll: true });
  };

  const handlePageChange = (url: string) => {
    const pageParam = new URL(url).searchParams.get('page') || '1';
    router.get(route('hr.assets.depreciation-report'), {
      page: pageParam,
      asset_type_id: selectedAssetType || undefined,
      purchase_date_from: purchaseDateFrom || undefined,
      purchase_date_to: purchaseDateTo || undefined,
      sort_field: pageFilters.sort_field || undefined,
      sort_direction: pageFilters.sort_direction || undefined,
      per_page: pageFilters.per_page,
    }, { preserveState: true, preserveScroll: true });
  };

  const handlePerPageChange = (value: string) => {
    router.get(route('hr.assets.depreciation-report'), {
      page: 1,
      per_page: parseInt(value),
      asset_type_id: selectedAssetType || undefined,
      purchase_date_from: purchaseDateFrom || undefined,
      purchase_date_to: purchaseDateTo || undefined,
      sort_field: pageFilters.sort_field || undefined,
      sort_direction: pageFilters.sort_direction || undefined,
    }, { preserveState: true, preserveScroll: true });
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExportCSV = () => {
    const params = new URLSearchParams({
      ...(selectedAssetType && { asset_type_id: selectedAssetType }),
      ...(purchaseDateFrom && { purchase_date_from: purchaseDateFrom }),
      ...(purchaseDateTo && { purchase_date_to: purchaseDateTo })
    });
    
    window.open(`${route('hr.assets.export-depreciation-csv')}?${params.toString()}`, '_blank');
  };
  
  // Define page actions
  const pageActions = [
    {
      label: t('Asset List'),
      icon: <List className="h-4 w-4 mr-2" />,
      variant: 'outline' as const,
      onClick: handleViewAssets
    },
    {
      label: t('Dashboard'),
      icon: <BarChart className="h-4 w-4 mr-2" />,
      variant: 'outline' as const,
      onClick: handleViewDashboard
    },
    {
      label: t('Print'),
      icon: <Printer className="h-4 w-4 mr-2" />,
      variant: 'outline' as const,
      onClick: handlePrint,
      className: 'print:hidden'
    },
    {
      label: t('Export CSV'),
      icon: <Download className="h-4 w-4 mr-2" />,
      variant: 'outline' as const,
      onClick: handleExportCSV,
      className: 'print:hidden'
    }
  ];

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Asset Management') },
    { title: t('Depreciation Report') }
  ];
  
  // Prepare asset type options for filter
  const assetTypeOptions = [
    { value: '', label: t('All Types') },
    ...(assetTypes || []).map((type: any) => ({
      value: type.id.toString(),
      label: type.name
    }))
  ];
  
  // Calculate depreciation percentage
  const calculateDepreciationPercentage = (purchaseCost: number, currentValue: number) => {
    if (!purchaseCost || purchaseCost === 0) return 0;
    return ((purchaseCost - currentValue) / purchaseCost) * 100;
  };

  // CrudTable columns
  const columns = [
    {
      key: 'name',
      label: t('Asset Name'),
      sortable: true,
      render: (_: any, row: any) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-gray-500">{row.asset_type?.name || '-'}</div>
        </div>
      ),
    },
    {
      key: 'purchase_date',
      label: t('Purchase Date'),
      sortable: true,
      render: (value: any) =>
        value
          ? window.appSettings?.formatDateTimeSimple(value, false) || new Date(value).toLocaleDateString()
          : '-',
    },
    {
      key: 'purchase_cost',
      label: t('Purchase Cost'),
      sortable: true,
      render: (value: any) => {
        const cost = parseFloat(value || 0);
        return window.appSettings?.formatCurrency(cost) ?? '-';
      },
    },
    {
      key: 'depreciation_method',
      label: t('Depreciation Method'),
      render: (_: any, row: any) => {
        const method = row.depreciation?.method;
        if (method === 'straight_line') return t('Straight Line');
        if (method === 'reducing_balance') return t('Reducing Balance');
        return '-';
      },
    },
    {
      key: 'current_value',
      label: t('Current Value'),
      render: (_: any, row: any) => {
        const val = parseFloat(row.depreciation?.current_value || 0);
        return window.appSettings?.formatCurrency(val) ?? '-';
      },
    },
    {
      key: 'depreciation_amount',
      label: t('Depreciation'),
      render: (_: any, row: any) => {
        const cost = parseFloat(row.purchase_cost || 0);
        const val = parseFloat(row.depreciation?.current_value || 0);
        return window.appSettings?.formatCurrency(cost - val) ?? '-';
      },
    },
    {
      key: 'depreciation_pct',
      label: t('Depreciation %'),
      render: (_: any, row: any) => {
        const cost = parseFloat(row.purchase_cost || 0);
        const val = parseFloat(row.depreciation?.current_value || 0);
        return `${calculateDepreciationPercentage(cost, val).toFixed(2)}%`;
      },
    },
  ];
  
  return (
    <PageTemplate 
      title={t("Asset Depreciation Report")} 
      url="/hr/assets/depreciation-report"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
    >
      {/* Filters section - hidden when printing */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4 print:hidden">
        <SearchAndFilterBar
          searchTerm=""
          onSearchChange={() => {}}
          onSearch={() => {}}
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
          onPerPageChange={handlePerPageChange}
          hideSearch={true}
        />
      </div>
      
      {/* Summary Cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Total Purchase Value */}
        <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
          <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-blue-500" />
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Total Purchase Value')}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{window.appSettings?.formatCurrency(totalPurchaseValue || 0)}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                  <ShoppingCart className="h-3 w-3" />
                  <span className="font-medium">{t('Original cost of all assets')}</span>
                </div>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/40">
                <div className="h-full w-full rounded-full bg-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Current Value */}
        <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
          <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-green-500" />
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Total Current Value')}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{window.appSettings?.formatCurrency(totalCurrentValue || 0)}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-medium">{totalPurchaseValue > 0 ? Math.round((totalCurrentValue / totalPurchaseValue) * 100) : 0}% {t('of purchase value')}</span>
                </div>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-500" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1 w-full overflow-hidden rounded-full bg-green-100 dark:bg-green-900/40">
                <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${totalPurchaseValue > 0 ? (totalCurrentValue / totalPurchaseValue) * 100 : 0}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Depreciation */}
        <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
          <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-red-500" />
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Total Depreciation')}</p>
                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{window.appSettings?.formatCurrency(totalDepreciation || 0)}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <TrendingDown className="h-3 w-3" />
                  <span className="font-medium">{totalPurchaseValue > 0 ? Math.round((totalDepreciation / totalPurchaseValue) * 100) : 0}% {t('of purchase value')}</span>
                </div>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1 w-full overflow-hidden rounded-full bg-red-100 dark:bg-red-900/40">
                <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${totalPurchaseValue > 0 ? (totalDepreciation / totalPurchaseValue) * 100 : 0}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Report Table */}
      <Card className="border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
        <CardHeader className="bg-gray-50/50 pb-3 dark:bg-gray-800/50">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('Asset Depreciation Details')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <CrudTable
              columns={columns}
              actions={[]}
              data={assets?.data || []}
              from={assets?.from || 1}
              onAction={() => {}}
              sortField={pageFilters.sort_field}
              sortDirection={pageFilters.sort_direction}
              onSort={handleSort}
              permissions={[]}
              showActions={false}
            />
          </div>
          {/* Pagination - hidden when printing */}
          <div className="print:hidden">
            <Pagination
              from={assets?.from || 0}
              to={assets?.to || 0}
              total={assets?.total || 0}
              links={assets?.links}
              entityName={t('assets')}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}