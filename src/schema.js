import { gql } from "graphql-tag";

export const typeDefs = gql`
  type TrackingEvent {
    status: String!
    location: String!
    timestamp: String!
  }

  type ShipmentMetadata {
    mode: String
    weightLbs: Int
    reference: String
  }

  type Shipment {
    id: ID!
    shipperName: String!
    carrierName: String!
    pickupLocation: String!
    deliveryLocation: String!
    status: String!
    rate: Float
    pickupDate: String
    deliveryDate: String
    trackingEvents: [TrackingEvent!]!
    metadata: ShipmentMetadata
  }

  input ShipmentFilter {
    id: ID
    status: String
    shipperName: String
    carrierName: String
    pickupLocation: String
    deliveryLocation: String
  }

  input ShipmentInput {
    shipperName: String
    carrierName: String
    pickupLocation: String
    deliveryLocation: String
    status: String
    rate: Float
    pickupDate: String
    deliveryDate: String
  }

  type ShipmentPage {
    data: [Shipment!]!
    totalCount: Int!
    page: Int!
    totalPages: Int!
  }

  type Query {
    shipments(
      page: Int
      limit: Int
      sortBy: String
      sortOrder: String
      filter: ShipmentFilter
    ): ShipmentPage!
    shipment(id: ID!): Shipment
  }

  type Mutation {
    addShipment(input: ShipmentInput!): Shipment!
    updateShipment(id: ID!, input: ShipmentInput!): Shipment!
    deleteShipment(id: ID!): Boolean!
  }
`;
