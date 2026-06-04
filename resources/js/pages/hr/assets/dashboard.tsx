// pages/hr/assets/dashboard.tsx
import { PageTemplate } from '@/components/page-template';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { BarChart, CheckCircle, List, Package, UserCheck, Wrench, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AssetDashboard() {
    const { t } = useTranslation();
    const { assetCounts, assetTypeData, recentAssignments, upcomingMaintenance, expiringWarranties, assetValueSummary } = usePage().props as any;

    const handleViewAssets = () => {
        router.get(route('hr.assets.index'));
    };

    const handleViewDepreciationReport = () => {
        router.get(route('hr.assets.depreciation-report'));
    };

    // Define page actions
    const pageActions = [
        {
            label: t('Asset List'),
            icon: <List className="mr-2 h-4 w-4" />,
            variant: 'outline' as const,
            onClick: handleViewAssets,
        },
        {
            label: t('Depreciation Report'),
            icon: <BarChart className="mr-2 h-4 w-4" />,
            variant: 'outline' as const,
            onClick: handleViewDepreciationReport,
        },
    ];

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Asset Management') },
        { title: t('Asset Dashboard') },
    ];

    // Status colors for badges
    const statusColors = {
        available: 'bg-green-50 text-green-700 ring-green-600/20',
        assigned: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        under_maintenance: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        disposed: 'bg-red-50 text-red-700 ring-red-600/20',
    };

    // Status labels
    const statusLabels = {
        available: t('Available'),
        assigned: t('Assigned'),
        under_maintenance: t('Under Maintenance'),
        disposed: t('Disposed'),
    };

    return (
        <PageTemplate title={t('Asset Dashboard')} url="/hr/assets/dashboard" actions={pageActions} breadcrumbs={breadcrumbs}>
            {/* Asset Status Overview */}
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Assets */}
                <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                    <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-slate-500" />
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Total Assets')}</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{assetCounts.total}</p>
                                <div className="mt-2 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                    <TrendingUp className="h-3 w-3" />
                                    <span className="font-medium">{t('All registered assets')}</span>
                                </div>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div className="h-full w-full rounded-full bg-slate-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Available */}
                <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                    <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-green-500" />
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Available')}</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{assetCounts.available}</p>
                                <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-500">
                                    <CheckCircle className="h-3 w-3" />
                                    <span className="font-medium">{assetCounts.total > 0 ? Math.round((assetCounts.available / assetCounts.total) * 100) : 0}% {t('of total')}</span>
                                </div>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="h-1 w-full overflow-hidden rounded-full bg-green-100 dark:bg-green-900/40">
                                <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${assetCounts.total > 0 ? (assetCounts.available / assetCounts.total) * 100 : 0}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assigned */}
                <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                    <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-blue-500" />
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Assigned')}</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{assetCounts.assigned}</p>
                                <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-500">
                                    <UserCheck className="h-3 w-3" />
                                    <span className="font-medium">{assetCounts.total > 0 ? Math.round((assetCounts.assigned / assetCounts.total) * 100) : 0}% {t('of total')}</span>
                                </div>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                                <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="h-1 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/40">
                                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${assetCounts.total > 0 ? (assetCounts.assigned / assetCounts.total) * 100 : 0}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Under Maintenance */}
                <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                    <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-amber-500" />
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Under Maintenance')}</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{assetCounts.under_maintenance}</p>
                                <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500">
                                    <Wrench className="h-3 w-3" />
                                    <span className="font-medium">{assetCounts.total > 0 ? Math.round((assetCounts.under_maintenance / assetCounts.total) * 100) : 0}% {t('of total')}</span>
                                </div>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                                <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="h-1 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/40">
                                <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${assetCounts.total > 0 ? (assetCounts.under_maintenance / assetCounts.total) * 100 : 0}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Asset Value Summary */}
            <Card className="mb-6 overflow-hidden border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                <CardHeader className="bg-gray-50/50 pb-4 dark:bg-gray-800/50">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('Asset Value Summary')}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Total Purchase Value')}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {window.appSettings?.formatCurrency(assetValueSummary.total_purchase_value || 0)}
                            </p>
                        </div>
                        <div className="flex flex-col space-y-1 border-t border-gray-100 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6 dark:border-gray-800">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Total Current Value')}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {window.appSettings?.formatCurrency(assetValueSummary.total_current_value || 0)}
                            </p>
                        </div>
                        <div className="flex flex-col space-y-1 border-t border-gray-100 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6 dark:border-gray-800">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Total Depreciation')}</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {window.appSettings?.formatCurrency(assetValueSummary.total_depreciation || 0)}
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('Depreciation Progress')}</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                {Number(assetValueSummary.total_purchase_value || 0) > 0
                                    ? Math.round(
                                          (Number(assetValueSummary.total_depreciation || 0) / Number(assetValueSummary.total_purchase_value || 0)) *
                                              100,
                                      )
                                    : 0}
                                %
                            </p>
                        </div>
                        <Progress
                            value={
                                Number(assetValueSummary.total_purchase_value || 0) > 0
                                    ? (Number(assetValueSummary.total_depreciation || 0) / Number(assetValueSummary.total_purchase_value || 0)) * 100
                                    : 0
                            }
                            className="h-2.5 bg-gray-200 dark:bg-gray-800"
                        />
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50/50 pt-4 pb-4 dark:bg-gray-800/50">
                    <Button variant="outline" size="sm" onClick={handleViewDepreciationReport} className="w-full sm:w-auto">
                        <BarChart className="mr-2 h-4 w-4" />
                        {t('View Depreciation Report')}
                    </Button>
                </CardFooter>
            </Card>

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Asset Distribution by Type */}
                <Card className="border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                    <CardHeader className="bg-gray-50/50 pb-4 dark:bg-gray-800/50">
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('Asset Distribution')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {assetTypeData.length > 0 ? (
                            <div className="space-y-5">
                                {assetTypeData.map((type: any, index: number) => (
                                    <div key={index}>
                                        <div className="mb-2 flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.name}</p>
                                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                {type.count}
                                            </span>
                                        </div>
                                        <Progress
                                            value={assetCounts.total > 0 ? (type.count / assetCounts.total) * 100 : 0}
                                            className="h-2 bg-gray-100 dark:bg-gray-800"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">{t('No asset data available')}</div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Assignments */}
                <Card className="border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                    <CardHeader className="bg-gray-50/50 pb-4 dark:bg-gray-800/50">
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('Recent Assignments')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {recentAssignments && recentAssignments.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {recentAssignments.map((assignment: any) => (
                                    <div
                                        key={assignment.id}
                                        className="-mx-2 flex items-center justify-between rounded-md px-2 py-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                    >
                                        <div className="flex-1 overflow-hidden pr-4">
                                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {assignment.asset?.name}
                                            </p>
                                            <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{assignment.employee?.name}</span>
                                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                                <span>
                                                    {window.appSettings?.formatDateTimeSimple(assignment.checkout_date, false) ||
                                                        format(new Date(assignment.checkout_date), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 shrink-0"
                                            onClick={() => router.get(route('hr.assets.show', assignment.asset_id))}
                                        >
                                            {t('View')}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">{t('No recent assignments')}</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Upcoming Maintenance */}
                <Card className="border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                    <CardHeader className="bg-gray-50/50 pb-4 dark:bg-gray-800/50">
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('Upcoming Maintenance')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {upcomingMaintenance && upcomingMaintenance.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {upcomingMaintenance.map((maintenance: any) => (
                                    <div
                                        key={maintenance.id}
                                        className="-mx-2 flex items-center justify-between rounded-md px-2 py-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                    >
                                        <div className="flex-1 overflow-hidden pr-4">
                                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {maintenance.asset?.name}
                                            </p>
                                            <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="font-medium text-amber-600 dark:text-amber-500">{maintenance.maintenance_type}</span>
                                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                                <span>
                                                    {window.appSettings?.formatDateTimeSimple(maintenance.start_date, false) ||
                                                        format(new Date(maintenance.start_date), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 shrink-0"
                                            onClick={() => router.get(route('hr.assets.show', maintenance.asset_id))}
                                        >
                                            {t('View')}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">{t('No upcoming maintenance')}</div>
                        )}
                    </CardContent>
                </Card>

                {/* Expiring Warranties */}
                <Card className="border-0 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
                    <CardHeader className="bg-gray-50/50 pb-4 dark:bg-gray-800/50">
                        <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('Expiring Warranties')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {expiringWarranties && expiringWarranties.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {expiringWarranties.map((asset: any) => (
                                    <div
                                        key={asset.id}
                                        className="-mx-2 flex items-center justify-between rounded-md px-2 py-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                    >
                                        <div className="flex-1 overflow-hidden pr-4">
                                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{asset.name}</p>
                                            <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{asset.warranty_info}</span>
                                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                                <span className="text-red-600 dark:text-red-400">
                                                    {t('Expires')}:{' '}
                                                    {window.appSettings?.formatDateTimeSimple(asset.warranty_expiry_date, false) ||
                                                        format(new Date(asset.warranty_expiry_date), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 shrink-0"
                                            onClick={() => router.get(route('hr.assets.show', asset.id))}
                                        >
                                            {t('View')}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">{t('No expiring warranties')}</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageTemplate>
    );
}
