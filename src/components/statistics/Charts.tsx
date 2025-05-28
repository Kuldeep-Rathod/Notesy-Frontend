import {
    ArcElement,
    BarElement,
    CategoryScale,
    ChartData,
    Chart as ChartJS,
    ChartOptions,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

interface BarChartProps {
    horizontal?: boolean;
    data_1: number[];
    title_1: string;
    bgColor_1: string[];
    labels?: string[];
}

export const BarChart = ({
    data_1 = [],
    title_1,
    bgColor_1,
    horizontal = false,
    labels = months,
}: BarChartProps) => {
    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? 'y' : 'x',
        animation: {
            duration: 1000, // Specify the duration of the animation in milliseconds
            easing: 'easeOutBack', // You can choose different easing options
        },
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: true,
            },
        },

        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    const data: ChartData<'bar', number[], string> = {
        labels,
        datasets: [
            {
                label: title_1,
                data: data_1,
                backgroundColor: bgColor_1,
                barThickness: 'flex',
                barPercentage: 1,
                categoryPercentage: 0.4,
            },
            // {
            //     label: title_2,
            //     data: data_2,
            //     backgroundColor: bgColor_2,
            //     barThickness: 'flex',
            //     barPercentage: 1,
            //     categoryPercentage: 0.4,
            // },
        ],
    };

    return (
        <div style={{ width: horizontal ? '100%' : '100%', height: '465px' }}>
            <Bar
                options={options}
                data={data}
            />
        </div>
    );
};

interface DoughnutChartProps {
    labels: string[];
    data: number[];
    backgroundColor: string[];
    cutout?: number | string;
    legends?: boolean;
    offset?: number[];
}

export const DoughnutChart = ({
    labels,
    data,
    backgroundColor,
    cutout,
    legends = true,
    offset,
}: DoughnutChartProps) => {
    const doughnutData: ChartData<'doughnut', number[], string> = {
        labels,
        datasets: [
            {
                data,
                backgroundColor,
                borderWidth: 0,
                offset,
            },
        ],
    };

    const doughnutOptions: ChartOptions<'doughnut'> = {
        responsive: true,
        plugins: {
            legend: {
                display: legends,
                position: 'bottom',
                labels: {
                    padding: 40,
                },
            },
        },
        cutout,
    };

    return (
        <Doughnut
            data={doughnutData}
            options={doughnutOptions}
        />
    );
};

interface PieChartProps {
    labels: string[];
    data: number[];
    backgroundColor: string[];
    offset?: number[];
}

export const PieChart = ({
    labels,
    data,
    backgroundColor,
    offset,
}: PieChartProps) => {
    const pieChartData: ChartData<'pie', number[], string> = {
        labels,
        datasets: [
            {
                data,
                backgroundColor,
                borderWidth: 1,
                offset,
            },
        ],
    };

    const pieChartOptions: ChartOptions<'pie'> = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    return (
        <Pie
            data={pieChartData}
            options={pieChartOptions}
        />
    );
};

//--------------------------Line Chart----------------------------

interface LineChartProps {
    data: number[];
    labels?: string[];
    label: string;
    backgroundColor: string;
    borderColor: string;
    options?: ChartOptions<'line'>;
    height?: number | string;
    showTitle?: boolean;
}

export const LineChart = ({
    data,
    labels = [],
    label,
    backgroundColor,
    borderColor,
    options,
    height = 465,
    showTitle = false,
}: LineChartProps) => {
    const chartData: ChartData<'line', number[], string> = {
        labels,
        datasets: [
            {
                label,
                data,
                fill: true,
                backgroundColor,
                borderColor,
                tension: 0.4,
                pointBackgroundColor: borderColor,
                pointRadius: 3,
                pointHoverRadius: 5,
                borderWidth: 2,
            },
        ],
    };

    const defaultOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: showTitle,
                text: label,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { display: true },
            },
            x: {
                grid: { display: false },
            },
        },
    };

    return (
        <div style={{ width: '100%', height }}>
            <Line
                data={chartData}
                options={options ?? defaultOptions}
            />
        </div>
    );
};
