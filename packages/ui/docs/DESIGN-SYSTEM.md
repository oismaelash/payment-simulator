# 🎨 Design System — Payment Simulator Landing Page

Este documento descreve o sistema de design utilizado na landing page do **Payment Simulator**, uma ferramenta open-source para desenvolvedores.

---

## Índice

- [Filosofia de design](#filosofia-de-design)
- [Paleta de cores](#paleta-de-cores)
- [Tipografia](#tipografia)
- [Espaçamento e layout](#espacamento-e-layout)
- [Componentes](#componentes)
  - [Botões](#botoes)
  - [Cards](#cards)
  - [Code block / terminal](#code-block--terminal)
  - [Badges](#badges)
  - [Navbar](#navbar)
- [Efeitos visuais](#efeitos-visuais)
- [Animações](#animacoes)
- [Classes utilitárias](#classes-utilitarias)
- [Referências de inspiração](#referencias-de-inspiracao)
- [Checklist de consistência](#checklist-de-consistencia)
- [Notas de implementação](#notas-de-implementacao)

---

## Filosofia de design

| Princípio | Descrição |
| --- | --- |
| **Dark Mode First** | Interface escura como padrão, reduzindo fadiga visual |
| **Developer-Centric** | Estética de ferramentas de desenvolvimento (terminais, CLI) |
| **Minimalismo Técnico** | Sem ilustrações genéricas, foco em diagramas e código |
| **Clareza** | Hierarquia visual clara, sem ruído |
| **Consistência** | Componentes reutilizáveis com padrões definidos |

---

## Paleta de cores

### Cores principais

| Token | HSL | Uso |
| --- | --- | --- |
| `--background` | `222 47% 6%` | Fundo principal da página |
| `--foreground` | `210 40% 98%` | Texto principal |
| `--primary` | `172 66% 50%` | Cor de destaque (teal/cyan) |
| `--primary-foreground` | `222 47% 6%` | Texto sobre elementos primários |

### Cores secundárias

| Token | HSL | Uso |
| --- | --- | --- |
| `--secondary` | `217 33% 12%` | Elementos secundários, cards |
| `--secondary-foreground` | `210 40% 98%` | Texto sobre secundários |
| `--muted` | `217 33% 15%` | Fundos sutis |
| `--muted-foreground` | `215 20% 55%` | Texto de menor importância |

### Cores de interface

| Token | HSL | Uso |
| --- | --- | --- |
| `--border` | `217 33% 18%` | Bordas de cards e separadores |
| `--ring` | `172 66% 50%` | Foco e estados de interação |
| `--accent` | `217 33% 15%` | Destaques sutis |
| `--accent-foreground` | `210 40% 98%` | Texto sobre accent |

### Cores semânticas

| Token | HSL | Uso |
| --- | --- | --- |
| `--destructive` | `0 63% 31%` | Ações destrutivas, erros |
| `--success` | `142 76% 36%` | Sucesso, confirmações |
| `--warning` | `38 92% 50%` | Avisos |

### Cores especiais

| Token | HSL | Uso |
| --- | --- | --- |
| `--code-bg` | `220 27% 10%` | Fundo de blocos de código |
| `--glow` | `172 66% 50%` | Efeitos de brilho |

### HEX equivalentes (referência rápida)

- **Background**: `#0a0f1a`
- **Foreground**: `#f8fafc`
- **Primary (teal)**: `#2dd4bf`
- **Secondary**: `#151c2c`
- **Border**: `#1e293b`
- **Muted text**: `#64748b`
- **Success**: `#22c55e`
- **Warning**: `#f59e0b`
- **Destructive**: `#7f1d1d`

---

## Tipografia

### Famílias de fonte

| Tipo | Fonte | Fallback | Uso |
| --- | --- | --- | --- |
| `font-sans` | Inter | system-ui, sans-serif | Texto geral, títulos, parágrafos |
| `font-mono` | JetBrains Mono | Consolas, monospace | Código, comandos CLI, terminal |

### Escala tipográfica

| Classe | Tamanho | Peso | Uso |
| --- | --- | --- | --- |
| `text-5xl md:text-7xl` | 3rem / 4.5rem | `font-bold` | Hero headline |
| `text-3xl md:text-4xl` | 1.875rem / 2.25rem | `font-bold` | Títulos de seção |
| `text-xl` | 1.25rem | `font-normal` | Subtítulos |
| `text-lg` | 1.125rem | `font-medium` | Títulos de cards |
| `text-base` | 1rem | `font-normal` | Corpo de texto |
| `text-sm` | 0.875rem | `font-normal` | Texto secundário, labels |
| `text-xs` | 0.75rem | `font-medium` | Badges, tags |

### Line height

- **Títulos**: `leading-tight` (1.25)
- **Corpo**: `leading-relaxed` (1.625)

---

## Espaçamento e layout

### Container principal

```css
.section-container {
  max-width: 72rem; /* max-w-6xl = 1152px */
  margin: 0 auto;
  padding-left: 1rem; /* px-4 */
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .section-container {
    padding-left: 1.5rem; /* sm:px-6 */
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .section-container {
    padding-left: 2rem; /* lg:px-8 */
    padding-right: 2rem;
  }
}
```

### Espaçamento vertical de seções

| Uso | Classe | Mobile | Desktop |
| --- | --- | --- | --- |
| Seção principal | `py-20 md:py-28` | 5rem | 7rem |
| Seção secundária | `py-16 md:py-20` | 4rem | 5rem |

### Gap padrão

| Uso | Classe | Valor |
| --- | --- | --- |
| Entre cards | `gap-6` ou `gap-8` | 1.5rem / 2rem |
| Entre elementos inline | `gap-4` | 1rem |
| Entre textos | `space-y-4` | 1rem |

### Border radius

| Token / classe | Valor | Uso |
| --- | --- | --- |
| `--radius` | 0.75rem | Cards, botões, inputs |
| `rounded-xl` | 0.75rem | Cards principais |
| `rounded-lg` | 0.5rem | Elementos menores |
| `rounded-full` | 9999px | Badges, avatares |

---

## Componentes

### Botões

#### Variantes disponíveis

| Variante | Descrição | Uso |
| --- | --- | --- |
| `default` | Fundo primário, texto escuro | CTAs padrão |
| `outline` | Borda, fundo transparente | Ações secundárias |
| `hero` | Primário com efeito glow | CTA principal do hero |
| `hero-outline` | Outline com hover glow | CTA secundário do hero |
| `ghost` | Sem fundo, hover sutil | Navegação, links |
| `link` | Estilo de link com underline | Links inline |
| `destructive` | Vermelho para ações perigosas | Deletar, cancelar |

#### Tamanhos

| Size | Altura | Padding | Uso |
| --- | --- | --- | --- |
| `sm` | 2.25rem | `px-3` | Botões compactos |
| `default` | 2.5rem | `px-4 py-2` | Uso geral |
| `lg` | 2.75rem | `px-8` | CTAs principais |
| `icon` | 2.5rem × 2.5rem | — | Botões de ícone |

#### Exemplos

```tsx
// CTA Principal
<Button variant="hero" size="lg">
  Run locally in minutes
</Button>

// CTA Secundário
<Button variant="hero-outline" size="lg">
  View on GitHub
</Button>
```

### Cards

#### Feature card (CSS)

```css
.feature-card {
  background: hsl(var(--secondary));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: hsl(var(--primary) / 0.3);
  transform: translateY(-2px);
}
```

#### Estrutura (JSX)

```tsx
<div className="bg-secondary border border-border rounded-xl p-6 hover:border-primary/30 transition-all">
  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-primary" />
  </div>
  <h3 className="text-lg font-semibold mb-2">Título</h3>
  <p className="text-muted-foreground text-sm">Descrição</p>
</div>
```

### Code block / terminal

#### Code block (CSS)

```css
.code-block {
  background: hsl(var(--code-bg));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: 1rem;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.875rem;
  overflow-x: auto;
}
```

#### Terminal preview (JSX)

```tsx
<div className="bg-code-bg border border-border rounded-xl overflow-hidden">
  {/* Barra do terminal */}
  <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
    <div className="w-3 h-3 rounded-full bg-red-500" />
    <div className="w-3 h-3 rounded-full bg-yellow-500" />
    <div className="w-3 h-3 rounded-full bg-green-500" />
    <span className="ml-2 text-xs text-muted-foreground">terminal</span>
  </div>

  {/* Conteúdo */}
  <div className="p-4 font-mono text-sm">
    <span className="text-muted-foreground">$</span>
    <span className="text-primary ml-2">npx payment-simulator start</span>
  </div>
</div>
```

### Badges

```tsx
// Badge padrão
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
  Open Source
</span>

// Badge de status
<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
  Free
</span>
```

### Navbar

```tsx
<nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      {/* Links */}
      {/* CTA */}
    </div>
  </div>
</nav>
```

---

## Efeitos visuais

### Glow (brilho)

```css
/* Glow padrão */
.glow {
  box-shadow:
    0 0 20px hsl(var(--glow) / 0.3),
    0 0 40px hsl(var(--glow) / 0.2),
    0 0 60px hsl(var(--glow) / 0.1);
}

/* Glow pequeno */
.glow-sm {
  box-shadow:
    0 0 10px hsl(var(--glow) / 0.2),
    0 0 20px hsl(var(--glow) / 0.1);
}
```

### Sombra de terminal

```css
.terminal-shadow {
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px hsl(var(--border));
}
```

### Gradientes

```css
/* Gradiente de texto */
.text-gradient {
  background: linear-gradient(135deg, hsl(var(--primary)), hsl(172 66% 70%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Gradiente de fundo hero */
.hero-gradient {
  background: radial-gradient(
    ellipse 80% 50% at 50% -20%,
    hsl(var(--primary) / 0.15),
    transparent
  );
}
```

### Padrões de fundo

```css
/* Grid pattern */
.bg-grid-pattern {
  background-image:
    linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px),
    linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Dot pattern */
.bg-dot-pattern {
  background-image: radial-gradient(hsl(var(--border) / 0.5) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### Glassmorphism

```css
.glass {
  background: hsl(var(--background) / 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

---

## Animações

### Keyframes definidos

```css
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 20px hsl(var(--glow) / 0.3);
  }
  50% {
    box-shadow: 0 0 40px hsl(var(--glow) / 0.5);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### Classes de animação

| Classe | Duração | Uso |
| --- | --- | --- |
| `animate-float` | 3s infinite | Elementos flutuantes |
| `animate-pulse-glow` | 2s infinite | Destaque pulsante |
| `animate-slide-up` | 0.5s ease-out | Entrada de elementos |
| `animate-fade-in` | 0.3s ease-out | Fade in suave |

### Animações existentes (Tailwind)

- `animate-accordion-down` / `animate-accordion-up`
- `animate-scale-in` / `animate-scale-out`
- `animate-slide-in-right` / `animate-slide-out-right`

---

## Classes utilitárias

### Texto

```css
/* Texto com gradiente */
.text-gradient {
  @apply bg-gradient-to-r from-primary to-teal-300 bg-clip-text text-transparent;
}

/* Texto muted */
.text-muted {
  @apply text-muted-foreground;
}
```

### Interatividade

```css
/* Hover scale */
.hover-scale {
  @apply transition-transform duration-200 hover:scale-105;
}

/* Link com underline animado */
.story-link {
  @apply relative inline-block;
}

.story-link::after {
  content: "";
  @apply absolute w-full scale-x-0 h-0.5 bottom-0 left-0 bg-primary origin-bottom-right transition-transform duration-300;
}

.story-link:hover::after {
  @apply scale-x-100 origin-bottom-left;
}
```

### Focus states

```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background;
}
```

---

## Referências de inspiração

| Produto | Elemento inspirado |
| --- | --- |
| Firebase Emulator Suite | UI de simulador, organização |
| Stripe Docs | Clareza técnica, blocos de código |
| Vercel Dashboard | Dark mode, minimalismo |
| Linear | Efeitos de glow, animações suaves |
| Raycast | Estética developer-first |

---

## Checklist de consistência

- Usar sempre **`font-mono`** para código
- Manter contraste mínimo de **4.5:1** para texto
- Usar **`border-border`** para todas as bordas
- Aplicar **`transition-all`** em elementos interativos
- Usar **`rounded-xl`** para cards e **`rounded-lg`** para elementos menores
- Manter espaçamento vertical consistente entre seções

---

## Notas de implementação

- **Dark Mode**: este design é dark-first; não há light mode implementado.
- **Responsividade**: componentes usam breakpoints `sm`, `md`, `lg`.
- **Acessibilidade**: usar `sr-only` para labels de ícones.
- **Performance**: animações usam `transform` e `opacity` para melhor uso de GPU.

---

Design System v1.0 — Payment Simulator Landing Page
