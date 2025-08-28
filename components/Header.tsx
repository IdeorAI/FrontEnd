// components/Header.tsx
import { AuthButton } from "@/components/auth-button";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
          Ideor.AI
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
