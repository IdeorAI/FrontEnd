"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, CheckCircle } from "lucide-react"

export function ContactForm() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: integrate real email service
    console.log("Contact form submitted:", form)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="bg-card border rounded-lg p-8 flex flex-col items-center gap-4 text-center">
        <CheckCircle className="h-12 w-12 text-secondary" />
        <h3 className="text-xl font-semibold">Mensagem enviada!</h3>
        <p className="text-muted-foreground text-sm">Entraremos em contato em até 2 dias úteis.</p>
        <Button variant="outline" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }) }}>
          Enviar outra mensagem
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="name">Nome</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Seu nome"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="seu@email.com"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="subject">Assunto</label>
        <input
          id="subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Como podemos ajudar?"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="message">Mensagem</label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={5}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          placeholder="Descreva sua dúvida ou sugestão..."
        />
      </div>
      <Button type="submit" className="w-full">
        <Send className="h-4 w-4 mr-2" />
        Enviar mensagem
      </Button>
    </form>
  )
}
