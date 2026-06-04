import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { Fragment } from 'react';

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
    return (
        <>
            {items && items.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList>
                        {items.map((item, index) => {
                            const isLast = index === items.length - 1;
                            return (
                                <Fragment key={index}>
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                        ) : item.href ? (
                                            <BreadcrumbLink asChild>
                                                <Link href={item.href}>{item.label}</Link>
                                            </BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage className="cursor-default text-foreground">{item.label}</BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
        </>
    );
}
