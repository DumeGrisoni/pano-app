'use client';
import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, X } from 'lucide-react';

const Navbar = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const pathname = usePathname();

  const navLinks = [
    { href: '/protected', label: 'ACCUEIL' },
    { href: '/protected/products', label: 'PRODUITS' },
    { href: '/protected/clients', label: 'CLIENTS' },
    { href: '/protected/projects', label: 'PROJETS' },
    { href: '/protected/orders', label: 'COMMANDES' },
    { href: '/protected/profil', label: 'PROFIL' },
  ];

  return isDesktop ? (
    <div className="flex flex-col fixed w-40 h-[84vh] justify-between items-center px-5 py-3 border-r top-0 mt-[74px] left-0 bg-background">
      <div className="flex flex-col items-center h-[50%] my-auto justify-between gap-4 p-4">
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
    </div>
  ) : (
    <div>
      <Drawer direction="right">
        <DrawerTrigger>
          <div className="py-6 pr-5">
            <MenuIcon />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerClose className="flex justify-end p-6 w-full ">
            <X />
          </DrawerClose>
          <div className="px-4 flex flex-col gap-10 items-center justify-center h-full">
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
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Navbar;
