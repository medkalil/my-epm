import { useState } from 'react';

interface PaginationState {
  page: number;
  size: number;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
}

export function usePagination(initialPage = 0, initialSize = 10): PaginationState {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  return { page, size, setPage, setSize };
}