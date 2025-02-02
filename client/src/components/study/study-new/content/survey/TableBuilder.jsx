import React, { useState } from 'react';

const TableBuilder = ({ onTableChange }) => {
  const [numRows, setNumRows] = useState(0);
  const [numColumns, setNumColumns] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [columnNames, setColumnNames] = useState([]);

  const handleNumRowsChange = (e) => {
    const rows = parseInt(e.target.value, 10);
    setNumRows(rows);
    setTableData(Array.from({ length: rows }, () => Array(numColumns).fill('')));
  };

  const handleNumColumnsChange = (e) => {
    const columns = parseInt(e.target.value, 10);
    setNumColumns(columns);
    setTableData(Array.from({ length: numRows }, () => Array(columns).fill('')));
    setColumnNames(Array.from({ length: columns }, (_, i) => `Column ${i + 1}`));
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newTableData = [...tableData];
    newTableData[rowIndex][colIndex] = value;
    setTableData(newTableData);
    onTableChange(newTableData, columnNames);
  };

  const handleColumnNameChange = (colIndex, value) => {
    const newColumnNames = [...columnNames];
    newColumnNames[colIndex] = value;
    setColumnNames(newColumnNames);
    onTableChange(tableData, newColumnNames);
  };

  return (
    <div>
      <div className="mb-3">
        <label htmlFor="numRows">Number of Rows</label>
        <input
          type="number"
          id="numRows"
          className="form-control"
          value={numRows}
          onChange={handleNumRowsChange}
          min="0"
          max="100"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="numColumns">Number of Columns</label>
        <input
          type="number"
          id="numColumns"
          className="form-control"
          value={numColumns}
          onChange={handleNumColumnsChange}
          min="0"
          max="100"
        />
      </div>
      {numRows > 0 && numColumns > 0 && (
        <table className="table table-bordered">
          <thead>
            <tr>
              {Array.from({ length: numColumns }).map((_, colIndex) => (
                <th key={colIndex}>
                  <input
                    type="text"
                    className="form-control"
                    value={columnNames[colIndex]}
                    onChange={(e) => handleColumnNameChange(colIndex, e.target.value)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numRows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: numColumns }).map((_, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      className="form-control"
                      value={tableData[rowIndex][colIndex]}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TableBuilder;