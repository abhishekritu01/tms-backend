const SHIPPERS = ["Acme Logistics", "BluePeak", "Northwind", "SkyRail", "Pioneer"];
const CARRIERS = ["TransGlobal", "FleetPro", "RapidHaul", "LiftLine", "CargoWay"];
const CITIES = [
  "Dallas, TX",
  "Chicago, IL",
  "Miami, FL",
  "Denver, CO",
  "Seattle, WA",
  "Phoenix, AZ",
  "Atlanta, GA",
  "Boston, MA",
  "Nashville, TN",
  "Portland, OR",
];
const STATUSES = ["Booked", "In Transit", "Delivered", "Delayed", "Cancelled"];

function randFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}



function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function buildTrackingEvents(pickupDate, status) {
  const base = new Date(pickupDate);
  const steps = [
    { label: "Pickup scheduled", offset: -1 },
    { label: "Picked up", offset: 0 },
    { label: "In transit", offset: 1 },
    { label: "Out for delivery", offset: 3 },
    { label: "Delivered", offset: 4 },
  ];

  const limit = status === "Delivered" ? steps.length : randInt(2, 4);
  return steps.slice(0, limit).map((step) => ({
    status: step.label,
    location: randFrom(CITIES),
    timestamp: formatDate(addDays(base, step.offset)),
  }));
}

export function seedShipments(count = 120) {
  const now = new Date();
  return Array.from({ length: count }).map((_, idx) => {
    const pickupOffset = randInt(-10, 5);
    const pickup = addDays(now, pickupOffset);
    const delivery = addDays(pickup, randInt(1, 6));
    const status = randFrom(STATUSES);
    return {
      id: `SHP-${1000 + idx}`,
      shipperName: randFrom(SHIPPERS),
      carrierName: randFrom(CARRIERS),
      pickupLocation: randFrom(CITIES),
      deliveryLocation: randFrom(CITIES),
      status,
      rate: parseFloat((randInt(900, 3800) + Math.random()).toFixed(2)),
      pickupDate: formatDate(pickup),
      deliveryDate: formatDate(delivery),
      trackingEvents: buildTrackingEvents(pickup, status),
      metadata: {
        mode: randFrom(["FTL", "LTL", "Intermodal", "Air"]),
        weightLbs: randInt(500, 40000),
        reference: `REF-${randInt(10000, 99999)}`,
      },
    };
  });
}
