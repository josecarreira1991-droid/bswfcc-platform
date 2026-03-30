"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Quanto custa?",
    answer:
      "Nao tem mensalidade fixa. Voce paga apenas pelo uso da API de IA, que fica em torno de US$ 10/mes com uso normal.",
  },
  {
    question: "Preciso saber programar?",
    answer:
      "Nao. O MyCEO e 100% visual. Voce configura tudo pelo painel.",
  },
  {
    question: "Funciona com meu numero de WhatsApp?",
    answer:
      "Sim. Voce conecta seu WhatsApp Business existente.",
  },
  {
    question: "E exclusivo pra membros BSWFCC?",
    answer:
      "O acesso prioritario e suporte direto sao exclusivos para membros. A plataforma e aberta mas membros BSWFCC tem condicoes especiais.",
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
            className="rounded-xl border border-slate-700/50 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-sm font-medium text-white">
                {faq.question}
              </span>
              <ChevronDown
                size={18}
                className={cn(
                  "text-slate-400 flex-shrink-0 transition-transform duration-200",
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
              <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
