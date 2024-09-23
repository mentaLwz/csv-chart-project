import CSVUploaderAndChart from '@/components/csv-uploader-and-chart'

export default function Home() {
  return (
    <main className="w-full mx-auto py-10 px-20">
      <h1 className="text-3xl font-bold mb-6 text-center">CSV Data Visualizer</h1>
      <CSVUploaderAndChart />
    </main>
  )
}