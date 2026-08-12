import type { Request } from 'express';

export interface Paginacion {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

/** Lee page/pageSize de la query string y los deja en rangos seguros. */
export function leerPaginacion(req: Request, pageSizeDefecto: number, pageSizeMax: number): Paginacion {
  const pageCruda = parseInt(String(req.query.page ?? '1'), 10);
  const pageSizeCruda = parseInt(String(req.query.pageSize ?? String(pageSizeDefecto)), 10);

  const page = Number.isFinite(pageCruda) && pageCruda > 0 ? pageCruda : 1;
  const pageSize =
    Number.isFinite(pageSizeCruda) && pageSizeCruda > 0
      ? Math.min(pageSizeCruda, pageSizeMax)
      : pageSizeDefecto;

  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function envolverPaginado<T>(items: T[], total: number, p: Paginacion) {
  return {
    items,
    page: p.page,
    pageSize: p.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / p.pageSize)),
  };
}
