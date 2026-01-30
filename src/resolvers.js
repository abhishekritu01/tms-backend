import DataLoader from "dataloader";
import { requireRole, ROLE } from "./auth.js";

function normalize(value) {
  return String(value || "").toLowerCase();
}

function matchesFilter(shipment, filter) {
  if (!filter) return true;
  return Object.entries(filter).every(([key, value]) => {
    if (value === undefined || value === null || value === "") return true;
    return normalize(shipment[key]).includes(normalize(value));
  });
}

function compareValues(a, b, sortOrder) {
  if (a === b) return 0;
  if (a === undefined || a === null) return 1;
  if (b === undefined || b === null) return -1;
  const direction = sortOrder === "desc" ? -1 : 1;
  if (a > b) return direction;
  return -direction;
}

export function createLoaders(data) {
  return {
    shipmentById: new DataLoader(async (ids) => {
      const map = new Map(data.map((item) => [item.id, item]));
      return ids.map((id) => map.get(id) || null);
    }),
  };
}

export const resolvers = {
  Query: {
    shipments: (_, args, context) => {
      const { page = 1, limit = 12, sortBy = "pickupDate", sortOrder = "asc", filter } = args;
      const filtered = context.store
        .filter((shipment) => matchesFilter(shipment, filter))
        .sort((a, b) => compareValues(a[sortBy], b[sortBy], sortOrder));

      const totalCount = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));
      const currentPage = Math.min(Math.max(1, page), totalPages);
      const start = (currentPage - 1) * limit;
      const end = start + limit;
      return {
        data: filtered.slice(start, end),
        totalCount,
        page: currentPage,
        totalPages,
      };
    },
    shipment: async (_, { id }, context) => {
      return context.loaders.shipmentById.load(id);
    },
  },
  Mutation: {
    addShipment: (_, { input }, context) => {
      requireRole(context.user, [ROLE.ADMIN]);
      const newShipment = {
        id: `SHP-${Date.now()}`,
        shipperName: input.shipperName || "New Shipper",
        carrierName: input.carrierName || "New Carrier",
        pickupLocation: input.pickupLocation || "Unknown",
        deliveryLocation: input.deliveryLocation || "Unknown",
        status: input.status || "Booked",
        rate: input.rate || 0,
        pickupDate: input.pickupDate || null,
        deliveryDate: input.deliveryDate || null,
        trackingEvents: [],
        metadata: {
          mode: "FTL",
          weightLbs: 0,
          reference: `REF-${Math.floor(Math.random() * 100000)}`,
        },
      };
      context.store.unshift(newShipment);
      context.loaders.shipmentById.clear(newShipment.id);
      return newShipment;
    },
    updateShipment: (_, { id, input }, context) => {
      requireRole(context.user, [ROLE.ADMIN]);
      const index = context.store.findIndex((shipment) => shipment.id === id);
      if (index === -1) {
        throw new Error("Shipment not found");
      }
      const updated = {
        ...context.store[index],
        ...input,
      };
      context.store[index] = updated;
      context.loaders.shipmentById.clear(id);
      return updated;
    },
    deleteShipment: (_, { id }, context) => {
      requireRole(context.user, [ROLE.ADMIN]);
      const index = context.store.findIndex((shipment) => shipment.id === id);
      if (index === -1) {
        throw new Error("Shipment not found");
      }
      context.store.splice(index, 1);
      context.loaders.shipmentById.clear(id);
      return true;
    },
  },
};
