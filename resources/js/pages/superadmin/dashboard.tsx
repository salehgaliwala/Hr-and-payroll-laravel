import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { RefreshCw, BarChart3, Nfc, Building2, CreditCard, Ticket, DollarSign, TrendingUp, Activity, UserPlus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { router } from '@inertiajs/react';

interface SuperAdminDashboardData {
  stats: {
    totalCompanies: number;
    totalUsers: number;
    totalNfcCards: number;
    totalRevenue: number;
    activePlans: number;
    pendingRequests: number;
    monthlyGrowth: number;
    activeCoupons: number;
  };
  recentActivity: Array<{
    id: number;
    name: string;
    email: string;
    registered_at: string;
    status: string;
  }>;
  topPlans: Array<{
    name: string;
    subscribers: number;
    revenue: number;
  }>;
}

interface PageAction {
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onClick: () => void;
}

export default function SuperAdminDashboard({ dashboardData }: { dashboardData: SuperAdminDashboardData }) {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);


  const handleRefresh = () => {
    setIsRefreshing(true);
    router.reload({ only: ['dashboardData'] });
    setTimeout(() => setIsRefreshing(false), 1000);
  };





  const pageActions: PageAction[] = [
    {
      label: t('Refresh'),
      icon: <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />,
      variant: 'outline',
      onClick: handleRefresh
    }
  ];

  const stats = dashboardData?.stats || {
    totalCompanies: 156,
    totalNfcCards: 89,
    totalRevenue: 45678,
    activePlans: 89,
    pendingRequests: 12,
    monthlyGrowth: 15.2
  };

  const recentActivity = dashboardData?.recentActivity || [];

  const topPlans = dashboardData?.topPlans || [
    { name: 'Professional', subscribers: 45, revenue: 13500 },
    { name: 'Business', subscribers: 32, revenue: 9600 },
    { name: 'Enterprise', subscribers: 12, revenue: 7200 },
  ];

  return (
    <PageTemplate 
      title={t('Dashboard')}
      url="/dashboard"
      actions={pageActions}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">{t('Active Plans')}</p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight">{stats.activePlans.toLocaleString()}</h3>
                </div>
                <div className="flex-shrink-0 rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                  <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">{t('Pending Requests')}</p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight">{stats.pendingRequests.toLocaleString()}</h3>
                </div>
                <div className="flex-shrink-0 rounded-full bg-orange-100 p-2 dark:bg-orange-900">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">{t('Monthly Growth')}</p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight">{stats.monthlyGrowth}%</h3>
                </div>
                <div className="flex-shrink-0 rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">{t('Total Companies')}</p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight">{stats.totalCompanies.toLocaleString()}</h3>
                </div>
                <div className="flex-shrink-0 rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">{t('Total Revenue')}</p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight">{window.appSettings.formatCurrency(stats.totalRevenue.toLocaleString())}</h3>
                </div>
                <div className="flex-shrink-0 rounded-full bg-yellow-100 p-2 dark:bg-yellow-900">
                  <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">{t('Total Users')}</p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight">{stats.totalUsers?.toLocaleString() || 0}</h3>
                </div>
                <div className="flex-shrink-0 rounded-full bg-indigo-100 p-2 dark:bg-indigo-900">
                  <UserPlus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Building2 className="h-4 w-4 flex-shrink-0" />
                {t('Recently Registered Companies')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((company) => (
                    <div key={company.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-green-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{company.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{company.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-muted-foreground">{company.registered_at}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">{t('No companies registered yet')}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Plans */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Ticket className="h-4 w-4 flex-shrink-0" />
                {t('Top Performing Plans')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPlans.map((plan, index) => (
                  <div key={plan.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{plan.name}</p>
                        <p className="text-sm text-muted-foreground">{plan.subscribers} {t('subscribers')}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">${plan.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{t('revenue')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Overview */}
        <DashboardOverview userType="superadmin" stats={stats} />
      </div>
    </PageTemplate>
  );
}