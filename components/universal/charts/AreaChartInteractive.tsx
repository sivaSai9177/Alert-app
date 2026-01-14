import * as React from "react"
import { View, Dimensions } from "react-native"
// Removed card imports - using Box instead
import { Button, HStack, Box, Text } from "../index"
import { SpacingScale } from "@/lib/design-system"
import { AreaChart as NativeAreaChart } from "./AreaChart"
import { useTheme } from "@/lib/theme/theme-provider"

export const description = "An interactive area chart"

// Generate sample data
const chartData = (() => {
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
})()

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
        <View style={{ height: 250, width: '100%', paddingHorizontal: 16, backgroundColor: 'transparent' }}>
          <NativeAreaChart
            data={{
              labels: filteredData.map((d, index) => {
                // Show fewer labels to avoid crowding
                if (filteredData.length > 30 && index % 7 !== 0) return '';
                if (filteredData.length > 14 && index % 3 !== 0) return '';
                if (filteredData.length > 7 && index % 2 !== 0) return '';
                return new Date(d.date).toLocaleDateString("en-US", { 
                  month: "short", 
                  day: "numeric" 
                });
              }),
              datasets: [
                {
                  label: 'Desktop',
                  data: filteredData.map(d => d.desktop),
                  filled: true,
                  color: chartConfig.desktop.color,
                  strokeWidth: 2,
                },
                {
                  label: 'Mobile',
                  data: filteredData.map(d => d.mobile),
                  filled: true,
                  color: chartConfig.mobile.color,
                  strokeWidth: 2,
                },
              ],
            }}
            height={250}
            showGrid
            showXAxis
            showYAxis
            bezier
            showPoints={false}
            style={{ width: '100%' }}
          />
        </View>
      </Box>
    </Box>
  )
}