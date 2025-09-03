import type { Express, RequestHandler } from "express";
    4 
    5     export async function setupAuth(app: Express) {
    6       console.log("Replit authentication disabled for local development.");
    7       // No-op for local development
    8     }
    9 
   10     export const isAuthenticated: RequestHandler = async (req, res, next) => {
   11       // Always allow access for local development
   12       next();
   13     };
