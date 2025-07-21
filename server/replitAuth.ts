// This file has been modified to disable Replit authentication for local-only operation.

import type { Express, RequestHandler } from "express";

export async function setupAuth(app: Express) {
  console.log("Replit authentication disabled for local development.");
  // No-op for local development
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Always allow access for local development
  next();
};
