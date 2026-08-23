// Import from the generated client's local relative path, not the bare
// '@prisma/client' specifier: npm workspace hoisting means only one shared
// copy of the real @prisma/client package exists at the repo root, and its
// own forwarding to '.prisma/client' resolves relative to itself — i.e. to
// whichever service generated last — not to this service's own client.
// Every other file in this service that needs Prisma types re-exports them
// from here rather than importing '@prisma/client' directly.
export * from '../../node_modules/.prisma/client';
import { PrismaClient } from '../../node_modules/.prisma/client';

export const prisma = new PrismaClient();
