import { ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

// Function to format the date labels
const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:00`;
};

const TimeLinePlot = ({ data, title, lineDataKey }) => {
    return (
        <div className="col-8">
            <h5 className="text-center">{title}</h5>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 100 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatXAxis} angle={-45} textAnchor="end" />
                    <YAxis />
                    <Tooltip />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                    <Line type="monotone" dataKey={lineDataKey} stroke="#0088FE" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TimeLinePlot;