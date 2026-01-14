# Dashboard-01: Modular Dashboard Layout

Based on shadcn/ui blocks dashboard-01 pattern.

## Features
- Sidebar + main content layout
- Interactive charts with ChartAreaInteractive
- Data tables with DataTable component
- Summary cards with SectionCards
- Responsive design with CSS variables
- Date range picker
- Export functionality

## Implementation Pattern

```tsx
"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Page() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2023, 0, 20),
    to: addDays(new Date(2023, 0, 20), 20),
  })

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-header shrink-0 items-center justify-between gap-2 bg-background p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <DatePickerWithRange date={date} setDate={setDate} />
            <Button size="sm">Download</Button>
          </div>
        </header>
        <div className="flex flex-col gap-4 p-4 pt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Subscriptions
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-muted-foreground">
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Now
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last hour
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  You made 265 sales this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

## Key Components for Universal Implementation

### Summary Cards Pattern
```tsx
interface StatCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon
}) => (
  <Card>
    <CardHeader>
      <HStack justify="space-between" align="center">
        <Text size="sm" colorTheme="mutedForeground">{title}</Text>
        {icon}
      </HStack>
    </CardHeader>
    <CardContent>
      <Text size="2xl" weight="bold">{value}</Text>
      <HStack spacing={1} align="center">
        <TrendIcon trend={trend} />
        <Text size="xs" colorTheme={trend === 'up' ? 'success' : 'destructive'}>
          {change}
        </Text>
      </HStack>
    </CardContent>
  </Card>
)
```

### Dashboard Grid Layout
```tsx
// Responsive grid for stat cards
<Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={4}>
  <StatCard title="Total Revenue" value="$45,231.89" change="+20.1%" trend="up" />
  <StatCard title="Subscriptions" value="+2350" change="+180.1%" trend="up" />
  <StatCard title="Sales" value="+12,234" change="+19%" trend="up" />
  <StatCard title="Active Now" value="+573" change="+201" trend="up" />
</Grid>

// Chart and activity layout
<Grid cols={{ base: 1, lg: 7 }} gap={4}>
  <Box gridColumn={{ base: "span 1", lg: "span 4" }}>
    <ChartCard title="Overview">
      <AreaChart data={overviewData} />
    </ChartCard>
  </Box>
  <Box gridColumn={{ base: "span 1", lg: "span 3" }}>
    <ActivityCard title="Recent Sales" description="You made 265 sales this month">
      <RecentSalesList />
    </ActivityCard>
  </Box>
</Grid>
```

### Header with Actions
```tsx
const DashboardHeader = () => (
  <Box
    position="sticky"
    top={0}
    bgTheme="background"
    borderBottomWidth={1}
    borderTheme="border"
    p={4}
  >
    <HStack justify="space-between">
      <HStack spacing={2}>
        <SidebarTrigger />
        <Separator orientation="vertical" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onPress={() => router.push('/dashboard')}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </HStack>
      <HStack spacing={2}>
        <DateRangePicker />
        <Button size="sm" variant="outline">
          <DownloadIcon size={16} />
          <Text ml={2}>Export</Text>
        </Button>
      </HStack>
    </HStack>
  </Box>
)
```

## Universal Design Considerations

1. **Layout Structure**
   - Use flex containers for responsive layout
   - Implement collapsible sidebar for mobile
   - Sticky header with breadcrumbs

2. **Data Visualization**
   - Use universal chart components
   - Ensure touch interactions work
   - Provide data table alternatives for accessibility

3. **Responsive Behavior**
   - Stack cards vertically on mobile
   - Hide sidebar on small screens
   - Adjust chart sizes dynamically

4. **Performance**
   - Lazy load chart data
   - Virtualize long lists
   - Optimize re-renders with memo

5. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - High contrast mode support