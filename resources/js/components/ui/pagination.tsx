/**
 * Pagination component with dark mode support
 */
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  from?: number;
  to?: number;
  total?: number;
  links?: any[];
  currentPage?: number;
  lastPage?: number;
  entityName?: string;
  onPageChange?: (url: string) => void;
  className?: string;
}

// Build truncated links with dots from flat links array
function buildTruncatedLinks(links: any[]) {
  if (!links || links.length <= 3) return links;

  // Separate prev, next and page number links
  const prev = links[0];
  const next = links[links.length - 1];
  const pages = links.slice(1, -1); // all page number links

  if (pages.length <= 7) return links; // no truncation needed

  // Find active page index
  const activeIndex = pages.findIndex((p: any) => p.active);
  const delta = 2;

  const rangeStart = Math.max(0, activeIndex - delta);
  const rangeEnd = Math.min(pages.length - 1, activeIndex + delta);

  const truncated: any[] = [prev];

  // Always add first page
  truncated.push(pages[0]);

  // Dots after first page
  if (rangeStart > 1) {
    truncated.push({ url: null, label: '...', active: false });
  }

  // Middle window pages
  for (let i = rangeStart; i <= rangeEnd; i++) {
    if (i !== 0 && i !== pages.length - 1) {
      truncated.push(pages[i]);
    }
  }

  // Dots before last page
  if (rangeEnd < pages.length - 2) {
    truncated.push({ url: null, label: '...', active: false });
  }

  // Always add last page
  truncated.push(pages[pages.length - 1]);

  truncated.push(next);

  return truncated;
}

export function Pagination({
  from = 0,
  to = 0,
  total = 0,
  links = [],
  currentPage,
  lastPage,
  entityName = 'items',
  onPageChange,
  className = '',
}: PaginationProps) {
  const { t } = useTranslation();

  const handlePageChange = (url: string) => {
    if (onPageChange) {
      onPageChange(url);
    } else if (url) {
      window.location.href = url;
    }
  };

  const displayLinks = buildTruncatedLinks(links);

  return (
    <div className={cn(
      "p-4 border-t dark:border-gray-700 flex items-center justify-between dark:bg-gray-900",
      className
    )}>
      <div className="text-sm text-muted-foreground dark:text-gray-300">
        {t("Showing")} <span className="font-medium dark:text-white">{from}</span> {t("to")}{" "}
        <span className="font-medium dark:text-white">{to}</span> {t("of")}{" "}
        <span className="font-medium dark:text-white">{total}</span> {entityName}
      </div>

      <div className="flex gap-1">
        {displayLinks && displayLinks.length > 0 ? (
          displayLinks.map((link: any, i: number) => {
            // Check if the link is "Next" or "Previous" to use text instead of icon
            const isTextLink = link.label === "&laquo; Previous" || link.label === "Next &raquo;";
            const isDots = link.label === '...';
            const label = link.label.replace("&laquo; ", "").replace(" &raquo;", "");

            if (isDots) {
              return (
                <span key={`pagination-${i}-dots`} className="h-8 w-8 flex items-center justify-center text-sm text-muted-foreground">
                  &hellip;
                </span>
              );
            }

            return (
              <Button
                key={`pagination-${i}-${link.label}`}
                variant={link.active ? 'default' : 'outline'}
                size={isTextLink ? "sm" : "icon"}
                className={isTextLink ? "px-3" : "h-8 w-8"}
                disabled={!link.url}
                onClick={() => link.url && handlePageChange(link.url)}
              >
                {isTextLink ? label : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
              </Button>
            );
          })
        ) : (
          // Simple pagination if links are not available
          currentPage && lastPage && lastPage > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(`?page=${currentPage - 1}`)}
              >
                {t("Previous")}
              </Button>
              <span className="px-3 py-1 dark:text-white">
                {currentPage} of {lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= lastPage}
                onClick={() => handlePageChange(`?page=${currentPage + 1}`)}
              >
                {t("Next")}
              </Button>
            </>
          )
        )}
      </div>
    </div>
  );
}