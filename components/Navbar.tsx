'use client';
import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { MenuIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'ACCUEIL' },
    { href: '/products', label: 'PRODUITS' },
    { href: '/clients', label: 'CLIENTS' },
    { href: '/projects', label: 'PROJETS' },
    { href: '/commandes', label: 'COMMANDES' },
  ];

  return isDesktop ? (
    <div className="flex fixed w-full justify-between items-center px-5 py-3 bg-white text-black border-b border-b-gray-200 shadow-md shadow-gray/20">
      <Image src="/logo.svg" alt="Logo" width={50} height={50} />
      <div className="flex justify-center gap-4 p-4">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative hover:underline hover:underline-offset-4 transition-all duration-300 ease-in-out hover:text-red-500 ${
                isActive ? 'underline underline-offset-4' : ''
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      <Link href="/login" className="">
        <Button size={'lg'} className={'cursor-pointer'}>
          Connexion
        </Button>
      </Link>
    </div>
  ) : (
    <div>Mobile</div>
  );
};

export default Navbar;
