import * as React from "react"

import { cn } from "@/lib/utils"

function Table({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"table">) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-top text-sm", className)}
        ref={ref}
        {...props}
      />
    </div>
  )
}

function TableHeader({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      ref={ref}
      {...props}
    />
  )
}

function TableBody({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      ref={ref}
      {...props}
    />
  )
}

function TableRow({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      ref={ref}
      {...props}
    />
  )
}

function TableHead({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      ref={ref}
      {...props}
    />
  )
}

function TableCell({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      ref={ref}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
}
