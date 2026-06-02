import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { locationsRouter } from "./routes/locations.ts";
import { initScheduler } from "./scheduler.ts";

dotenv.config();

const app = express();

app.use(express.json());
app.use((req, _res, next) => {
  // eslint-disable-next-line no-console
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", locationsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);

  const message = err instanceof Error ? err.message : "Internal Server Error";
  const isProd = (process.env.NODE_ENV ?? "development") === "production";
  res.status(500).json(
    isProd
      ? { message: "Internal Server Error" }
      : {
          message,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          stack: err instanceof Error ? err.stack : undefined,
        }
  );
});

const port = Number(process.env.PORT ?? "3001");

async function start() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("Missing MONGODB_URI");

  await mongoose.connect(mongoUri);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${port}`);

    initScheduler();
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

