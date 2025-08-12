'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname } from "next/navigation"
import { mainNav, adminNav } from "@/lib/data";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TabNav() {
    const pathname = usePathname();

    const isAnAdminPath = pathname.startsWith('/admin');
    
    let navItems = mainNav;
    let defaultValue = pathname;

    if (isAnAdminPath) {
        navItems = adminNav;
        // if we are in /admin, we want to default to the first admin tab
        defaultValue = pathname === '/admin' ? adminNav[0].href : pathname;
    }


    return (
        <div className="grid w-full items-start gap-6">
            <div className="flex items-center justify-between">
                <Tabs value={defaultValue} className="w-full">
                    <TabsList>
                        {mainNav.map(item => (
                            <Link href={item.href} key={item.href} passHref legacyBehavior>
                                <TabsTrigger value={item.href} className={cn(item.href === '/admin/usuarios' && 'hidden md:flex')}>{item.title}</TabsTrigger>
                            </Link>
                        ))}
                    </TabsList>

                    {isAnAdminPath && (
                        <div className="mt-4">
                        <Tabs value={pathname}>
                            <TabsList>
                                 {adminNav.map(item => (
                                    <Link href={item.href} key={item.href} passHref legacyBehavior>
                                        <TabsTrigger value={item.href}>{item.title}</TabsTrigger>
                                    </Link>
                                ))}
                            </TabsList>
                        </Tabs>
                        </div>
                    )}
                </Tabs>
            </div>
        </div>
    )
}
