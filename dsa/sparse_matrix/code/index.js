class SparseMatrix {
    constructor(matrixFilePath = null, numRows = null, numCols = null) {
        if (matrixFilePath) {
            this.matrix = {};
            const { numRows, numCols } = this._read_matrix_from_file(matrixFilePath);
            this.numRows = numRows;
            this.numCols = numCols;
        } else {
            this.numRows = numRows;
            this.numCols = numCols;
            this.matrix = {};
        }
    }

    _read_matrix_from_file(matrixFilePath) {
        const fs = require('fs');
        const lines = fs.readFileSync(matrixFilePath, 'utf-8').split('\n').map(line => line.trim());

        try {
            let numRows = parseInt(lines[0].split('=')[1]);
            let numCols = parseInt(lines[1].split('=')[1]);

            for (let i = 2; i < lines.length; i++) {
                let line = lines[i];
                if (line && line.startsWith('(') && line.endsWith(')')) {
                    let parts = line.slice(1, -1).split(',');
                    let row = parseInt(parts[0].trim());
                    let col = parseInt(parts[1].trim());
                    let value = parseInt(parts[2].trim());
                    this.matrix[[row, col]] = value;
                } else if (line) {
                    throw new Error("Input file has wrong format");
                }
            }

            return { numRows, numCols };
        } catch (error) {
            throw new Error("Input file has wrong format");
        }
    }

    getElement(currRow, currCol) {
        return this.matrix[[currRow, currCol]] || 0;
    }

    setElement(currRow, currCol, value) {
        if (value !== 0) {
            this.matrix[[currRow, currCol]] = value;
        } else {
            delete this.matrix[[currRow, currCol]];
        }
    }

    add(other) {
        if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
            throw new Error("Matrices dimensions do not match for addition");
        }

        let result = new SparseMatrix(null, this.numRows, this.numCols);
        for (let key in this.matrix) {
            let [row, col] = key.split(',').map(Number);
            result.setElement(row, col, this.matrix[key] + other.getElement(row, col));
        }

        for (let key in other.matrix) {
            let [row, col] = key.split(',').map(Number);
            if (!(key in this.matrix)) {
                result.setElement(row, col, other.matrix[key]);
            }
        }

        return result;
    }

    subtract(other) {
        if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
            throw new Error("Matrices dimensions do not match for subtraction");
        }

        let result = new SparseMatrix(null, this.numRows, this.numCols);
        for (let key in this.matrix) {
            let [row, col] = key.split(',').map(Number);
            result.setElement(row, col, this.matrix[key] - other.getElement(row, col));
        }

        for (let key in other.matrix) {
            let [row, col] = key.split(',').map(Number);
            if (!(key in this.matrix)) {
                result.setElement(row, col, -other.matrix[key]);
            }
        }

        return result;
    }

    multiply(other) {
        if (this.numCols !== other.numRows) {
            throw new Error("Number of columns in the first matrix must equal the number of rows in the second matrix");
        }

        let result = new SparseMatrix(null, this.numRows, other.numCols);

        for (let key in this.matrix) {
            let [i, j] = key.split(',').map(Number);
            for (let k = 0; k < other.numCols; k++) {
                result.setElement(i, k, result.getElement(i, k) + this.matrix[key] * other.getElement(j, k));
            }
        }

        return result;
    }

    print_matrix() {
        for (let row = 0; row < this.numRows; row++) {
            let rowStr = '';
            for (let col = 0; col < this.numCols; col++) {
                rowStr += this.getElement(row, col) + "\t";
            }
            console.log(rowStr);
        }
    }

    print_sparse_matrix() {
        for (let key in this.matrix) {
            let [row, col] = key.split(',').map(Number);
            console.log(`(${row}, ${col}, ${this.matrix[key]})`);
        }
    }
}

// Example usage:
const fs = require('fs');
const readline = require('readline-sync');

const matrix1 = new SparseMatrix("easy_sample_02_2.txt");
const matrix2 = new SparseMatrix("easy_sample_02_2.txt");

let operation = readline.question("Select operation: add, subtract, multiply: ");

let result;
switch (operation) {
    case "add":
        result = matrix1.add(matrix2);
        break;
    case "subtract":
        result = matrix1.subtract(matrix2);
        break;
    case "multiply":
        result = matrix1.multiply(matrix2);
        break;
    default:
        console.log("Invalid operation selected");
        process.exit(1);
}

console.log("Resulting Matrix:");
result.print_sparse_matrix();
