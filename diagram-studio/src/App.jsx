import {
  lazy,
  memo,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Check,
  Database,
  FileJson2,
  Focus,
  GitBranch,
  Globe2,
  KeyRound,
  Layers3,
  LayoutDashboard,
  Moon,
  Network,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Truck,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
} from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  domains,
  downloadText,
  drawingSource,
  getScene,
  readSchema,
  roles,
  schemaSources,
} from "./data.js";
import { downloadSchemaPng } from "./schemaExport.js";

const DrawingCanvas = lazy(() => import("./DrawingCanvas.jsx"));

const pageMeta = {
  overview: {
    eyebrow: "WORKSPACE / OVERVIEW",
    title: "Your system, at a glance",
    description:
      "A visual home for the commerce model, user journeys, and platform architecture.",
  },
  model: {
    eyebrow: "WORKSPACE / DATA MODEL",
    title: "Commerce data model",
    description:
      "Explore collections, fields, and relationships from the original ERD files.",
  },
  journeys: {
    eyebrow: "WORKSPACE / ROLE JOURNEYS",
    title: "Four paths through the shop",
    description:
      "Customer, wholesale buyer, admin, and superadmin flows from the Excalidraw source.",
  },
  architecture: {
    eyebrow: "WORKSPACE / ARCHITECTURE",
    title: "How the platform connects",
    description:
      "The storefront, commerce API, data stores, CDN, and external services in one view.",
  },
};

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "model", label: "Data model", icon: Database },
  { id: "journeys", label: "Role journeys", icon: Route },
  { id: "architecture", label: "Architecture", icon: Network },
];

const domainTone = {
  identity:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  catalog:
    "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
  commerce:
    "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300",
  fulfillment:
    "bg-cyan-50 text-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-300",
};

const kickerClass =
  "text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground";
const surfaceClass =
  "rounded-xl border border-border bg-card text-card-foreground";
const toolbarClass =
  "flex flex-wrap items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-6";
const footerClass =
  "flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-6";

function iconForDomain(id) {
  return (
    { identity: Users, catalog: Boxes, commerce: Activity, fulfillment: Truck }[
      id
    ] || Layers3
  );
}

function Sidebar({ page, onPage }) {
  return (
    <aside className="sticky top-0 z-20 flex h-screen w-[68px] shrink-0 flex-col border-r border-border bg-card px-2 py-6 md:w-[244px] md:px-4 md:py-8">
      <div className="mb-10 flex items-center gap-3 px-2 md:px-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <span className="size-3.5 rotate-45 rounded-[2px] border-2 border-current" />
        </span>
        <span className="hidden min-w-0 md:block">
          <strong className="block text-xs font-bold tracking-[0.12em]">
            ARM FARMS
          </strong>
          <small className="mt-1 block text-[10px] font-semibold tracking-[0.13em] text-muted-foreground">
            SYSTEMS STUDIO
          </small>
        </span>
      </div>

      <span className={`${kickerClass} mb-3 hidden px-3 md:block`}>
        Workspace
      </span>
      <nav className="grid gap-1" aria-label="Main navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="ghost"
            aria-label={label}
            aria-current={page === id ? "page" : undefined}
            className={`h-11 w-full justify-center gap-3 px-0 text-muted-foreground md:justify-start md:px-3 ${page === id ? "bg-secondary font-semibold text-secondary-foreground hover:bg-secondary" : "hover:bg-muted hover:text-foreground"}`}
            onClick={() => onPage(id)}
          >
            <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
            <span className="hidden flex-1 text-left text-[13px] md:inline">
              {label}
            </span>
            {page === id && (
              <span className="hidden size-1.5 rounded-full bg-primary md:inline-block" />
            )}
          </Button>
        ))}
      </nav>

      <div className="mt-auto hidden md:block">
        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <Sparkles className="mb-3 size-5 text-primary" />
          <strong className="block text-xs font-semibold">
            Built for clarity
          </strong>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Focused views make large diagrams easier to explore and capture.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2.5 border-t border-border pt-4">
          <span className="grid size-9 place-items-center rounded-lg bg-secondary text-[11px] font-bold text-secondary-foreground">
            AF
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-xs">ARM Farms</strong>
            <small className="block text-[10px] text-muted-foreground">
              Ecommerce platform
            </small>
          </span>
          <span className="size-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>
    </aside>
  );
}

function Header({ page, onExport, busy, theme, onToggleTheme }) {
  const meta = pageMeta[page];
  return (
    <header className="flex min-h-[152px] flex-wrap items-center justify-between gap-5 border-b border-border bg-card/70 px-5 py-7 sm:px-8 lg:px-12">
      <div className="min-w-0">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-primary/70 dark:text-primary/80">
          <span className="h-px w-4 bg-current" />
          {meta.eyebrow}
        </div>
        <h1 className="text-[clamp(1.55rem,2.7vw,2.15rem)] font-semibold leading-tight tracking-[-0.045em]">
          {meta.title}
        </h1>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
          {meta.description}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Badge
          variant="outline"
          className="hidden h-8 gap-2 border-border bg-secondary/50 px-2.5 text-[9px] font-bold tracking-[0.08em] text-secondary-foreground xl:inline-flex"
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          SOURCE FILES CONNECTED
        </Badge>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
        {page !== "overview" && (
          <Button
            size="sm"
            className="h-8 px-3 text-xs sm:h-9 sm:px-4"
            onClick={onExport}
            disabled={busy}
          >
            <ArrowDownToLine className="size-4" />
            {busy ? "Exporting…" : "Export 3× PNG"}
          </Button>
        )}
      </div>
    </header>
  );
}

function SectionHeading({ kicker, title, note, className = "" }) {
  return (
    <div className={`mb-4 flex items-end justify-between gap-4 ${className}`}>
      <div>
        <div className={kickerClass}>{kicker}</div>
        <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      {note && (
        <span className="hidden text-[11px] text-muted-foreground sm:block">
          {note}
        </span>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, value, label, note }) {
  return (
    <Card className="gap-0 border-border bg-card py-0 shadow-none ring-0">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary">
            <Icon className="size-5" strokeWidth={1.8} />
          </span>
          <ArrowUpRight className="size-4 text-muted-foreground/50" />
        </div>
        <div className="mt-4 text-3xl font-semibold tracking-tight">
          {value}
        </div>
        <div className="mt-1 text-xs font-semibold">{label}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">{note}</div>
      </CardContent>
    </Card>
  );
}

function MiniFlow({ steps }) {
  return (
    <div className="my-4 flex min-h-12 items-center justify-center gap-1.5 overflow-hidden rounded-lg bg-muted/60 px-2">
      {steps.map((step, index) => (
        <span className="contents" key={step}>
          {index > 0 && <span className="h-px w-3 shrink-0 bg-border" />}
          <span className="whitespace-nowrap rounded border border-border bg-card px-2 py-1 text-[9px] font-medium text-muted-foreground">
            {step}
          </span>
        </span>
      ))}
    </div>
  );
}

function ExploreCard({
  icon: Icon,
  title,
  description,
  action,
  steps,
  onClick,
}) {
  return (
    <button
      className={`${surfaceClass} group min-h-[214px] w-full p-5 text-left transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}
      onClick={onClick}
    >
      <span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary">
        <Icon className="size-5" />
      </span>
      <MiniFlow steps={steps} />
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
        {action}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

function Overview({ onPage, model }) {
  const { tables, relationships, indexes } = model;
  return (
    <div className="max-w-[1360px]">
      <section className="grid items-center gap-8 rounded-2xl border border-border bg-secondary/60 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_0.9fr] lg:gap-12 lg:py-10">
        <div>
          <span
            className={`${kickerClass} inline-flex items-center gap-2 text-primary/75`}
          >
            <span className="size-1.5 rounded-full bg-emerald-500" />
            The system, mapped
          </span>
          <h2 className="mt-5 text-[clamp(2.1rem,4vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.055em]">
            Everything behind
            <br />
            <span className="text-primary/70">the storefront.</span>
          </h2>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            Browse the MongoDB model, follow each user journey, and see how the
            platform fits together.
          </p>
          <Button
            className="mt-6 h-9 px-4 text-xs"
            onClick={() => onPage("model")}
          >
            Explore the model <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="min-w-0 w-full justify-self-end rounded-xl border border-border bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
          <div className={kickerClass}>Platform map</div>
          <div className="mt-7 flex min-w-0 flex-col items-center justify-center gap-0 sm:flex-row sm:gap-2">
            <span className="whitespace-nowrap rounded-md border border-border bg-background px-3 py-2.5 text-[10px] font-semibold">
              Storefront
            </span>
            <span className="h-4 w-px shrink-0 bg-border sm:h-px sm:min-w-2 sm:flex-1" />
            <span className="whitespace-nowrap rounded-md border border-border bg-secondary px-3 py-2.5 text-[10px] font-semibold text-secondary-foreground">
              Commerce API
            </span>
            <span className="h-4 w-px shrink-0 bg-border sm:h-px sm:min-w-2 sm:flex-1" />
            <span className="whitespace-nowrap rounded-md border border-border bg-background px-3 py-2.5 text-[10px] font-semibold">
              MongoDB
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="h-4 w-px bg-border sm:h-5" />
            <span className="rounded-md border border-border bg-muted px-3 py-1.5 text-[9px] font-medium text-muted-foreground">
              Redis cache
            </span>
          </div>
        </div>
      </section>
      <SectionHeading
        kicker="Project snapshot"
        title="Everything in one view"
        note={`Current ERD · ${schemaSources[0].file}`}
        className="mt-8"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Boxes}
          value={tables.length}
          label="Collections"
          note="Across four business domains"
        />
        <MetricCard
          icon={GitBranch}
          value={relationships.length}
          label="Relationships"
          note="Mapped from the ERD source"
        />
        <MetricCard
          icon={Users}
          value="04"
          label="User journeys"
          note="From signup to fulfillment"
        />
        <MetricCard
          icon={Layers3}
          value={schemaSources.length}
          label="Schema versions"
          note={`${indexes} modeled indexes in current`}
        />
      </div>
      <SectionHeading
        kicker="Explore the system"
        title="Choose a lens"
        className="mt-9"
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <ExploreCard
          icon={Database}
          title="Data model"
          description="Browse every collection, inspect fields, and trace how the schema connects."
          action="Open diagram"
          steps={["organizations", "products", "orders"]}
          onClick={() => onPage("model")}
        />
        <ExploreCard
          icon={Route}
          title="Role journeys"
          description="Follow customer, wholesale buyer, admin, and superadmin paths."
          action="View journeys"
          steps={["01", "02", "03", "04"]}
          onClick={() => onPage("journeys")}
        />
        <ExploreCard
          icon={Network}
          title="Architecture"
          description="See the application layers, integrations, and data boundaries."
          action="View architecture"
          steps={["CDN", "API", "Redis", "DB"]}
          onClick={() => onPage("architecture")}
        />
      </div>
    </div>
  );
}

const TableNode = memo(function TableNode({ data, selected }) {
  const Icon = iconForDomain(data.domain);
  return (
    <div
      className={`w-[350px] overflow-hidden rounded-xl border bg-card text-card-foreground shadow-md shadow-black/5 dark:shadow-black/20 ${selected ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-lg ${domainTone[data.domain] || domainTone.identity}`}
        >
          <Icon className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-xs font-semibold">
            {data.name}
          </strong>
          <small className="mt-0.5 block truncate text-[9px] text-muted-foreground">
            {data.comment || "MongoDB collection"}
          </small>
        </div>
        <span className="rounded bg-muted px-1.5 py-1 text-[9px] text-muted-foreground">
          {data.fields.length}
        </span>
      </div>
      <div className="py-2">
        {data.fields.slice(0, 5).map((field) => (
          <div
            className="flex items-center gap-2 px-4 py-1 text-[10px]"
            key={field.id}
          >
            <span
              className={`size-1.5 shrink-0 rounded-full ${field.name === "_id" ? "bg-primary" : "bg-border"}`}
            />
            <span className="min-w-0 flex-1 truncate text-foreground/80">
              {field.name}
            </span>
            <span className="max-w-24 truncate text-[9px] text-muted-foreground">
              {field.dataType || "—"}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-2 text-[9px] text-muted-foreground">
        <span>
          {data.fields.length > 5
            ? `+ ${data.fields.length - 5} more fields`
            : "All fields shown"}
        </span>
        <ArrowUpRight className="size-3.5" />
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

const nodeTypes = { table: TableNode };

function createGraph(model, domainId, query, theme = "light") {
  const needle = query.trim().toLowerCase();
  const tables = model.tables.filter((table) => {
    if (domainId !== "all" && table.domain !== domainId) return false;
    return (
      !needle ||
      table.name.toLowerCase().includes(needle) ||
      (table.comment || "").toLowerCase().includes(needle) ||
      table.fields.some((field) => field.name.toLowerCase().includes(needle))
    );
  });
  const cols = domainId === "all" ? 4 : 2;
  const nodes = tables.map((table, index) => ({
    id: table.id,
    type: "table",
    position: {
      x: (index % cols) * 425 + 46,
      y: Math.floor(index / cols) * 345 + 48,
    },
    data: table,
    draggable: false,
    selectable: true,
  }));
  const visibleIds = new Set(tables.map((table) => table.id));
  const edgeColor = theme === "dark" ? "#557761" : "#aec3b2";
  const edges = model.relationships
    .filter(
      (rel) =>
        visibleIds.has(rel.start?.tableId) && visibleIds.has(rel.end?.tableId),
    )
    .map((rel) => ({
      id: rel.id,
      source: rel.start.tableId,
      target: rel.end.tableId,
      type: "smoothstep",
      animated: false,
      style: { stroke: edgeColor, strokeWidth: 1.7 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edgeColor,
        width: 14,
        height: 14,
      },
    }));
  return { nodes, edges, tables };
}

function Inspector({ table, relationships, onClose }) {
  if (!table)
    return (
      <aside className="grid max-h-[300px] min-h-[300px] place-items-center border-t border-border bg-card text-center lg:max-h-[610px] lg:min-h-[610px] lg:border-l lg:border-t-0">
        <div className="max-w-48 p-5 text-muted-foreground">
          <Focus className="mx-auto size-7" />
          <h3 className="mt-2 text-xs font-semibold text-foreground">
            Select a collection
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed">
            Click a collection in the diagram to inspect its fields and
            connections.
          </p>
        </div>
      </aside>
    );
  const domain = domains.find((item) => item.id === table.domain);
  const Icon = iconForDomain(table.domain);
  const related = relationships.filter(
    (rel) => rel.start?.tableId === table.id || rel.end?.tableId === table.id,
  );
  return (
    <aside className="max-h-[300px] overflow-y-auto border-t border-border bg-card lg:max-h-[610px] lg:border-l lg:border-t-0">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <span className={kickerClass}>Collection details</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          aria-label="Close details"
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="p-5">
        <span
          className={`grid size-10 place-items-center rounded-lg ${domainTone[table.domain] || domainTone.identity}`}
        >
          <Icon className="size-5" />
        </span>
        <h3 className="mt-3 text-base font-semibold tracking-tight">
          {table.name}
        </h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {table.comment || "MongoDB collection"}
        </p>
        <Badge variant="secondary" className="mt-3 text-[9px]">
          {domain?.label}
        </Badge>
      </div>
      <div className="flex gap-6 border-y border-border px-5 py-3 text-[11px] text-muted-foreground">
        <span>
          <strong className="text-foreground">{table.fields.length}</strong>{" "}
          fields
        </span>
        <span>
          <strong className="text-foreground">{related.length}</strong> links
        </span>
      </div>
      <div className="border-b border-border p-5">
        <h4 className={`${kickerClass} mb-2 flex justify-between`}>
          Fields <span>{table.fields.length}</span>
        </h4>
        {table.fields.map((field) => (
          <div
            className="flex flex-wrap items-center justify-between gap-x-2 border-b border-border/60 py-2.5 last:border-0"
            key={field.id}
          >
            <div className="flex min-w-0 items-center gap-2 text-[11px]">
              <span className="text-primary">
                {field.name === "_id" ? (
                  <KeyRound className="size-3.5" />
                ) : (
                  <span className="block size-1.5 rounded-full bg-border" />
                )}
              </span>
              <strong className="break-all font-medium">{field.name}</strong>
            </div>
            <small className="text-[9px] text-muted-foreground">
              {field.dataType || "—"}
            </small>
            {field.comment && (
              <p className="w-full pl-[22px] text-[9px] leading-relaxed text-muted-foreground">
                {field.comment}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="p-5">
        <h4 className={`${kickerClass} mb-2 flex justify-between`}>
          Relationships <span>{related.length}</span>
        </h4>
        {related.map((rel) => (
          <div
            className="flex items-center gap-2 py-1.5 text-[11px] text-muted-foreground"
            key={rel.id}
          >
            <GitBranch className="size-3.5 shrink-0 text-primary" />
            <span className="break-all">
              {rel.start.tableId === table.id
                ? rel.end.tableId
                : rel.start.tableId}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function DataModel({
  source,
  setSource,
  domain,
  setDomain,
  search,
  setSearch,
  selectedId,
  setSelectedId,
  stageRef,
  theme,
}) {
  const model = useMemo(() => readSchema(source), [source]);
  const graph = useMemo(
    () => createGraph(model, domain, search, theme),
    [model, domain, search, theme],
  );
  const selected =
    model.tables.find((table) => table.id === selectedId) || null;
  const visibleSelected =
    selected && graph.tables.some((table) => table.id === selected.id)
      ? selected
      : null;
  return (
    <div
      className={`${surfaceClass} overflow-hidden shadow-lg shadow-black/[0.02] dark:shadow-black/10`}
    >
      <div className={toolbarClass}>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className={kickerClass}>Schema version</span>
          <Select
            value={source.id}
            onValueChange={(id) => {
              setSource(schemaSources.find((item) => item.id === id));
              setSelectedId(null);
            }}
          >
            <SelectTrigger className="h-9 w-[min(300px,100%)] min-w-0 bg-background text-xs">
              <FileJson2 className="size-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {schemaSources.map((item) => (
                <SelectItem value={item.id} key={item.id}>
                  {item.label} · {item.file}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-background px-3 text-muted-foreground focus-within:border-ring sm:w-[270px]">
          <Search className="size-4 shrink-0" />
          <Input
            className="h-8 min-w-0 flex-1 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search collections or fields"
            aria-label="Search collections or fields"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
      <Tabs
        value={domain}
        onValueChange={(id) => {
          setDomain(id);
          setSelectedId(null);
        }}
        className="gap-0 border-b border-border"
      >
        <TabsList
          variant="line"
          className="flex h-auto w-full justify-start gap-3 overflow-x-auto rounded-none bg-transparent px-4 sm:gap-5 sm:px-6"
        >
          {domains.map((item) => (
            <TabsTrigger
              value={item.id}
              className="h-12 flex-none gap-1.5 rounded-none border-b-2 border-transparent px-1 text-[11px] text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:text-primary"
              key={item.id}
            >
              <span
                className={`size-1.5 rounded-full ${item.id === "catalog" ? "bg-violet-500" : item.id === "commerce" ? "bg-amber-500" : item.id === "fulfillment" ? "bg-cyan-600" : "bg-emerald-600"}`}
              />
              {item.label}
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                {item.id === "all"
                  ? model.tables.length
                  : model.tables.filter((table) => table.domain === item.id)
                      .length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
        <div
          className="relative h-[570px] min-w-0 overflow-hidden bg-[#fbfdfb] dark:bg-[#101b14] lg:h-[610px]"
          ref={stageRef}
        >
          {graph.nodes.length ? (
            <ReactFlow
              key={`${source.id}-${domain}-${search}`}
              colorMode={theme}
              nodes={graph.nodes.map((node) => ({
                ...node,
                selected: node.id === selectedId,
              }))}
              edges={graph.edges}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => setSelectedId(node.id)}
              onPaneClick={() => setSelectedId(null)}
              fitView
              fitViewOptions={{ padding: 0.18, maxZoom: 1.05 }}
              minZoom={0.18}
              maxZoom={1.8}
              nodesDraggable={false}
              nodesConnectable={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={22}
                size={1.25}
                color={theme === "dark" ? "#314a37" : "#dce8e0"}
              />
              <Controls position="bottom-left" showInteractive={false} />
            </ReactFlow>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Search className="size-7" />
              <strong className="text-sm text-foreground">
                No matching collections
              </strong>
              <span className="text-xs">Try another name or field.</span>
            </div>
          )}
          <span className="pointer-events-none absolute left-4 top-4 z-10 text-[9px] font-semibold tracking-[0.1em] text-muted-foreground">
            SCROLL TO ZOOM · DRAG TO PAN · CLICK A COLLECTION
          </span>
        </div>
        <Inspector
          table={visibleSelected}
          relationships={model.relationships}
          onClose={() => setSelectedId(null)}
        />
      </div>
      <div className={footerClass}>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Loaded from{" "}
          <strong className="font-medium text-foreground">{source.file}</strong>
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-xs text-primary"
          onClick={() => downloadText(source.file, source.raw)}
        >
          <ArrowDownToLine className="size-4" />
          Download source JSON
        </Button>
      </div>
    </div>
  );
}

function DrawingPage({ page, role, setRole, drawingRef, stageRef, theme }) {
  const section = page === "architecture" ? "architecture" : "journeys";
  const scene = useMemo(() => getScene(section, role), [section, role]);
  const focused =
    page === "journeys" ? roles.find((item) => item.id === role) : null;
  return (
    <div
      className={`${surfaceClass} overflow-hidden shadow-lg shadow-black/[0.02] dark:shadow-black/10`}
    >
      {page === "journeys" ? (
        <div className={`${toolbarClass} items-end`}>
          <div className="min-w-0">
            <span className={kickerClass}>Focus a journey</span>
            <Tabs value={role} onValueChange={setRole} className="mt-2 gap-0">
              <TabsList
                variant="line"
                className="flex h-auto max-w-full justify-start gap-4 overflow-x-auto rounded-none bg-transparent p-0"
              >
                {roles.map((item) => (
                  <TabsTrigger
                    value={item.id}
                    key={item.id}
                    className="h-9 flex-none rounded-none border-b-2 border-transparent px-1 text-[11px] text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary"
                  >
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <span className="hidden items-center gap-2 pb-2 text-[11px] text-muted-foreground sm:flex">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Read-only Excalidraw preview
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
            <Network className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <strong className="block text-xs font-semibold">
              A shared commerce platform for independent shops
            </strong>
            <span className="mt-1 block text-[11px] text-muted-foreground">
              Public assets at the edge. Short-lived catalog caching. MongoDB
              remains the source of truth.
            </span>
          </div>
          <Badge
            variant="outline"
            className="hidden shrink-0 text-[9px] font-semibold tracking-wide text-primary sm:inline-flex"
          >
            PROPOSED DESIGN
          </Badge>
        </div>
      )}
      <div
        className="relative h-[570px] overflow-hidden bg-card lg:h-[640px]"
        ref={stageRef}
      >
        <Button
          variant="outline"
          size="sm"
          className="absolute right-4 top-4 z-10 bg-card text-xs shadow-sm"
          onClick={() => drawingRef.current?.fit()}
        >
          <Focus className="size-4" />
          Fit drawing
        </Button>
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="size-4 animate-spin rounded-full border-2 border-border border-t-primary" />
              Loading drawing…
            </div>
          }
        >
          <DrawingCanvas
            key={`${section}-${role}`}
            ref={drawingRef}
            scene={scene}
            theme={theme}
            name={
              page === "architecture"
                ? "ARM Farms Architecture"
                : `ARM Farms ${focused?.label || "Role Journeys"}`
            }
          />
        </Suspense>
      </div>
      {page === "architecture" && (
        <div className="grid border-t border-border sm:grid-cols-3">
          <div className="border-b border-border p-5 sm:border-b-0 sm:border-r">
            <Globe2 className="mb-2 size-5 text-primary" />
            <strong className="text-xs">CDN</strong>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Delivers public images and static assets closer to shoppers.
            </p>
          </div>
          <div className="border-b border-border p-5 sm:border-b-0 sm:border-r">
            <Zap className="mb-2 size-5 text-primary" />
            <strong className="text-xs">Redis</strong>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Speeds up repeated catalog reads and lowers database load.
            </p>
          </div>
          <div className="p-5">
            <ShieldCheck className="mb-2 size-5 text-primary" />
            <strong className="text-xs">MongoDB</strong>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Stores the authoritative shop, customer, stock, and order data.
            </p>
          </div>
        </div>
      )}
      <div className={footerClass}>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Loaded from{" "}
          <strong className="font-medium text-foreground">
            {drawingSource.file}
          </strong>
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-xs text-primary"
          onClick={() => downloadText(drawingSource.file, drawingSource.raw)}
        >
          <ArrowDownToLine className="size-4" />
          Download Excalidraw source
        </Button>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState(() => {
    const initial = window.location.hash.replace("#", "");
    return pageMeta[initial] ? initial : "overview";
  });
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem("arm-farms-theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });
  const [source, setSource] = useState(schemaSources[0]);
  const [domain, setDomain] = useState("identity");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("organizations");
  const [role, setRole] = useState("all");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const stageRef = useRef(null);
  const drawingRef = useRef(null);
  const model = useMemo(() => readSchema(schemaSources[0]), []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0c1410" : "#f7f8f5");
    try {
      window.localStorage.setItem("arm-farms-theme", theme);
    } catch {
      /* Storage can be disabled. */
    }
  }, [theme]);
  useEffect(() => {
    if (window.location.hash !== `#${page}`) window.location.hash = page;
  }, [page]);
  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash.replace("#", "");
      if (pageMeta[next]) setPage(next);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  async function exportPng() {
    if (!stageRef.current || busy) return;
    setBusy(true);
    try {
      if (page === "model") {
        await downloadSchemaPng(
          createGraph(readSchema(source), domain, search),
          domain,
          source.file,
          `arm-farms-model-${domain}.png`,
        );
      } else {
        const { exportToBlob } = await import("@excalidraw/excalidraw");
        const scene = getScene(
          page === "architecture" ? "architecture" : "journeys",
          role,
        );
        const blob = await exportToBlob({
          elements: scene.elements,
          files: scene.files,
          appState: { viewBackgroundColor: "#ffffff", exportBackground: true },
          mimeType: "image/png",
          exportPadding: 40,
          getDimensions: (width, height) => ({
            width: width * 3,
            height: height * 3,
            scale: 3,
          }),
        });
        const link = document.createElement("a");
        link.download = `arm-farms-${page}${page === "journeys" ? `-${role}` : ""}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }
      setToast("3× PNG exported");
    } catch (error) {
      console.error(error);
      setToast("Export failed. Try the focused view or browser screenshot.");
    } finally {
      setBusy(false);
      setTimeout(() => setToast(""), 4000);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar page={page} onPage={setPage} />
      <main className="min-w-0 flex-1">
        <Header
          page={page}
          onExport={exportPng}
          busy={busy}
          theme={theme}
          onToggleTheme={() =>
            setTheme((current) => (current === "dark" ? "light" : "dark"))
          }
        />
        <div className="mx-auto max-w-[1670px] px-4 py-6 sm:px-8 lg:px-12 lg:py-8">
          {page === "overview" && <Overview onPage={setPage} model={model} />}
          {page === "model" && (
            <DataModel
              source={source}
              setSource={setSource}
              domain={domain}
              setDomain={setDomain}
              search={search}
              setSearch={setSearch}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              stageRef={stageRef}
              theme={theme}
            />
          )}
          {(page === "journeys" || page === "architecture") && (
            <DrawingPage
              page={page}
              role={role}
              setRole={setRole}
              drawingRef={drawingRef}
              stageRef={stageRef}
              theme={theme}
            />
          )}
        </div>
      </main>
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground shadow-xl">
          <Check className="size-4" />
          {toast}
        </div>
      )}
    </div>
  );
}
