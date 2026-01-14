import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { View, Dimensions } from "react-native"
// Removed card imports - using Box instead
import { Button } from "../Button"
import { HStack } from "../Stack"
import { Box } from "../Box"
import { Text } from "../Text"
import { SpacingScale } from "@/lib/design-system"
import { useTheme } from "@/lib/theme/theme-provider"

export const description = "An interactive area chart"

// Generate sample data
const generateChartData = () => {
  const data = []
  const now = new Date()
  
  for (let i = 120; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    const baseDesktop = 250 + Math.random() * 250
    const baseMobile = 150 + Math.random() * 250
    
    data.push({
      date: date.toISOString().split('T')[0],
      desktop: Math.floor(baseDesktop),
      mobile: Math.floor(baseMobile),
    })
  }
  
  return data
}

const chartData = generateChartData()

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useTheme()
  
  if (active && payload && payload.length) {
    return (
      <View style={{
        backgroundColor: theme.popover,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 6,
        padding: 8,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }}>
        <Text style={{ fontSize: 12, color: theme.mutedForeground, marginBottom: 4 }}>
          {new Date(label).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
        {payload.map((entry: any, index: number) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 2 }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: entry.color,
              marginRight: 6,
            }} />
            <Text style={{ fontSize: 12, color: theme.mutedForeground, marginRight: 4 }}>
              {entry.name}:
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.foreground }}>
              {entry.value.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    )
  }
  
  return null
}

export function AreaChartInteractive() {
  const theme = useTheme()
  const [isMobile, setIsMobile] = React.useState(false)
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    const updateIsMobile = () => {
      const { width } = Dimensions.get('window')
      setIsMobile(width < 768)
    }
    
    updateIsMobile()
    const subscription = Dimensions.addEventListener('change', updateIsMobile)
    return () => subscription?.remove()
  }, [])

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    const now = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    
    return chartData.filter((item) => {
      const date = new Date(item.date)
      const startDate = new Date(now)
      startDate.setDate(startDate.getDate() - daysToSubtract)
      return date >= startDate
    })
  }, [timeRange])

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: theme.primary || "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: theme.accent || "hsl(var(--chart-2))",
    },
  }

  return (
    <Box 
      bgTheme="card" 
      borderWidth={1} 
      borderTheme="border" 
      rounded="lg" 
      style={{ overflow: 'hidden' }}
    >
      <Box p={4 as SpacingScale}>
        <Box>
          <HStack justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Text size="lg" weight="semibold" colorTheme="foreground">
                Visitor Analytics
              </Text>
              <Text size="sm" colorTheme="mutedForeground" style={{ marginTop: 4 }}>
                Track your website visitors by device type
              </Text>
            </Box>
            <HStack spacing={1}>
              <Button
                size="sm"
                variant={timeRange === "7d" ? "secondary" : "ghost"}
                onPress={() => setTimeRange("7d")}
              >
                {isMobile ? "7d" : "Last 7 days"}
              </Button>
              <Button
                size="sm"
                variant={timeRange === "30d" ? "secondary" : "ghost"}
                onPress={() => setTimeRange("30d")}
              >
                {isMobile ? "30d" : "Last 30 days"}
              </Button>
              <Button
                size="sm"
                variant={timeRange === "90d" ? "secondary" : "ghost"}
                onPress={() => setTimeRange("90d")}
              >
                {isMobile ? "3m" : "Last 3 months"}
              </Button>
            </HStack>
          </HStack>
        </Box>
      </Box>
      <Box px={0 as SpacingScale} pb={4 as SpacingScale}>
        <div style={{ 
          height: 250, 
          width: '100%', 
          paddingLeft: 16,
          paddingRight: 16,
          transition: 'all 0.3s ease-in-out',
          overflow: 'hidden'
        }}>
          <ResponsiveContainer width="100%" height="100%" debounce={100}>
            <AreaChart
              data={filteredData}
              margin={{ top: 20, right: 20, bottom: 20, left: 5 }}
            >
              <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartConfig.desktop.color}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartConfig.desktop.color}
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartConfig.mobile.color}
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartConfig.mobile.color}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid 
                vertical={false} 
                stroke={theme.border}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: theme.mutedForeground, fontSize: 11 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
                interval={Math.floor(filteredData.length / 7)}
                minTickGap={60}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: theme.mutedForeground, fontSize: 11 }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}k`;
                  }
                  return value.toString();
                }}
                width={45}
                domain={[0, 'dataMax + 50']}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: theme.border, strokeWidth: 1 }}
                animationDuration={200}
                position={{ x: undefined, y: undefined }}
                allowEscapeViewBox={{ x: false, y: false }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Area
                dataKey="mobile"
                type="natural"
                fill="url(#fillMobile)"
                stroke={chartConfig.mobile.color}
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="url(#fillDesktop)"
                stroke={chartConfig.desktop.color}
                strokeWidth={2}
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Box>
    </Box>
  )
}