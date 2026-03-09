import { ContactForm } from "@/components/contact-form"
import { Mail, MessageCircle, Clock } from "lucide-react"

export default function ContatoPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Contato</h1>
        <p className="text-muted-foreground mt-1">Fale com a equipe IdeorAI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">contato@ideorai.com</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Comunidade</p>
                <p className="text-sm font-medium">Discord (em breve)</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tempo de resposta</p>
                <p className="text-sm font-medium">Até 2 dias úteis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
