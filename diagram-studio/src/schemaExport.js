import { domains } from './data.js';

const escapeXml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[character]);
const shorten = (value, length) => String(value || '').length > length ? `${String(value).slice(0, length - 1)}…` : String(value || '');

export function schemaSvg(graph, domainId, sourceFile) {
  const cardWidth = 314;
  const cardHeight = 256;
  const topOffset = 100;
  const width = Math.max(900, ...graph.nodes.map((node) => node.position.x + cardWidth + 50));
  const height = Math.max(410, ...graph.nodes.map((node) => node.position.y + topOffset + cardHeight + 55));
  const domain = domains.find((item) => item.id === domainId) || domains[0];
  const lookup = new Map(graph.nodes.map((node) => [node.id, node]));
  const lines = graph.edges.map((edge) => {
    const from = lookup.get(edge.source);
    const to = lookup.get(edge.target);
    if (!from || !to) return '';
    const sx = from.position.x + cardWidth;
    const sy = from.position.y + topOffset + 128;
    const tx = to.position.x;
    const ty = to.position.y + topOffset + 128;
    const mid = tx > sx ? (sx + tx) / 2 : Math.max(sx, tx) + 45;
    return `<path d="M ${sx} ${sy} H ${mid} V ${ty} H ${tx}" fill="none" stroke="#9bb9ba" stroke-width="1.7" marker-end="url(#arrow)" opacity="0.86"/>`;
  }).join('');
  const cards = graph.nodes.map((node) => {
    const table = node.data;
    const x = node.position.x;
    const y = node.position.y + topOffset;
    const color = domains.find((item) => item.id === table.domain)?.color || '#127b79';
    const rows = table.fields.slice(0, 5).map((field, index) => {
      const rowY = y + 97 + index * 27;
      return `<rect x="${x + 1}" y="${rowY - 16}" width="312" height="27" fill="${index % 2 ? '#f7faf9' : '#ffffff'}"/>
      <circle cx="${x + 18}" cy="${rowY - 3}" r="3.2" fill="${field.name === '_id' ? color : '#b7c9cb'}"/>
      <text x="${x + 31}" y="${rowY + 1}" fill="#375463" font-size="11" font-weight="600">${escapeXml(shorten(field.name, 29))}</text>
      <text x="${x + 298}" y="${rowY + 1}" fill="#8099a1" font-size="10" text-anchor="end">${escapeXml(shorten(field.dataType || '—', 17))}</text>`;
    }).join('');
    return `<g filter="url(#shadow)"><rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="11" fill="#ffffff" stroke="#cadcdb"/><path d="M ${x + 10} ${y + 1} H ${x + cardWidth - 10}" stroke="${color}" stroke-width="4" stroke-linecap="round"/></g>
      <rect x="${x + 14}" y="${y + 17}" width="35" height="35" rx="9" fill="${color}18"/>
      <circle cx="${x + 31.5}" cy="${y + 34.5}" r="7" fill="none" stroke="${color}" stroke-width="1.7"/>
      <circle cx="${x + 31.5}" cy="${y + 34.5}" r="2.5" fill="${color}"/>
      <text x="${x + 60}" y="${y + 31}" fill="#1f3946" font-size="13" font-weight="700">${escapeXml(shorten(table.name, 27))}</text>
      <text x="${x + 60}" y="${y + 47}" fill="#8aa0a7" font-size="9.5">${escapeXml(shorten(table.comment || 'MongoDB collection', 40))}</text>
      <rect x="${x + 272}" y="${y + 22}" width="26" height="19" rx="5" fill="#f0f5f5"/><text x="${x + 285}" y="${y + 35}" text-anchor="middle" fill="#769198" font-size="9" font-weight="700">${table.fields.length}</text>
      <path d="M ${x + 1} ${y + 68} H ${x + 313}" stroke="#e7efef"/>${rows}
      <path d="M ${x + 1} ${y + 228} H ${x + 313}" stroke="#e7efef"/>
      <text x="${x + 16}" y="${y + 246}" fill="#8ca3a9" font-size="10">${table.fields.length > 5 ? `+ ${table.fields.length - 5} more fields` : 'All fields shown'}</text>`;
  }).join('');
  const dots = `<pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#e3eceb"/></pattern>`;
  return { width, height, markup: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>${dots}<marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 8 4 L 0 8 z" fill="#9bb9ba"/></marker><filter id="shadow" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="#1f454c" flood-opacity=".11"/></filter></defs>
    <rect width="100%" height="100%" fill="#ffffff"/><rect width="100%" height="100%" fill="url(#dots)"/>
    <rect x="46" y="26" width="7" height="7" rx="2" fill="${domain.color}"/><text x="61" y="34" fill="#44857e" font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="700" letter-spacing="2">ARM FARMS / DATA MODEL</text>
    <text x="46" y="70" fill="#193644" font-family="Arial,Helvetica,sans-serif" font-size="27" font-weight="700">${escapeXml(domain.label)}</text>
    <text x="${width - 46}" y="43" fill="#718b93" font-family="Arial,Helvetica,sans-serif" font-size="11" text-anchor="end">${graph.nodes.length} collections · ${graph.edges.length} relationships</text>
    <text x="${width - 46}" y="64" fill="#9aaeb3" font-family="Arial,Helvetica,sans-serif" font-size="10" text-anchor="end">${escapeXml(sourceFile)}</text>
    <g font-family="Arial,Helvetica,sans-serif">${lines}${cards}</g></svg>` };
}

export async function downloadSchemaPng(graph, domainId, sourceFile, filename) {
  const { width, height, markup } = schemaSvg(graph, domainId, sourceFile);
  const svgUrl = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    image.src = svgUrl;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * 3);
    canvas.height = Math.round(height * 3);
    const context = canvas.getContext('2d');
    context.scale(3, 3);
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('PNG rendering failed')), 'image/png'));
    const pngUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
