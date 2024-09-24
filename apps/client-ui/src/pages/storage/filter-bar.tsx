import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table";
import { DataTableToolbar } from "./components/data-table-toolbar";
import { tasks } from "./data";

export default function FileFilterBar() {
  const table = useReactTable({
    data: tasks,
    columns: [
      {
        id: "title",
        header: "Title",
        accessorFn: (row) => row.title,
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.status,
      },
      {
        id: "priority",
        header: "Priority",
        accessorFn: (row) => row.priority,
      },
    ],
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="px-4 py-2">
      <DataTableToolbar table={table}></DataTableToolbar>
    </div>
  );
}
