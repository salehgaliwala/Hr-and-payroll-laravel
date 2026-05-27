import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTranslation } from 'react-i18next';
import { FileText, Tag, Calendar, Download, User, AlertTriangle, Clock, CheckCircle, Eye, FileType, FileSpreadsheet, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';
interface ViewHrDocumentProps {
    document: any;
}
export default function View({ document }: ViewHrDocumentProps) {
    const { t } = useTranslation();
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Draft': return 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10';
            case 'Under Review': return 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20';
            case 'Approved': return 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20';
            case 'Published': return 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20';
            case 'Archived': return 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20';
            case 'Expired': return 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10';
            default: return 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10';
        }
    };
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Under Review': return <Clock className="h-3 w-3" />;
            case 'Approved': return <CheckCircle className="h-3 w-3" />;
            case 'Published': return <Eye className="h-3 w-3" />;
            case 'Expired': return <AlertTriangle className="h-3 w-3" />;
            default: return <FileText className="h-3 w-3" />;
        }
    };
    const formatFileSize = (bytes: number) => {
        if (!bytes) return '-';
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return bytes + ' bytes';
    };
    const isExpired = document.expiry_date && new Date(document.expiry_date) < new Date();
    const isExpiringSoon = document.expiry_date && (() => {
        const expiry = new Date(document.expiry_date);
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        return expiry > today && expiry <= thirtyDaysFromNow;
    })();

    const getFileTypeIcon = (fileName: string) => {
        const ext = fileName?.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf':
                return <FileType className="h-5 w-5 text-red-600" />;
            case 'doc':
            case 'docx':
                return <FileText className="h-5 w-5 text-blue-600" />;
            case 'xls':
            case 'xlsx':
                return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
            case 'ppt':
            case 'pptx':
                return <Presentation className="h-5 w-5 text-orange-600" />;
            case 'txt':
                return <FileText className="h-5 w-5 text-gray-600" />;
            default:
                return <FileText className="h-5 w-5 text-slate-600" />;
        }
    };
    return (
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
            {/* Header */}
            <DialogHeader className="border-b pb-4">
                <div className="flex items-start gap-4">
                    <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" 
                        style={{ backgroundColor: `${document.category?.color}20` }}
                    >
                        {getFileTypeIcon(document.file_name)}
                    </div>
                    <div className="flex-1">
                        <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">{document.title || t('Document Details')}</DialogTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span 
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                style={{ 
                                    backgroundColor: `${document.category?.color}15`,
                                    color: document.category?.color || '#3B82F6'
                                }}
                            >
                                {document.category?.name || '-'}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${getStatusClass(document.status)}`}>
                                {getStatusIcon(document.status)}
                                {t(document.status) || '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogHeader>

            <div className="py-6 space-y-6">
                {/* Document Information */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('Document Information')}</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">{t('File Name')}</p>
                            <p className="text-sm text-gray-900">{document.file_name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">{t('File Size')}</p>
                            <p className="text-sm text-gray-900">{formatFileSize(document.file_size)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">{t('File Type')}</p>
                            <p className="text-sm text-gray-900">{document.file_type || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">{t('Downloads')}</p>
                            <p className="text-sm text-gray-900">{document.download_count || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Dates */}
                {(document.effective_date || document.expiry_date) && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('Dates')}</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            {document.effective_date && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">{t('Effective Date')}</p>
                                    <p className="text-sm text-gray-900">
                                        {window.appSettings?.formatDateTimeSimple(document.effective_date, false) || document.effective_date}
                                    </p>
                                </div>
                            )}
                            {document.expiry_date && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">{t('Expiry Date')}</p>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm ${isExpired ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                            {window.appSettings?.formatDateTimeSimple(document.expiry_date, false) || document.expiry_date}
                                        </p>
                                        {isExpired && (
                                            <span className="text-xs text-red-600">({t('Expired')})</span>
                                        )}
                                        {isExpiringSoon && !isExpired && (
                                            <span className="text-xs text-amber-600">({t('Expiring Soon')})</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* People */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('People')}</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">{t('Uploaded By')}</p>
                            <p className="text-sm text-gray-900">{document.uploader?.name || '-'}</p>
                            {document.created_at && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {window.appSettings?.formatDateTimeSimple(document.created_at, true) || document.created_at}
                                </p>
                            )}
                        </div>
                        {(document.status === 'Approved' || document.status === 'Published') && document.approver && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">{t('Approved By')}</p>
                                <p className="text-sm text-gray-900">{document.approver?.name || '-'}</p>
                                {document.approved_at && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {window.appSettings?.formatDateTimeSimple(document.approved_at, true) || document.approved_at}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Information */}
                {(document.requires_acknowledgment || document.description) && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('Additional Information')}</h3>
                        <div className="space-y-3">
                            {document.requires_acknowledgment && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">{t('Requires Acknowledgment')}</p>
                                    <p className="text-sm text-gray-900">{t('Yes')}</p>
                                </div>
                            )}
                            {document.description && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">{t('Description')}</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">{document.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <DialogFooter className="border-t pt-4">
                <Button
                    onClick={() => window.open(route('hr.documents.hr-documents.download', document.id), '_blank')}
                >
                    <Download className="h-4 w-4 mr-2" />
                    {t('Download')}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
