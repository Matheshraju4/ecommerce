// Run from this directory with: mongosh <connection-string> --file mongodb-setup.js
// Reads the conceptual ERD and creates MongoDB validators and indexes.
// It does not insert, update, or delete application documents.
(function () {
  const fs = require('fs');
  const model = JSON.parse(fs.readFileSync('demo.erd.json', 'utf8'));
  const entities = model.collections;

  const bsonTypes = {
    ObjectId: 'objectId',
    String: 'string',
    Boolean: 'bool',
    Date: 'date',
    Int32: 'int',
    Decimal128: 'decimal',
    Document: 'object',
    'Array<Document>': 'array',
  };

  const allowedValues = {
    'organizations.status': ['active', 'suspended'],
    'users.account_status': ['active', 'suspended', 'inactive'],
    'users.platform_role': ['user', 'superadmin'],
    'organization_role.role': ['owner', 'admin', 'customer', 'wholesale_buyer'],
    'organization_role.status': ['active', 'suspended', 'inactive'],
    'wholesale_buyer_profiles.approval_status': ['pending', 'approved', 'rejected'],
    'products.visibility': ['customer', 'wholesale_buyer', 'both'],
    'products.status': ['draft', 'active', 'archived'],
    'product_variants.visibility_override': ['inherit', 'customer', 'wholesale_buyer', 'both'],
    'carts.shopping_as': ['customer', 'wholesale_buyer'],
    'orders.shopping_as': ['customer', 'wholesale_buyer'],
    'orders.order_status': ['placed', 'confirmed', 'cancelled', 'completed'],
    'orders.payment_status': ['unpaid', 'paid', 'partially_refunded', 'refunded'],
    'orders.fulfillment_status': ['unfulfilled', 'partially_fulfilled', 'fulfilled'],
    'payment_transactions.transaction_type': ['attempt', 'authorization', 'capture', 'refund', 'chargeback'],
    'payment_transactions.status': ['pending', 'succeeded', 'failed', 'reversed'],
    'shipments.managed_by_type': ['shop_staff', 'shipping_provider'],
    'shipments.status': ['pending', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'],
    'shipment_events.status': ['pending', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'],
    'shipment_events.source': ['staff', 'carrier_webhook', 'system'],
    'price_lists.status': ['active', 'inactive'],
    'returns.status': ['requested', 'approved', 'rejected', 'received', 'completed', 'cancelled'],
    'returns.refund_status': ['pending', 'partially_refunded', 'refunded', 'no_refund'],
  };

  const nonnegativeInts = new Set([
    'inventory_levels.on_hand_quantity',
    'inventory_levels.committed_quantity',
  ]);

  const nestedItems = {
    'carts.items': {
      bsonType: 'object',
      required: ['variant_id', 'quantity', 'added_at'],
      properties: {
        variant_id: { bsonType: 'objectId' },
        quantity: { bsonType: 'int', minimum: 1 },
        added_at: { bsonType: 'date' },
      },
    },
    'orders.line_items': {
      bsonType: 'object',
      required: ['line_item_id', 'product_id', 'variant_id', 'title', 'quantity', 'unit_price', 'line_total'],
      properties: {
        line_item_id: { bsonType: 'objectId' },
        product_id: { bsonType: 'objectId' },
        variant_id: { bsonType: 'objectId' },
        title: { bsonType: 'string' },
        options: { bsonType: 'object' },
        sku: { bsonType: 'string' },
        quantity: { bsonType: 'int', minimum: 1 },
        unit_price: { bsonType: 'decimal' },
        line_total: { bsonType: 'decimal' },
      },
    },
    'shipments.items': {
      bsonType: 'object',
      required: ['order_line_item_id', 'quantity'],
      properties: {
        order_line_item_id: { bsonType: 'objectId' },
        quantity: { bsonType: 'int', minimum: 1 },
      },
    },
    'returns.items': {
      bsonType: 'object',
      required: ['order_line_item_id', 'quantity', 'reason'],
      properties: {
        order_line_item_id: { bsonType: 'objectId' },
        quantity: { bsonType: 'int', minimum: 1 },
        reason: { bsonType: 'string' },
        condition: { bsonType: 'string' },
        restock_quantity: { bsonType: 'int', minimum: 0 },
        restock_location_id: { bsonType: 'objectId' },
      },
    },
  };

  function collectionValidator(table) {
    const required = [];
    const properties = {};
    for (const columnId of table.columnIds) {
      const field = entities.tableColumnEntities[columnId];
      const type = bsonTypes[field.dataType];
      if (!type) throw new Error('Unsupported ERD type: ' + columnId + ' / ' + field.dataType);
      const rule = { bsonType: type };
      if (type === 'array') rule.items = nestedItems[columnId] || { bsonType: 'object' };
      if (['orders.line_items', 'shipments.items', 'returns.items'].includes(columnId)) rule.minItems = 1;
      if (allowedValues[columnId]) rule.enum = allowedValues[columnId];
      if (nonnegativeInts.has(columnId)) rule.minimum = 0;
      if (columnId === 'price_list_prices.min_quantity') rule.minimum = 1;
      properties[field.name] = rule;
      if (field.options & 8) required.push(field.name);
    }
    return { $jsonSchema: { bsonType: 'object', required, properties } };
  }

  const existing = new Set(db.getCollectionNames());
  for (const tableId of model.doc.tableIds) {
    const table = entities.tableEntities[tableId];
    const validator = collectionValidator(table);
    if (existing.has(tableId)) {
      const result = db.runCommand({ collMod: tableId, validator, validationLevel: 'strict', validationAction: 'error' });
      if (result.ok !== 1) throw new Error('Failed to update validator for ' + tableId + ': ' + JSON.stringify(result));
    } else {
      db.createCollection(tableId, { validator, validationLevel: 'strict', validationAction: 'error' });
    }
  }

  for (const indexId of model.doc.indexIds) {
    const index = entities.indexEntities[indexId];
    const keys = {};
    for (const indexColumnId of index.seqIndexColumnIds) {
      const indexColumn = entities.indexColumnEntities[indexColumnId];
      const column = entities.tableColumnEntities[indexColumn.columnId];
      keys[column.name] = indexColumn.orderType === 2 ? -1 : 1;
    }
    const options = { name: index.name, unique: index.unique };
    if (['users.unique_email', 'organizations.unique_slug'].includes(indexId)) {
      options.collation = { locale: 'en', strength: 2 };
    }
    db.getCollection(index.tableId).createIndex(keys, options);
  }

  print('Configured ' + model.doc.tableIds.length + ' collections and ' + model.doc.indexIds.length + ' indexes.');
})();
