import "dotenv/config";
import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./schema.js";
import { resolvers, createLoaders } from "./resolvers.js";
import { getUserFromRequest, signToken, ROLE } from "./auth.js";
import { seedShipments } from "./data/seed.js";

const app = express();
const PORT = process.env.PORT || 4000;

const store = seedShipments(160);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.post("/auth/mock-login", (req, res) => {
  const role = req.body?.role === ROLE.ADMIN ? ROLE.ADMIN : ROLE.EMPLOYEE;
  const token = signToken({ userId: `user-${role}`, role });
  res.json({ token, role });
});

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => {
      const user = getUserFromRequest(req);
      return {
        user,
        store,
        loaders: createLoaders(store),
      };
    },
  })
);

app.listen(PORT, () => {
  const adminToken = signToken({ userId: "admin-1", role: ROLE.ADMIN });
  const employeeToken = signToken({ userId: "employee-1", role: ROLE.EMPLOYEE });
  console.log(`TMS GraphQL running at http://localhost:${PORT}/graphql`);
  console.log("Admin token:", adminToken);
  console.log("Employee token:", employeeToken);
});
