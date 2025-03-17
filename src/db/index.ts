import { loadEnvVariables } from "../configs/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { usersTable } from "./schema/users";

loadEnvVariables();

export const db = drizzle(process.env.DATABASE_URL!);

// async function main() {
//   const user: typeof usersTable.$inferInsert = {
//     email: "testing@gmail.com",
//   };

//   await db.insert(usersTable).values(user);
//   console.log("Create new user!");

//   const users = await db.select().from(usersTable);
//   console.log("All users", users);
// }

// main();
