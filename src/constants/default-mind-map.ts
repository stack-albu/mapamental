import type { MindMap, MindMapEdge, MindMapInput, MindMapNode, MindMapNodeSide } from "@/types/mind-map";

export const nodeColors = [
  "#2f67ff",
  "#8f63ff",
  "#ff4f86",
  "#ff3b1f",
  "#ffc400",
  "#17c9d2",
  "#29c63f",
  "#8bd600",
  "#ff9f00",
];

const rootColor = "#cbb7ff";

type BranchSeed = {
  id: string;
  label: string;
  color: string;
  side: MindMapNodeSide;
  x: number;
  y: number;
  leaves: string[];
};

const branches: BranchSeed[] = [
  {
    id: "espionagem-oferta",
    label: "1- Espionagem da oferta",
    color: nodeColors[0],
    side: "right",
    x: 300,
    y: -300,
    leaves: [
      "VSL ou página estática?",
      "Salvar criativos + landing page",
      "Mapear: headline, bullets, CTA",
      "Checkout + upsell + order bump",
    ],
  },
  {
    id: "produto-diferenciacao",
    label: "2- Produto e diferenciação",
    color: nodeColors[1],
    side: "right",
    x: 315,
    y: -120,
    leaves: [
      "PLR, MRR ou conteúdo próprio?",
      "Verificar margem e demanda",
      "Diferencial: bônus, formato, grupo",
      "Estrutura: módulos, aulas, extras",
    ],
  },
  {
    id: "copy-pagina",
    label: "3- Copy da página de vendas",
    color: nodeColors[2],
    side: "right",
    x: 320,
    y: 80,
    leaves: [
      "Headline: promessa + resultado",
      "Prova social + depoimentos",
      "Garantia + escassez + urgência",
      "Dor -> Solução -> Benefícios",
      "Bônus + ancoragem de preço",
      "FAQ respondendo objeções",
    ],
  },
  {
    id: "montagem-tecnica",
    label: "4- Montagem técnica da página",
    color: nodeColors[3],
    side: "right",
    x: 310,
    y: 290,
    leaves: [
      "Plataforma: Kiwify, Cartpanda, Hotmart",
      "Mobile-first + velocidade",
      "Pixel + eventos: PageView, Purchase",
      "Compra teste + thank you page",
    ],
  },
  {
    id: "otimizacao-escala",
    label: "9- Otimização e escala",
    color: nodeColors[4],
    side: "right",
    x: 300,
    y: 510,
    leaves: [
      "Novos criativos semanalmente",
      "Remarketing para não-compradores",
      "+20-30% orçamento por vez",
      "Order bump + upsell = ticket médio ↑",
    ],
  },
  {
    id: "vsl",
    label: "5- VSL (Vídeo de vendas)",
    color: nodeColors[5],
    side: "left",
    x: -330,
    y: -250,
    leaves: [
      "Hook forte nos 5-10s iniciais",
      "Duração: 5-12 min (low ticket)",
      "Legendas + cortes dinâmicos",
      "Dor -> Solução -> Oferta -> CTA",
    ],
  },
  {
    id: "criativos-anuncios",
    label: "6- Criativos dos anúncios",
    color: nodeColors[6],
    side: "left",
    x: -340,
    y: -30,
    leaves: [
      "3-5 ângulos: dor, resultado, prova",
      "Feed 1:1 / Stories 9:16 / Reels",
      "Vídeos 15-30s: hook nos 3s iniciais",
      "Copy anúncio: 3-5 variações de texto",
    ],
  },
  {
    id: "gerenciador-anuncios",
    label: "7- Gerenciador de anúncios",
    color: nodeColors[7],
    side: "left",
    x: -360,
    y: 220,
    leaves: [
      "Campanha: Vendas + CBO + BIDCAP",
      "Público amplo (broad) + 2 interesses",
      "3-5 criativos por conjunto",
      "URL com UTMs + preview mobile",
      "Advantage+ Placements (auto)",
      "Pixel + evento: Purchase",
    ],
  },
  {
    id: "lancamento-analise",
    label: "8- Lançamento e análise",
    color: nodeColors[8],
    side: "left",
    x: -330,
    y: 450,
    leaves: [
      "Aguardar aprendizado: 3-4 dias",
      "Métricas: CPM, CTR, CPA, ROAS e +",
      "Não editar nas primeiras 48h",
      "Pausar perdedores, escalar vencedores",
    ],
  },
];

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
      const n = Number(c);
      return (n ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (n / 4)))).toString(16);
    });
  }
  // Ultimate fallback using Math.random for environments without crypto
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
    const n = Number(c);
    return (n ^ (Math.random() * 16 >> (n / 4))).toString(16);
  });
}

function node(id: string, label: string, color: string, x: number, y: number, side?: MindMapNodeSide, variant: MindMapNode["data"]["variant"] = "leaf", note = ""): MindMapNode {
  return {
    id,
    type: "mindMapNode",
    position: { x, y },
    data: { label, note, color, side, variant },
  };
}

function edge(source: string, target: string, color: string, side: MindMapNodeSide, fromRoot = false): MindMapEdge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    sourceHandle: fromRoot ? side : `${side}-source`,
    targetHandle: side === "right" ? "left-target" : "right-target",
    type: "bezier",
    animated: false,
    style: { stroke: color, strokeWidth: fromRoot ? 3 : 1.8 },
  };
}

function createRadialMap(input: MindMapInput): Pick<MindMap, "nodes" | "edges"> {
  const nodes: MindMapNode[] = [
    node(
      "root",
      input.title,
      rootColor,
      0,
      0,
      undefined,
      "root",
      input.description ?? "Do zero ao gerenciador de anúncios",
    ),
  ];
  const edges: MindMapEdge[] = [];

  branches.forEach((branch) => {
    nodes.push(node(branch.id, branch.label, branch.color, branch.x, branch.y, branch.side, "branch"));
    edges.push(edge("root", branch.id, branch.color, branch.side, true));

    branch.leaves.forEach((leaf, index) => {
      const leafId = `${branch.id}-leaf-${index + 1}`;
      const offset = (index - (branch.leaves.length - 1) / 2) * 44;
      const leafX = branch.side === "right" ? branch.x + 255 : branch.x - 285;
      const leafY = branch.y + offset;
      nodes.push(node(leafId, leaf, branch.color, leafX, leafY, branch.side, "leaf"));
      edges.push(edge(branch.id, leafId, branch.color, branch.side));
    });
  });

  return { nodes, edges };
}

export function createMindMap(input: MindMapInput): MindMap {
  const now = new Date().toISOString();
  const radialMap = createRadialMap(input);

  return {
    id: createId(),
    title: input.title,
    description: input.description ?? "",
    status: "active",
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
    nodes: radialMap.nodes,
    edges: radialMap.edges,
  };
}

export function createTemplateMap(type: string, title: string): MindMap {
  const now = new Date().toISOString();
  const id = createId();

  const nodes: MindMapNode[] = [
    node("root", title, rootColor, 0, 0, undefined, "root", "")
  ];
  const edges: MindMapEdge[] = [];

  type BranchDef = { id: string; label: string; color: string; side: MindMapNodeSide; x: number; y: number; leaves: string[] };

  const addBranches = (defs: BranchDef[]) => {
    defs.forEach(b => {
      nodes.push(node(b.id, b.label, b.color, b.x, b.y, b.side, "branch"));
      edges.push(edge("root", b.id, b.color, b.side, true));
      b.leaves.forEach((leaf, i) => {
        const leafId = `${b.id}-l${i + 1}`;
        const leafX = b.side === "right" ? b.x + 215 : b.x - 215;
        const offset = (i - (b.leaves.length - 1) / 2) * 44;
        const leafY = b.y + offset;
        nodes.push(node(leafId, leaf, b.color, leafX, leafY, b.side, "leaf"));
        edges.push(edge(b.id, leafId, b.color, b.side));
      });
    });
  };

  if (type === "brainstorming") {
    addBranches([
      { id: "b1", label: "Tópico A", color: nodeColors[0], side: "right", x: 250, y: -140, leaves: ["Ideia", "Ideia"] },
      { id: "b2", label: "Tópico B", color: nodeColors[1], side: "right", x: 250, y: 0,    leaves: ["Ideia", "Ideia"] },
      { id: "b3", label: "Tópico C", color: nodeColors[2], side: "right", x: 250, y: 140,  leaves: ["Ideia", "Ideia"] },
      { id: "b4", label: "Tópico D", color: nodeColors[3], side: "left",  x: -250, y: -140, leaves: ["Ideia", "Ideia"] },
      { id: "b5", label: "Tópico E", color: nodeColors[4], side: "left",  x: -250, y: 0,    leaves: ["Ideia", "Ideia"] },
      { id: "b6", label: "Tópico F", color: nodeColors[5], side: "left",  x: -250, y: 140,  leaves: ["Ideia", "Ideia"] },
    ]);
  } else if (type === "orgchart") {
    addBranches([
      { id: "b1", label: "Diretoria A", color: nodeColors[5], side: "right", x: 250, y: -120, leaves: ["Depto 1", "Depto 2", "Depto 3"] },
      { id: "b2", label: "Diretoria B", color: nodeColors[6], side: "right", x: 250, y: 120,  leaves: ["Depto 1", "Depto 2", "Depto 3"] },
    ]);
  } else if (type === "swot") {
    addBranches([
      { id: "b1", label: "Forças",        color: nodeColors[6], side: "right", x: 250, y: -80, leaves: ["Ponto 1", "Ponto 2"] },
      { id: "b2", label: "Fraquezas",     color: nodeColors[3], side: "right", x: 250, y: 80,  leaves: ["Ponto 1", "Ponto 2"] },
      { id: "b3", label: "Oportunidades", color: nodeColors[0], side: "left",  x: -250, y: -80, leaves: ["Ponto 1", "Ponto 2"] },
      { id: "b4", label: "Ameaças",       color: nodeColors[2], side: "left",  x: -250, y: 80,  leaves: ["Ponto 1", "Ponto 2"] },
    ]);
  } else if (type === "project") {
    addBranches([
      { id: "b1", label: "Planejamento", color: nodeColors[1], side: "right", x: 250, y: -160, leaves: ["Escopo", "Prazo", "Recursos"] },
      { id: "b2", label: "Execução",     color: nodeColors[0], side: "right", x: 250, y: 0,    leaves: ["Tarefa 1", "Tarefa 2"] },
      { id: "b3", label: "Entregas",     color: nodeColors[6], side: "right", x: 250, y: 160,  leaves: ["Entrega 1", "Entrega 2"] },
      { id: "b4", label: "Riscos",       color: nodeColors[3], side: "left",  x: -250, y: -80, leaves: ["Risco 1", "Risco 2"] },
      { id: "b5", label: "Equipe",       color: nodeColors[5], side: "left",  x: -250, y: 80,  leaves: ["Responsável 1", "Responsável 2"] },
    ]);
  } else if (type === "weekly") {
    addBranches([
      { id: "b1", label: "Segunda",  color: nodeColors[0], side: "right", x: 250, y: -200, leaves: ["Tarefa", "Tarefa"] },
      { id: "b2", label: "Terça",    color: nodeColors[1], side: "right", x: 250, y: -60,  leaves: ["Tarefa", "Tarefa"] },
      { id: "b3", label: "Quarta",   color: nodeColors[2], side: "right", x: 250, y: 80,   leaves: ["Tarefa", "Tarefa"] },
      { id: "b4", label: "Quinta",   color: nodeColors[3], side: "left",  x: -250, y: -200, leaves: ["Tarefa", "Tarefa"] },
      { id: "b5", label: "Sexta",    color: nodeColors[4], side: "left",  x: -250, y: -60,  leaves: ["Tarefa", "Tarefa"] },
      { id: "b6", label: "Fim de semana", color: nodeColors[5], side: "left", x: -250, y: 80, leaves: ["Atividade", "Descanso"] },
    ]);
  } else if (type === "goals") {
    addBranches([
      { id: "b1", label: "Curto Prazo",  color: nodeColors[6], side: "right", x: 250, y: -80,  leaves: ["Meta 1", "Meta 2", "Meta 3"] },
      { id: "b2", label: "Médio Prazo",  color: nodeColors[4], side: "right", x: 250, y: 80,   leaves: ["Meta 1", "Meta 2"] },
      { id: "b3", label: "Longo Prazo",  color: nodeColors[1], side: "left",  x: -250, y: -80,  leaves: ["Visão 1", "Visão 2"] },
      { id: "b4", label: "Obstáculos",   color: nodeColors[3], side: "left",  x: -250, y: 80,   leaves: ["Obstáculo 1", "Obstáculo 2"] },
    ]);
  } else if (type === "product") {
    addBranches([
      { id: "b1", label: "Features",    color: nodeColors[0], side: "right", x: 250, y: -160, leaves: ["Feature 1", "Feature 2", "Feature 3"] },
      { id: "b2", label: "Roadmap",     color: nodeColors[1], side: "right", x: 250, y: 60,   leaves: ["Q1", "Q2", "Q3"] },
      { id: "b3", label: "Usuários",    color: nodeColors[5], side: "left",  x: -250, y: -80,  leaves: ["Persona 1", "Persona 2"] },
      { id: "b4", label: "Concorrentes",color: nodeColors[3], side: "left",  x: -250, y: 80,   leaves: ["Concorrente 1", "Concorrente 2"] },
    ]);
  } else if (type === "meeting") {
    addBranches([
      { id: "b1", label: "Pauta",             color: nodeColors[0], side: "right", x: 250, y: -80,  leaves: ["Item 1", "Item 2"] },
      { id: "b2", label: "Decisões",          color: nodeColors[6], side: "right", x: 250, y: 80,   leaves: ["Decisão 1", "Decisão 2"] },
      { id: "b3", label: "Ações (Action Items)", color: nodeColors[4], side: "left", x: -250, y: -80, leaves: ["Ação 1", "Ação 2"] },
      { id: "b4", label: "Próximos Passos",   color: nodeColors[1], side: "left",  x: -250, y: 80,   leaves: ["Passo 1", "Passo 2"] },
    ]);
  }
  // else type === "blank" — only root node, no branches

  return {
    id, title, description: "", status: "active", tags: [type], createdAt: now, updatedAt: now, nodes, edges
  };
}


export function createStarterMaps(): MindMap[] {
  return [
    createMindMap({
      title: "Low Ticket Infoproduto",
      description: "Mapa de operação para vender um low ticket com página, criativos, tráfego e análise.",
      tags: ["low-ticket", "tráfego", "oferta"],
    }),
  ];
}