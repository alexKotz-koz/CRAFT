import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
const SimplePieChart = ({ data, title }) => {
    const COLORS = ['#0088FE', '#FF8042'];

    return (
        <div className="col-4">
            <h5 className="text-center">{title}</h5>
            <PieChart width={400} height={400}>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
}

export default SimplePieChart;