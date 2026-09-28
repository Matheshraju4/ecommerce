import currentText from '../../demo.erd.json?raw';
import previousText from '../../demo.previous.erd.json?raw';
import copyText from '../../democopy.previous.erd.json?raw';
import drawingText from '../../ARM_Farms_Role_Flows.excalidraw?raw';

export const schemaSources = [
  { id: 'copy', label: 'Previous copy', file: 'democopy.previous.erd.json', raw: copyText, schema: JSON.parse(copyText) },
  { id: 'current', label: 'Current model', file: 'demo.erd.json', raw: currentText, schema: JSON.parse(currentText) },
  { id: 'previous', label: 'Previous model', file: 'demo.previous.erd.json', raw: previousText, schema: JSON.parse(previousText) },
];

export const drawingSource = {
  file: 'ARM_Farms_Role_Flows.excalidraw',
  raw: drawingText,
  scene: JSON.parse(drawingText),
};

export const domains = [
  { id: 'all', label: 'All collections', color: '#325e74' },
  { id: 'identity', label: 'Identity & shops', color: '#127b79' },
  { id: 'catalog', label: 'Catalog & pricing', color: '#7755a5' },
  { id: 'commerce', label: 'Cart & orders', color: '#d27d3f' },
  { id: 'fulfillment', label: 'Fulfillment', color: '#2f75a1' },
];

const domainByTable = {
  organizations: 'identity',
  users: 'identity',
  organization_role: 'identity',
  wholesale_buyer_profiles: 'identity',
  products: 'catalog',
  product_variants: 'catalog',
  price_lists: 'catalog',
  price_list_prices: 'catalog',
  variant_prices: 'catalog',
  carts: 'commerce',
  orders: 'commerce',
  payment_transactions: 'commerce',
  returns: 'commerce',
  inventory_locations: 'fulfillment',
  inventory_levels: 'fulfillment',
  shipments: 'fulfillment',
  shipment_events: 'fulfillment',
};

export function getDomain(tableId) {
  return domainByTable[tableId] || 'commerce';
}

export function readSchema(source) {
  const { collections, doc } = source.schema;
  const tables = (doc.tableIds || Object.keys(collections.tableEntities)).map((id) => {
    const entity = collections.tableEntities[id];
    return {
      ...entity,
      domain: getDomain(id),
      fields: (entity.columnIds || []).map((fieldId) => collections.tableColumnEntities[fieldId]).filter(Boolean),
    };
  }).filter(Boolean);
  const relationships = (doc.relationshipIds || Object.keys(collections.relationshipEntities))
    .map((id) => collections.relationshipEntities[id]).filter(Boolean);
  return { tables, relationships, indexes: Object.keys(collections.indexEntities || {}).length };
}

export const roles = [
  { id: 'all', label: 'All roles', range: [0, Infinity] },
  { id: 'customer', label: 'Customer', range: [50, 390] },
  { id: 'wholesale', label: 'Wholesale buyer', range: [420, 760] },
  { id: 'admin', label: 'Admin', range: [790, 1130] },
  { id: 'superadmin', label: 'Superadmin', range: [1160, 1500] },
];

const architectureTitle = drawingSource.scene.elements.find(
  (element) => element.type === 'text' && element.text === 'Proposed system architecture',
);
const architectureBoundary = architectureTitle ? architectureTitle.y - 30 : Infinity;

export function getScene(section, roleId = 'all') {
  const role = roles.find((item) => item.id === roleId) || roles[0];
  const elements = drawingSource.scene.elements.filter((element) => {
    if (element.isDeleted) return false;
    if (section === 'architecture') return element.y >= architectureBoundary;
    if (element.y >= architectureBoundary) return false;
    if (role.id === 'all') return true;
    // Omit the shared page heading when focusing on one lane.
    return element.y >= 135 && element.x >= role.range[0] && element.x + element.width <= role.range[1];
  });
  return {
    elements,
    appState: { viewBackgroundColor: '#ffffff', gridSize: null },
    files: drawingSource.scene.files || {},
  };
}

export function downloadText(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
