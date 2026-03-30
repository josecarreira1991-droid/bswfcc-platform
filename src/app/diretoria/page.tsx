import Navbar from "@/components/Navbar";
import DirectorCard from "@/components/DirectorCard";

const directors = [
  {
    name: "Carlo Barbieri Filho",
    role: "Presidente",
    profile: "Mais de 40 anos de experiência em comércio internacional, ex-presidente de câmaras de comércio, consultor de empresas com foco em expansão Brasil-EUA.",
    company: "Consultoria Internacional",
    linkedin: "linkedin.com/in/carlobarbieri",
  },
  {
    name: "Adriano Diogo",
    role: "Vice-Presidente",
    profile: "Profissional com ampla trajetória em gestão e desenvolvimento de negócios internacionais, conectando empresas brasileiras ao mercado da Flórida.",
    company: "Business Development",
  },
  {
    name: "Emerson Brito",
    role: "Secretário",
    profile: "Especialista em administração e compliance, responsável pela documentação oficial e processos organizacionais da câmara.",
  },
  {
    name: "Karlos Oliveira",
    role: "Tesoureiro",
    profile: "Profissional financeiro com experiência em gestão contábil e fiscal, responsável pela transparência financeira da BSWFCC.",
  },
  {
    name: "Juliano Mendes",
    role: "Diretor de Marketing",
    profile: "Especialista em marketing digital e branding, lidera as estratégias de comunicação e posicionamento da câmara no mercado.",
    company: "Marketing Digital",
  },
  {
    name: "Andrea Schossler",
    role: "Diretora",
    profile: "Líder comunitária ativa na região de Lee County, conectora de negócios e facilitadora de networking entre empresários brasileiros e americanos.",
    linkedin: "linkedin.com/in/andreaschossler",
  },
  {
    name: "Leandro Krug",
    role: "Diretor de Tecnologia",
    profile: "Engenheiro de software e empreendedor tech, responsável pela infraestrutura digital e inovação tecnológica da BSWFCC.",
    company: "Tech Solutions",
  },
  {
    name: "Fabiula Fonseca Gervasoni",
    role: "Diretora",
    profile: "Profissional multifacetada com experiência em gestão empresarial, contribui para a expansão e fortalecimento da rede da câmara.",
  },
  {
    name: "Fábio Meira",
    role: "Diretor de Inovação",
    profile: "Empreendedor com foco em inovação e novas tecnologias, trazendo soluções criativas para o ecossistema empresarial brasileiro no SWFL.",
  },
  {
    name: "Gustavo Turra",
    role: "Diretor",
    profile: "Empresário com experiência em operações e desenvolvimento de negócios na região do Southwest Florida.",
  },
  {
    name: "Marcos Vinicius",
    role: "Diretor",
    profile: "Profissional com atuação em múltiplos setores, contribuindo com visão estratégica para o crescimento da câmara.",
  },
];

export default function DiretoriaPage() {
  return (
    <div className="min-h-screen bg-navy">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">
            <span className="gold-gradient">Diretoria</span> BSWFCC
          </h1>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
            Gestão 2024-2026 — Liderança dedicada ao crescimento da comunidade empresarial brasileira no Southwest Florida.
          </p>
        </div>

        {/* Presidência */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gold mb-4 uppercase tracking-wider">Presidência</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {directors.filter((d) => d.role === "Presidente" || d.role === "Vice-Presidente").map((d) => (
              <DirectorCard key={d.name} {...d} />
            ))}
          </div>
        </section>

        {/* Conselho */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gold mb-4 uppercase tracking-wider">Conselho Fiscal</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {directors.filter((d) => d.role === "Secretário" || d.role === "Tesoureiro").map((d) => (
              <DirectorCard key={d.name} {...d} />
            ))}
          </div>
        </section>

        {/* Diretores */}
        <section>
          <h2 className="text-lg font-semibold text-gold mb-4 uppercase tracking-wider">Diretoria Executiva</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {directors.filter((d) =>
              !["Presidente", "Vice-Presidente", "Secretário", "Tesoureiro"].includes(d.role)
            ).map((d) => (
              <DirectorCard key={d.name} {...d} />
            ))}
          </div>
        </section>

        {/* Info */}
        <div className="mt-16 bg-dark-blue/60 rounded-2xl p-8 border border-gold/10 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-3">Quer fazer parte?</h3>
          <p className="text-gray-400 text-sm mb-6">
            A BSWFCC está sempre aberta a novos membros, parceiros estratégicos e voluntários que queiram contribuir para o crescimento da comunidade.
          </p>
          <a
            href="/register"
            className="inline-block px-8 py-3 bg-gold text-navy font-semibold rounded-xl hover:bg-light-gold transition-colors"
          >
            Cadastrar-se
          </a>
        </div>
      </main>
    </div>
  );
}
