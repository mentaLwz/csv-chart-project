"use client"

import React, { useState } from 'react'
import Papa from 'papaparse'
import ReactECharts from 'echarts-for-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CSVUploaderAndChart() {
  const [chartData, setChartData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [pieChartData, setPieChartData] = useState<{ processName: string } | null>(null)
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const parsedData = result.data as string[][]
          setColumns(parsedData[0])
          const aggregatedData = aggregateData(parsedData.slice(1))
          setChartData(aggregatedData)
        },
        header: false,
      })
    }
  }

  const aggregateData = (data: string[][]) => {
    const instanceMap: { [key: string]: { [key: string]: { [key: string]: number } } } = {}

    data.forEach(row => {
      const instanceId = row[0]
      const processName = row[1]
      const cpuCore = row[3]
      const cpuTime = parseFloat(row[4])

      if (!instanceMap[instanceId]) {
        instanceMap[instanceId] = {}
      }
      if (!instanceMap[instanceId][processName]) {
        instanceMap[instanceId][processName] = {}
      }
      instanceMap[instanceId][processName][cpuCore] = cpuTime
    })

    return Object.keys(instanceMap).map(instanceId => ({
      instanceId,
      ...instanceMap[instanceId]
    }))
  }

  const getChartOption = () => {
    const allProcesses = new Set<string>()
    chartData.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'instanceId') {
          allProcesses.add(key)
        }
      })
    })
    const processes = Array.from(allProcesses)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: processes
      },
      xAxis: {
        type: 'category',
        data: chartData.map(row => row.instanceId)
      },
      yAxis: {
        type: 'value'
      },
      series: processes.map(process => ({
        name: process,
        type: 'bar',
        data: chartData.map(row => {
          const coreData = row[process]
          if (coreData) {
            return Object.values(coreData).reduce((sum, time) => sum + time, 0)
          }
          return 0
        }),
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        emphasis: {
          itemStyle: {
            color: '#ff7f50'
          }
        },
        onClick: (params: any) => {
          console.log('Clicked bar:', params)
          const processName = params.seriesName
          setPieChartData({ processName })
        }
      }))
    }
  }

  const getPieChartOptions = () => {
    if (!pieChartData) return null

    const { processName } = pieChartData
    const pieCharts = chartData.map(row => {
      const coreData = row[processName]
      if (!coreData) return null

      const coreEntries = Object.entries(coreData)

      return {
        title: {
          text: `${processName} on Instance ${row.instanceId}`,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
          {
            name: 'CPU Time',
            type: 'pie',
            radius: '50%',
            data: coreEntries.map(([core, time]) => ({
              name: `Core ${core}`,
              value: time
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    }).filter(Boolean) // Filter out null values

    return pieCharts
  }

  const getInstanceChartOption = () => {
    if (!selectedInstance) return null

    const instanceData = chartData.find(row => row.instanceId === selectedInstance)
    if (!instanceData) return null

    const allProcesses = new Set<string>()
    chartData.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'instanceId') {
          allProcesses.add(key)
        }
      })
    })
    const processes = Array.from(allProcesses)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: processes
      },
      xAxis: {
        type: 'category',
        data: processes
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: selectedInstance,
          type: 'bar',
          data: processes.map(process => {
            const coreData = instanceData[process]
            if (coreData) {
              return Object.values(coreData).reduce((sum, time) => sum + time, 0)
            }
            return 0
          })
        }
      ]
    }
  }

  const getInstancePieChartOption = () => {
    if (!selectedInstance) return null

    const instanceData = chartData.find(row => row.instanceId === selectedInstance)
    if (!instanceData) return null

    const allProcesses = new Set<string>()
    chartData.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'instanceId') {
          allProcesses.add(key)
        }
      })
    })
    const processes = Array.from(allProcesses)

    const processEntries = processes.map(process => {
      const coreData = instanceData[process]
      if (coreData) {
        return {
          name: process,
          value: Object.values(coreData).reduce((sum, time) => sum + time, 0)
        }
      }
      return {
        name: process,
        value: 0
      }
    })

    return {
      title: {
        text: `Process CPU Time Portion on Instance ${selectedInstance}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [
        {
          name: 'CPU Time',
          type: 'pie',
          radius: '50%',
          data: processEntries,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>CSV Data Visualizer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <Button asChild>
            <label htmlFor="csv-upload">Upload CSV</label>
          </Button>
        </div>
        {chartData.length > 0 && (
          <ReactECharts
            option={getChartOption()}
            style={{ height: '400px', width: '100%' }}
            onEvents={{
              click: (params: any) => {
                console.log('Chart clicked:', params)
                const processName = params.seriesName
                setPieChartData({ processName })
              }
            }}
          />
        )}
        {pieChartData && (
          <div className="flex flex-wrap">
            {getPieChartOptions()?.map((option, index) => (
              <div key={index} className="w-1/2 p-2">
                <ReactECharts
                  option={option}
                  style={{ height: '400px', width: '100%' }}
                />
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          {chartData.map(row => (
            <label key={row.instanceId} className="mr-4">
              <input
                type="radio"
                name="instance"
                value={row.instanceId}
                checked={selectedInstance === row.instanceId}
                onChange={() => setSelectedInstance(row.instanceId)}
                className="mr-2"
              />
              {row.instanceId}
            </label>
          ))}
        </div>
        {selectedInstance && (
          <div className="mt-4">
            <ReactECharts
              option={getInstanceChartOption()}
              style={{ height: '400px', width: '100%' }}
            />
            <ReactECharts
              option={getInstancePieChartOption()}
              style={{ height: '400px', width: '100%', marginTop: '20px' }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}