'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import logo from '../../public/logo.svg';
import '../styles/components/_navbar.scss';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Features', href: '/features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'About', href: '/about' },
    ];

    return (
        <header className='navbar'>
            <nav aria-label='Global'>
                <div className='navbar__logo'>
                    <Link href='/' className='-m-1.5 p-1.5'>
                        <Image
                            alt='Company Logo'
                            src={logo}
                            width={32}
                            height={32}
                            className='h-8 w-auto'
                        />
                    </Link>
                </div>

                <div className='navbar__mobile'>
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <button
                                aria-label='Open main menu'
                                className='menu-btn'
                            >
                                <Menu className='h-6 w-6' aria-hidden='true' />
                            </button>
                        </SheetTrigger>
                        <SheetContent side='right' className='sheet-content'>
                            <SheetHeader className='sheet-header'>
                                <Link
                                    href='/'
                                    className='-m-1.5 p-1.5'
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Image
                                        alt='Company Logo'
                                        src={logo}
                                        width={32}
                                        height={32}
                                        className='h-8 w-auto'
                                    />
                                </Link>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => setMobileMenuOpen(false)}
                                    aria-label='Close menu'
                                ></Button>
                            </SheetHeader>
                            <div className='sheet-links'>
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className='navbar__links'>
                    {navigation.map((item) => (
                        <Link key={item.name} href={item.href}>
                            {item.name}
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
}
