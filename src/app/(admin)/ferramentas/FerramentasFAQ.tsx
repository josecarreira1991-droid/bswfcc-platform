"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Quanto custa?",
    answer:
      "Não tem mensalidade fixa. Você paga apenas pelo uso da API de IA, que fica em torno de US$ 10/mês com uso normal.",
  },
  {
    question: "Preciso saber programar?",
    answer:
      "Não. O MyCEO é 100% visual. Você configura tudo pelo painel.",
  },
  {
    question: "Funciona com meu número de WhatsApp?",
    answer:
      "Sim. Você conecta seu WhatsApp Business existente.",
  },
  {
    question: "É exclusivo pra membros BSWFCC?",
    answer:
      "O acesso prioritário e suporte direto são exclusivos para membros. A plataforma é aberta mas membros BSWFCC têm condições especiais.",
  },
];

export default function FerramentasFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="rounded-xl border border-corp-border overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium text-corp-text">
                {faq.question}
              </span>
              <ChevronDown
                size={18}
                className={cn(
                  "text-corp-muted flex-shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <p className="px-5 pb-4 text-sm text-corp-muted leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
