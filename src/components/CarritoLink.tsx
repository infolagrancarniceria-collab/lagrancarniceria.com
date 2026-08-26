"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CarritoLink() {
  const { totalItems } = useCart();

  return (
    <Link href="/carrito" className="relative hover:text-accent">
      Carrito
      {totalItems > 0 && (
        <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-background">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
