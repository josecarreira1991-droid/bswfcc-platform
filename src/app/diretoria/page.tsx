import Navbar from "@/components/Navbar";
import DirectorCard from "@/components/DirectorCard";
import { getDirectors } from "@/lib/actions/market";
import type { Director } from "@/types/database";

const fallbackDirectors = [
  { name: "Carlo Barbieri", role: "Presidente", profile: "CEO Oxford Group. Formação FGV, Sorbonne, Harvard, MIT. Apresentador Focus Brasil. Conselho Consular Miami. Mais de 40 anos em comércio internacional.", company: "Oxford Group", linkedin: "https://linkedin.com/in/carlobarbieri" },
  { name: "Andre O. Carvalho", role: "Presidente Honorário", profile: "Consul-Geral do Brasil em Miami. Diplomata com passagens por Buenos Aires, Moscou, Londres e Bruxelas. Confere credibilidade diplomática à câmara.", company: "Consulado do Brasil em Miami" },
  { name: "Bruno Rogers", role: "Vice-Presidente", profile: "4 empresas ativas na Florida. Liderança comunitária em Sarasota. Ampla experiência em gestão e desenvolvimento de negócios internacionais." },
  { name: "Sidney Bezerra", role: "Secretário", profile: "Engenheiro elétrico com mais de 10 anos na AT&T. Responsável pela documentação oficial e processos organizacionais da câmara.", company: "AT&T" },
  { name: "Andrea Schossler", role: "Tesoureira", profile: "Gestão financeira. Baseada em Lakewood Ranch, FL. Responsável pela transparência financeira e contabilidade da BSWFCC.", linkedin: "https://linkedin.com/in/andreaschossler" },
  { name: "Isabelle Nepomuceno", role: "Diretora de Marketing", profile: "Head de Operações na Seven Ophthalmic. Lidera as estratégias de comunicação e posicionamento da câmara no mercado.", company: "Seven Ophthalmic" },
  { name: "Ricardo Padovan", role: "Diretor de Tecnologia", profile: "Fundador RPM Digital. Ex-IBM, Nokia, Intel. Responsável pela infraestrutura digital e inovação tecnológica da BSWFCC.", company: "RPM Digital" },
  { name: "Brenno Dias", role: "Diretor de Inovação Financeira", profile: "CEO TB Financial Services. Formado pelo ITA. Contador. Traz expertise financeira e inovação para o ecossistema da câmara.", company: "TB Financial Services" },
  { name: "Josue Colucci", role: "Diretor", profile: "Mais de 30 anos de experiência em contabilidade e tecnologia. Contribui com visão estratégica para o crescimento da câmara." },
  { name: "Tatiana Arcencio", role: "Diretora", profile: "3 empresas ativas na Florida. Empreendedora serial com experiência em múltiplos setores e forte presença no mercado SWFL." },
  { name: "Caroline Jones", role: "Diretora", profile: "Enfermeira com mestrado. CEO Vitalify Wellness. Representa o setor de saúde e bem-estar na diretoria da câmara.", company: "Vitalify Wellness" },
];

const presidencia = ["Presidente", "Presidente Honorário", "Vice-Presidente"];
const conselho = ["Secretário", "Tesoureira"];

export default async function DiretoriaPage() {
  const dbDirectors = await getDirectors().catch(() => null);

  const directors: { name: string; role: string; profile: string; company?: string | null; linkedin?: string | null }[] =
    dbDirectors && dbDirectors.length > 0 ? dbDirectors : fallbackDirectors;

  return (
    <div className="min-h-screen bg-[#ECF0F5]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-corp-text">
            <span className="text-accent">Diretoria</span> BSWFCC
          </h1>
          <p className="text-corp-muted mt-3 max-w-2xl mx-auto">
            Conselho de 11 diretores com perfis verificados independentemente. O conselho cobre 8+ setores: tecnologia, finanças, saúde, telecomunicações, diplomacia, imobiliário, marketing e comunidade.
          </p>
        </div>

        {/* Presidência */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-accent mb-4 uppercase tracking-wider">Presidência</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {directors.filter((d) => presidencia.includes(d.role)).map((d) => (
              <DirectorCard key={d.name} name={d.name} role={d.role} profile={d.profile} company={d.company ?? undefined} linkedin={d.linkedin ?? undefined} />
            ))}
          </div>
        </section>

        {/* Conselho Fiscal */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-accent mb-4 uppercase tracking-wider">Conselho Fiscal</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {directors.filter((d) => conselho.includes(d.role)).map((d) => (
              <DirectorCard key={d.name} name={d.name} role={d.role} profile={d.profile} company={d.company ?? undefined} linkedin={d.linkedin ?? undefined} />
            ))}
          </div>
        </section>

        {/* Diretores */}
        <section>
          <h2 className="text-lg font-semibold text-accent mb-4 uppercase tracking-wider">Diretoria Executiva</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {directors.filter((d) => !presidencia.includes(d.role) && !conselho.includes(d.role)).map((d) => (
              <DirectorCard key={d.name} name={d.name} role={d.role} profile={d.profile} company={d.company ?? undefined} linkedin={d.linkedin ?? undefined} />
            ))}
          </div>
        </section>

        {/* Nota */}
        <div className="mt-10 bg-white rounded-lg p-5 border border-corp-border">
          <p className="text-xs text-corp-muted">
            A presença do Consul-Geral como Presidente Honorário confere credibilidade diplomática significativa. Nota: não há representante dedicado para o Condado de Lee / Fort Myers — uma lacuna operacional importante.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-white rounded-lg p-8 border border-corp-border text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-3 text-corp-text">Quer fazer parte?</h3>
          <p className="text-corp-muted text-sm mb-6">
            A BSWFCC está sempre aberta a novos membros, parceiros estratégicos e voluntários que queiram contribuir para o crescimento da comunidade.
          </p>
          <a
            href="/register"
            className="inline-block px-8 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Cadastrar-se
          </a>
        </div>
      </main>
    </div>
  );
}
