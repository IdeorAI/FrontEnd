// components/Header.tsx
import { AuthButton } from "@/components/auth-button";
import Image from "next/image";
import Logo from "../app/assets/logo_branco.png";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold">
          <Link href="/" aria-label="Ir para a página inicial">
            <Image
              src={Logo}
              alt="Ideor.AI"
              width={176}
              height={53}
              className="h-6 w-auto sm:h-8 md:h-10 lg:h-12"
              priority
            />
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          <a
            href="#contato"
            className="hidden md:block text-foreground hover:text-primary transition-colors"
          >
            Contato
          </a>

          <AuthButton />
        </nav>
      </div>
    </header>
  );
}
