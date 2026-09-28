import { lazy, memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, ArrowDownToLine, ArrowRight, ArrowUpRight, Boxes, Check,
  Database, FileJson2, Focus, GitBranch, Globe2,
  KeyRound, Layers3, LayoutDashboard, Network, Route, Search,
  ShieldCheck, Sparkles, Truck, Users, X, Zap,
} from 'lucide-react';
import { Background, BackgroundVariant, Controls, Handle, MarkerType, Position, ReactFlow } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { domains, downloadText, drawingSource, getScene, readSchema, roles, schemaSources } from './data.js';
import { downloadSchemaPng } from './schemaExport.js';

const DrawingCanvas = lazy(() => import('./DrawingCanvas.jsx'));

const pageMeta = {
  overview: { eyebrow: 'WORKSPACE / OVERVIEW', title: 'Your system, at a glance', description: 'A visual home for the commerce model, user journeys, and platform architecture.' },
  model: { eyebrow: 'WORKSPACE / DATA MODEL', title: 'Commerce data model', description: 'Explore collections, fields, and relationships from the original ERD files.' },
  journeys: { eyebrow: 'WORKSPACE / ROLE JOURNEYS', title: 'Four paths through the shop', description: 'Customer, wholesale buyer, admin, and superadmin flows from the Excalidraw source.' },
  architecture: { eyebrow: 'WORKSPACE / ARCHITECTURE', title: 'How the platform connects', description: 'The storefront, commerce API, data stores, CDN, and external services in one view.' },
};

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'model', label: 'Data model', icon: Database },
  { id: 'journeys', label: 'Role journeys', icon: Route },
  { id: 'architecture', label: 'Architecture', icon: Network },
];

function iconForDomain(id) {
  return ({ identity: Users, catalog: Boxes, commerce: Activity, fulfillment: Truck })[id] || Layers3;
}

function Sidebar({ page, onPage }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><span /></div>
        <div><strong>ARM FARMS</strong><small>SYSTEMS STUDIO</small></div>
      </div>

      <div className="sidebar-section-title">WORKSPACE</div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <Button key={id} variant="ghost" className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => onPage(id)}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{page === id && <span className="nav-active-dot" />}
          </Button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-info-card">
          <div className="sidebar-info-icon"><Sparkles size={17} /></div>
          <strong>Built for clarity</strong>
          <p>Focused views make large diagrams easier to explore and capture.</p>
        </div>
        <div className="sidebar-project"><span className="project-avatar">AF</span><div><strong>ARM Farms</strong><small>Ecommerce platform</small></div><span className="project-green-dot" /></div>
      </div>
    </aside>
  );
}

function Header({ page, onExport, busy }) {
  const meta = pageMeta[page];
  return (
    <header className="page-header">
      <div className="header-copy"><div className="eyebrow"><span className="eyebrow-line" />{meta.eyebrow}</div><h1>{meta.title}</h1><p>{meta.description}</p></div>
      <div className="header-actions"><Badge variant="outline" className="live-chip"><span />SOURCE FILES CONNECTED</Badge>{page !== 'overview' && <Button className="button button-dark" onClick={onExport} disabled={busy}><ArrowDownToLine size={17} />{busy ? 'Exporting…' : 'Export 3× PNG'}</Button>}</div>
    </header>
  );
}

function MetricCard({ icon: Icon, value, label, note, tone }) {
  return <Card className={`metric-card metric-${tone}`}><CardContent className="metric-content"><div className="metric-top"><span className="metric-icon"><Icon size={20} strokeWidth={1.8} /></span><ArrowUpRight size={18} className="metric-arrow" /></div><div className="metric-value">{value}</div><div className="metric-label">{label}</div><div className="metric-note">{note}</div></CardContent></Card>;
}

function Overview({ onPage, model }) {
  const { tables, relationships, indexes } = model;
  return <div className="overview-content">
    <div className="hero-panel">
      <div className="hero-text"><span className="hero-tag"><span /> THE SYSTEM, MAPPED</span><h2>Everything behind<br /><em>the storefront.</em></h2><p>Browse the MongoDB model, follow each user journey, and see how the platform fits together.</p><Button className="button button-light" onClick={() => onPage('model')}>Explore the model <ArrowRight size={17} /></Button></div>
      <div className="hero-graphic" aria-hidden="true"><div className="hero-map-label">PLATFORM MAP</div><div className="hero-map-row"><span>Storefront</span><i /><span>Commerce API</span><i /><span>MongoDB</span></div><div className="hero-map-lower"><i /><span>Redis cache</span></div></div>
    </div>
    <div className="section-heading"><div><div className="section-kicker">PROJECT SNAPSHOT</div><h3>Everything in one view</h3></div><span>Current ERD · {schemaSources[0].file}</span></div>
    <div className="metrics-grid"><MetricCard icon={Boxes} value={tables.length} label="Collections" note="Across four business domains" tone="teal" /><MetricCard icon={GitBranch} value={relationships.length} label="Relationships" note="Mapped from the ERD source" tone="violet" /><MetricCard icon={Users} value="04" label="User journeys" note="From signup to fulfillment" tone="orange" /><MetricCard icon={Layers3} value={schemaSources.length} label="Schema versions" note={`${indexes} modeled indexes in current`} tone="blue" /></div>
    <div className="section-heading second-heading"><div><div className="section-kicker">EXPLORE THE SYSTEM</div><h3>Choose a lens</h3></div></div>
    <div className="explore-grid">
      <button className="explore-card explore-model" onClick={() => onPage('model')}><span className="explore-icon"><Database size={23} /></span><div className="explore-mini-flow"><span>organizations</span><i /><span>products</span><i /><span>orders</span></div><div><h4>Data model</h4><p>Browse every collection, inspect fields, and trace how the schema connects.</p><span className="explore-link">Open diagram <ArrowRight size={16} /></span></div></button>
      <button className="explore-card explore-journey" onClick={() => onPage('journeys')}><span className="explore-icon"><Route size={23} /></span><div className="journey-graphic"><span>01</span><i /><span>02</span><i /><span>03</span><i /><span>04</span></div><div><h4>Role journeys</h4><p>Follow customer, wholesale buyer, admin, and superadmin paths.</p><span className="explore-link">View journeys <ArrowRight size={16} /></span></div></button>
      <button className="explore-card explore-architecture" onClick={() => onPage('architecture')}><span className="explore-icon"><Network size={23} /></span><div className="architecture-graphic"><span>CDN</span><i /><span>API</span><i /><span>Redis</span><i /><span>DB</span></div><div><h4>Architecture</h4><p>See the application layers, integrations, and data boundaries.</p><span className="explore-link">View architecture <ArrowRight size={16} /></span></div></button>
    </div>
  </div>;
}

const TableNode = memo(function TableNode({ data, selected }) {
  const Icon = iconForDomain(data.domain);
  return <div className={`table-node ${selected ? 'table-node-selected' : ''}`} style={{ '--node-accent': domains.find((d) => d.id === data.domain)?.color || '#127b79' }}>
    <Handle type="target" position={Position.Left} />
    <div className="table-node-head"><span className="table-node-icon"><Icon size={19} /></span><div><strong>{data.name}</strong><small>{data.comment || 'MongoDB collection'}</small></div><span className="table-node-count">{data.fields.length}</span></div>
    <div className="table-node-columns">{data.fields.slice(0, 5).map((field) => <div className="table-node-row" key={field.id}><span className={`field-dot ${field.name === '_id' ? 'field-primary' : ''}`} /> <span className="field-name">{field.name}</span><span className="field-type">{field.dataType || '—'}</span></div>)}</div>
    <div className="table-node-foot">{data.fields.length > 5 ? `+ ${data.fields.length - 5} more fields` : 'All fields shown'} <ArrowUpRight size={14} /></div>
    <Handle type="source" position={Position.Right} />
  </div>;
});

const nodeTypes = { table: TableNode };

function createGraph(model, domainId, query) {
  const needle = query.trim().toLowerCase();
  const tables = model.tables.filter((table) => {
    if (domainId !== 'all' && table.domain !== domainId) return false;
    return !needle || table.name.toLowerCase().includes(needle) || (table.comment || '').toLowerCase().includes(needle) || table.fields.some((field) => field.name.toLowerCase().includes(needle));
  });
  const cols = domainId === 'all' ? 4 : 2;
  const nodes = tables.map((table, index) => ({
    id: table.id, type: 'table', position: { x: (index % cols) * 425 + 46, y: Math.floor(index / cols) * 345 + 48 },
    data: table, draggable: false, selectable: true,
  }));
  const visibleIds = new Set(tables.map((table) => table.id));
  const edges = model.relationships.filter((rel) => visibleIds.has(rel.start?.tableId) && visibleIds.has(rel.end?.tableId))
    .map((rel) => ({ id: rel.id, source: rel.start.tableId, target: rel.end.tableId, type: 'smoothstep', animated: false,
      style: { stroke: '#9db7bb', strokeWidth: 1.7 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#9db7bb', width: 14, height: 14 },
    }));
  return { nodes, edges, tables };
}

function Inspector({ table, relationships, onClose }) {
  if (!table) return <aside className="inspector inspector-empty"><div className="inspector-placeholder"><Focus size={26} /><h3>Select a collection</h3><p>Click a collection in the diagram to inspect its fields and connections.</p></div></aside>;
  const domain = domains.find((item) => item.id === table.domain);
  const related = relationships.filter((rel) => rel.start?.tableId === table.id || rel.end?.tableId === table.id);
  return <aside className="inspector"><div className="inspector-top"><span className="inspector-kicker">COLLECTION DETAILS</span><Button variant="ghost" size="icon-xs" className="icon-button close-inspector" onClick={onClose} aria-label="Close details"><X size={16} /></Button></div><div className="inspector-title"><div className="inspector-symbol" style={{ color: domain.color, backgroundColor: `${domain.color}18` }}>{(() => { const Icon = iconForDomain(table.domain); return <Icon size={23} />; })()}</div><h3>{table.name}</h3><p>{table.comment || 'MongoDB collection'}</p><Badge variant="secondary" className="inspector-domain">{domain.label}</Badge></div><div className="inspector-stat-row"><span><strong>{table.fields.length}</strong> fields</span><span><strong>{related.length}</strong> links</span></div><div className="inspector-section"><h4>FIELDS <span>{table.fields.length}</span></h4><div className="inspector-fields">{table.fields.map((field) => <div className="inspector-field" key={field.id}><div><span>{field.name === '_id' ? <KeyRound size={14} /> : <span className="field-small-dot" />}</span><strong>{field.name}</strong></div><small>{field.dataType || '—'}</small>{field.comment && <p>{field.comment}</p>}</div>)}</div></div><div className="inspector-section inspector-links"><h4>RELATIONSHIPS <span>{related.length}</span></h4>{related.map((rel) => <div className="related-row" key={rel.id}><GitBranch size={15} />{rel.start.tableId === table.id ? rel.end.tableId : rel.start.tableId}</div>)}</div></aside>;
}

function DataModel({ source, setSource, domain, setDomain, search, setSearch, selectedId, setSelectedId, stageRef }) {
  const model = useMemo(() => readSchema(source), [source]);
  const graph = useMemo(() => createGraph(model, domain, search), [model, domain, search]);
  const selected = model.tables.find((table) => table.id === selectedId) || null;
  const visibleSelected = selected && graph.tables.some((table) => table.id === selected.id) ? selected : null;
  return <div className="diagram-page model-page"><div className="diagram-toolbar"><div className="toolbar-group"><span className="toolbar-label">SCHEMA VERSION</span><Select value={source.id} onValueChange={(id) => { setSource(schemaSources.find((item) => item.id === id)); setSelectedId(null); }}><SelectTrigger className="select-wrap"><FileJson2 size={15} /><SelectValue /></SelectTrigger><SelectContent>{schemaSources.map((item) => <SelectItem value={item.id} key={item.id}>{item.label} · {item.file}</SelectItem>)}</SelectContent></Select></div><div className="toolbar-search"><Search size={16} /><Input className="toolbar-search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search collections or fields" aria-label="Search collections or fields" />{search && <Button variant="ghost" size="icon-xs" onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></Button>}</div></div>
    <Tabs value={domain} onValueChange={(id) => { setDomain(id); setSelectedId(null); }} className="domain-tabs"><TabsList variant="line" className="domain-tabs-list">{domains.map((item) => <TabsTrigger value={item.id} className="domain-tab" key={item.id}><span className="domain-indicator" style={{ backgroundColor: item.color }} />{item.label}<span className="domain-count">{item.id === 'all' ? model.tables.length : model.tables.filter((table) => table.domain === item.id).length}</span></TabsTrigger>)}</TabsList></Tabs>
    <div className="model-workspace"><div className="diagram-stage model-stage" ref={stageRef}>{graph.nodes.length ? <ReactFlow key={`${source.id}-${domain}-${search}`} nodes={graph.nodes.map((node) => ({ ...node, selected: node.id === selectedId }))} edges={graph.edges} nodeTypes={nodeTypes} onNodeClick={(_, node) => setSelectedId(node.id)} onPaneClick={() => setSelectedId(null)} fitView fitViewOptions={{ padding: 0.18, maxZoom: 1.05 }} minZoom={0.18} maxZoom={1.8} nodesDraggable={false} nodesConnectable={false} proOptions={{ hideAttribution: true }}><Background variant={BackgroundVariant.Dots} gap={22} size={1.25} color="#dce8e6" /><Controls position="bottom-left" showInteractive={false} /></ReactFlow> : <div className="empty-search"><Search size={28} /><strong>No matching collections</strong><span>Try another name or field.</span></div>}<span className="stage-hint">SCROLL TO ZOOM · DRAG TO PAN · CLICK A COLLECTION</span></div><Inspector table={visibleSelected} relationships={model.relationships} onClose={() => setSelectedId(null)} /></div>
    <div className="diagram-footer"><span><span className="footer-dot" /> Loaded from <strong>{source.file}</strong></span><Button variant="ghost" size="sm" onClick={() => downloadText(source.file, source.raw)}><ArrowDownToLine size={14} /> Download source JSON</Button></div>
  </div>;
}

function DrawingPage({ page, role, setRole, drawingRef, stageRef }) {
  const section = page === 'architecture' ? 'architecture' : 'journeys';
  const scene = useMemo(() => getScene(section, role), [section, role]);
  const focused = page === 'journeys' ? roles.find((item) => item.id === role) : null;
  return <div className="diagram-page drawing-page">
    {page === 'journeys' ? <div className="drawing-toolbar"><div><span className="toolbar-label">FOCUS A JOURNEY</span><Tabs value={role} onValueChange={setRole} className="role-tabs"><TabsList variant="line" className="role-tabs-list">{roles.map((item) => <TabsTrigger value={item.id} key={item.id} className="role-tab">{item.label}</TabsTrigger>)}</TabsList></Tabs></div><div className="drawing-toolbar-note"><span className="mini-status-dot" /> Read-only Excalidraw preview</div></div> : <div className="architecture-intro"><div className="architecture-intro-icon"><Network size={20} /></div><div><strong>A shared commerce platform for independent shops</strong><span>Public assets at the edge. Short-lived catalog caching. MongoDB remains the source of truth.</span></div><Badge variant="outline" className="architecture-pill">PROPOSED DESIGN</Badge></div>}
    <div className="diagram-stage drawing-stage" ref={stageRef}><Button variant="outline" size="sm" className="fit-button" onClick={() => drawingRef.current?.fit()}><Focus size={15} /> Fit drawing</Button><Suspense fallback={<div className="canvas-loading"><span className="loader-ring" /> Loading drawing…</div>}><DrawingCanvas key={`${section}-${role}`} ref={drawingRef} scene={scene} name={page === 'architecture' ? 'ARM Farms Architecture' : `ARM Farms ${focused?.label || 'Role Journeys'}`} /></Suspense></div>
    {page === 'architecture' && <div className="benefit-row"><div><span className="benefit-icon cdn"><Globe2 size={18} /></span><strong>CDN</strong><p>Delivers public images and static assets closer to shoppers.</p></div><div><span className="benefit-icon redis"><Zap size={18} /></span><strong>Redis</strong><p>Speeds up repeated catalog reads and lowers database load.</p></div><div><span className="benefit-icon mongo"><ShieldCheck size={18} /></span><strong>MongoDB</strong><p>Stores the authoritative shop, customer, stock, and order data.</p></div></div>}
    <div className="diagram-footer"><span><span className="footer-dot" /> Loaded from <strong>{drawingSource.file}</strong></span><Button variant="ghost" size="sm" onClick={() => downloadText(drawingSource.file, drawingSource.raw)}><ArrowDownToLine size={14} /> Download Excalidraw source</Button></div>
  </div>;
}

export default function App() {
  const [page, setPage] = useState(() => {
    const initial = window.location.hash.replace('#', '');
    return pageMeta[initial] ? initial : 'overview';
  });
  const [source, setSource] = useState(schemaSources[0]);
  const [domain, setDomain] = useState('identity');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('organizations');
  const [role, setRole] = useState('all');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const stageRef = useRef(null);
  const drawingRef = useRef(null);
  const model = useMemo(() => readSchema(schemaSources[0]), []);

  useEffect(() => {
    if (window.location.hash !== `#${page}`) window.location.hash = page;
  }, [page]);

  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash.replace('#', '');
      if (pageMeta[next]) setPage(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  async function exportPng() {
    if (!stageRef.current || busy) return;
    setBusy(true);
    try {
      if (page === 'model') {
        await downloadSchemaPng(createGraph(readSchema(source), domain, search), domain, source.file, `arm-farms-model-${domain}.png`);
      } else {
        const { exportToBlob } = await import('@excalidraw/excalidraw');
        const scene = getScene(page === 'architecture' ? 'architecture' : 'journeys', role);
        const blob = await exportToBlob({ elements: scene.elements, files: scene.files, appState: { viewBackgroundColor: '#ffffff', exportBackground: true }, mimeType: 'image/png', exportPadding: 40, getDimensions: (width, height) => ({ width: width * 3, height: height * 3, scale: 3 }) });
        const link = document.createElement('a');
        link.download = `arm-farms-${page}${page === 'journeys' ? `-${role}` : ''}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }
      setToast('3× PNG exported');
    } catch (error) {
      console.error(error);
      setToast('Export failed. Try the focused view or browser screenshot.');
    } finally {
      setBusy(false);
      setTimeout(() => setToast(''), 4000);
    }
  }

  return <div className="app-shell flex min-h-screen bg-background text-foreground"><Sidebar page={page} onPage={setPage} /><main className="main-panel min-w-0 flex-1"><Header page={page} onExport={exportPng} busy={busy} /><div className="page-body">{page === 'overview' && <Overview onPage={setPage} model={model} />}{page === 'model' && <DataModel source={source} setSource={setSource} domain={domain} setDomain={setDomain} search={search} setSearch={setSearch} selectedId={selectedId} setSelectedId={setSelectedId} stageRef={stageRef} />}{(page === 'journeys' || page === 'architecture') && <DrawingPage page={page} role={role} setRole={setRole} drawingRef={drawingRef} stageRef={stageRef} />}</div></main>{toast && <div className="toast"><Check size={17} />{toast}</div>}</div>;
}
