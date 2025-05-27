import React, { useState,useEffect,useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components you plan to use
ChartJS.register(CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const GraphChart = ({ Label, GraphData }) => {
  // Extract only the first value from GraphData
  // const singleValueData = [GraphData[0]];

  const [graphData, setData] = useState({
    labels: [],
    datasets: [
      {
        label: Label,
        data: [],
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  });

  const data = {
    labels: [new Date().toLocaleString()], // Only one label for the single value
    datasets: [
      {
        label: Label,
        data: [GraphData],
        fill: false,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'SmartWheelsGraph',
      },
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Label',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  };

  useEffect(() => {
    setData((prevData) => ({
      ...prevData,
      labels: [...prevData.labels, new Date().toLocaleTimeString()],
      datasets: [
        {
          ...prevData.datasets[0],
          data: [...prevData.datasets[0].data, GraphData],
        },
      ],
    }))
  }, [GraphData]); // Dependency on GraphData to update the chart data

  return (
    <div className="chart-container">
         <Line data={graphData} options={options} />
    </div>
  );
};

export default GraphChart;
