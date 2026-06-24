"use client";

import { cn } from "@/lib/utils";

type TemplateType = "blank" | "brainstorming" | "orgchart" | "swot" | "project" | "weekly" | "goals" | "product" | "meeting";

type Template = {
  id: TemplateType;
  name: string;
  description: string;
  emoji: string;
  color: string;
  bgColor: string;
  tags: string[];
};

const TEMPLATES: Template[] = [
  {
    id: "blank",
    name: "Em Branco",
    description: "Comece do zero com total liberdade criativa.",
    emoji: "⬜",
    color: "#6366f1",
    bgColor: "#eef2ff",
    tags: ["simples"],
  },
  {
    id: "brainstorming",
    name: "Brainstorming",
    description: "Organize ideias em múltiplos eixos temáticos.",
    emoji: "💡",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    tags: ["criatividade", "ideias"],
  },
  {
    id: "orgchart",
    name: "Organograma",
    description: "Visualize hierarquias e estruturas organizacionais.",
    emoji: "🏢",
    color: "#06b6d4",
    bgColor: "#ecfeff",
    tags: ["equipe", "empresa"],
  },
  {
    id: "swot",
    name: "Análise SWOT",
    description: "Forças, fraquezas, oportunidades e ameaças.",
    emoji: "📊",
    color: "#10b981",
    bgColor: "#ecfdf5",
    tags: ["estratégia", "negócios"],
  },
  {
    id: "project",
    name: "Plano de Projeto",
    description: "Mapeie fases, entregas e responsabilidades.",
    emoji: "🚀",
    color: "#8b5cf6",
    bgColor: "#f5f3ff",
    tags: ["gestão", "projeto"],
  },
  {
    id: "weekly",
    name: "Planejamento Semanal",
    description: "Organize sua semana em dias e tarefas.",
    emoji: "📅",
    color: "#ec4899",
    bgColor: "#fdf2f8",
    tags: ["produtividade"],
  },
  {
    id: "goals",
    name: "Metas e Objetivos",
    description: "Defina metas de curto, médio e longo prazo.",
    emoji: "🎯",
    color: "#f97316",
    bgColor: "#fff7ed",
    tags: ["pessoal", "crescimento"],
  },
  {
    id: "product",
    name: "Mapa de Produto",
    description: "Features, roadmap e prioridades de produto.",
    emoji: "📦",
    color: "#3b82f6",
    bgColor: "#eff6ff",
    tags: ["produto", "tech"],
  },
  {
    id: "meeting",
    name: "Pauta de Reunião",
    description: "Estruture tópicos, responsáveis e próximos passos.",
    emoji: "🤝",
    color: "#64748b",
    bgColor: "#f8fafc",
    tags: ["reunião", "time"],
  },
];

// Mini visual preview renders a tiny "mock" of the map structure
function MapPreview({ template }: { template: Template }) {
  const { color } = template;

    if (template.id === "blank") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-10 h-10 rounded-lg border-2 border-dashed border-[var(--line)] flex items-center justify-center text-[var(--muted)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    );
  }

  if (template.id === "orgchart") {
    return (
      <svg viewBox="0 0 120 80" className="w-full h-full" style={{maxHeight: 80}}>
        {/* Root */}
        <rect x="42" y="4" width="36" height="14" rx="4" fill={color} opacity="0.9"/>
        {/* Branches */}
        <line x1="60" y1="18" x2="28" y2="38" stroke={color} strokeWidth="1.5" opacity="0.5"/>
        <line x1="60" y1="18" x2="92" y2="38" stroke={color} strokeWidth="1.5" opacity="0.5"/>
        <rect x="8" y="38" width="40" height="12" rx="3" fill={color} opacity="0.6"/>
        <rect x="72" y="38" width="40" height="12" rx="3" fill={color} opacity="0.6"/>
        {/* Sub */}
        <line x1="28" y1="50" x2="18" y2="64" stroke={color} strokeWidth="1" opacity="0.4"/>
        <line x1="28" y1="50" x2="38" y2="64" stroke={color} strokeWidth="1" opacity="0.4"/>
        <line x1="92" y1="50" x2="82" y2="64" stroke={color} strokeWidth="1" opacity="0.4"/>
        <line x1="92" y1="50" x2="102" y2="64" stroke={color} strokeWidth="1" opacity="0.4"/>
        <rect x="10" y="64" width="16" height="10" rx="2" fill={color} opacity="0.4"/>
        <rect x="30" y="64" width="16" height="10" rx="2" fill={color} opacity="0.4"/>
        <rect x="74" y="64" width="16" height="10" rx="2" fill={color} opacity="0.4"/>
        <rect x="94" y="64" width="16" height="10" rx="2" fill={color} opacity="0.4"/>
      </svg>
    );
  }

  if (template.id === "swot") {
    const c = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"];
    return (
      <svg viewBox="0 0 120 80" className="w-full h-full" style={{maxHeight: 80}}>
        <rect x="4" y="4" width="52" height="34" rx="4" fill={c[0]} opacity="0.2" stroke={c[0]} strokeWidth="1.5"/>
        <text x="30" y="24" textAnchor="middle" fill={c[0]} fontSize="10" fontWeight="700">Forças</text>
        <rect x="64" y="4" width="52" height="34" rx="4" fill={c[1]} opacity="0.2" stroke={c[1]} strokeWidth="1.5"/>
        <text x="90" y="24" textAnchor="middle" fill={c[1]} fontSize="10" fontWeight="700">Fraquezas</text>
        <rect x="4" y="44" width="52" height="32" rx="4" fill={c[2]} opacity="0.2" stroke={c[2]} strokeWidth="1.5"/>
        <text x="30" y="63" textAnchor="middle" fill={c[2]} fontSize="10" fontWeight="700">Oportunidades</text>
        <rect x="64" y="44" width="52" height="32" rx="4" fill={c[3]} opacity="0.2" stroke={c[3]} strokeWidth="1.5"/>
        <text x="90" y="63" textAnchor="middle" fill={c[3]} fontSize="10" fontWeight="700">Ameaças</text>
      </svg>
    );
  }

  if (template.id === "weekly") {
    const days = ["S", "T", "Q", "Q", "S"];
    return (
      <svg viewBox="0 0 120 80" className="w-full h-full" style={{maxHeight: 80}}>
        {/* Root */}
        <rect x="44" y="30" width="32" height="20" rx="5" fill={color} opacity="0.9"/>
        <text x="60" y="44" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">Semana</text>
        {days.map((d, i) => {
          const angle = (i / days.length) * Math.PI * 1.5 - Math.PI * 0.75;
          const bx = 60 + Math.cos(angle) * 40;
          const by = 40 + Math.sin(angle) * 32;
          return (
            <g key={i}>
              <line x1="60" y1="40" x2={bx} y2={by} stroke={color} strokeWidth="1.5" opacity="0.4"/>
              <circle cx={bx} cy={by} r="10" fill={color} opacity={0.5 + i * 0.08}/>
              <text x={bx} y={by + 4} textAnchor="middle" fill="white" fontSize="8" fontWeight="700">{d}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  // Default radial brainstorming/project/goals/product/meeting
  const branches = [
    { angle: -45 }, { angle: 0 }, { angle: 45 }, { angle: 135 }, { angle: 180 }, { angle: -135 }
  ].slice(0, template.id === "meeting" ? 4 : template.id === "goals" ? 3 : 5);

  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" style={{maxHeight: 80}}>
      <rect x="46" y="28" width="28" height="24" rx="5" fill={color} opacity="0.9"/>
      {branches.map((b, i) => {
        const rad = (b.angle * Math.PI) / 180;
        const bx = 60 + Math.cos(rad) * 36;
        const by = 40 + Math.sin(rad) * 28;
        const lx1 = bx + Math.cos(rad) * 12;
        const ly1 = by + Math.sin(rad) * 8;
        const lx2 = bx + Math.cos(rad) * 22;
        const ly2 = by + Math.sin(rad + 0.4) * 8;
        return (
          <g key={i}>
            <line x1="60" y1="40" x2={bx} y2={by} stroke={color} strokeWidth="1.5" opacity="0.5"/>
            <rect x={bx - 12} y={by - 6} width="24" height="12" rx="3" fill={color} opacity={0.6 - i * 0.05}/>
            <line x1={bx} y1={by} x2={lx1} y2={ly1} stroke={color} strokeWidth="1" opacity="0.3"/>
            <rect x={lx1 - 8} y={ly1 - 4} width="16" height="8" rx="2" fill={color} opacity="0.3"/>
          </g>
        );
      })}
    </svg>
  );
}

type Props = {
  onUseTemplate: (type: TemplateType, name: string) => void;
};

export function TemplateGallery({ onUseTemplate }: Props) {
  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Modelos prontos</h1>
        <p className="text-[var(--muted)] text-sm">Escolha um modelo com a estrutura já montada e personalize do seu jeito.</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onUseTemplate(template.id, template.name)}
            className="group text-left rounded-xl border border-[var(--line)] bg-[var(--background)] hover:border-[var(--muted)] hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            {/* Preview */}
            <div
              className="h-36 w-full flex items-center justify-center p-4 relative overflow-hidden"
              style={{ backgroundColor: template.bgColor }}
            >
              <MapPreview template={template} />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span
                  className="text-sm font-bold px-4 py-2 rounded-full text-white shadow-lg"
                  style={{ backgroundColor: template.color }}
                >
                  Usar modelo
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{template.emoji}</span>
                <span className="font-bold text-[var(--foreground)] text-sm">{template.name}</span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{template.description}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {template.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: template.color, backgroundColor: template.bgColor }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
