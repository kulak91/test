import CartParser from "./CartParser.js";
import { validate as validateUUID } from "uuid";
// import path from "path";
import { writeFileSync, readFileSync, unlinkSync } from 'fs'

import path from 'node:path';
// import { fileURLToPath } from 'node:url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

let parser;

console.error = () => {};

beforeEach(() => {
	parser = new CartParser();
});


describe("CartParser - unit tests", () => {
  // describe("CartParser", () => {
      it("should read the contents of a file", () => {
        // const fs = require("fs");
        const tmpFile = "test-cart.csv";
        const contents = parser.readFile("./samples/cart.csv");
        writeFileSync(tmpFile, contents);

        const expectedContents = readFileSync(tmpFile, "utf8");
        expect(expectedContents).toEqual(contents);

        const actualContents = parser.readFile(tmpFile);

        expect(actualContents).toEqual(expectedContents);

        unlinkSync(tmpFile);
      });

      it("should throw an error, when path is empty", () => {
        expect(() => parser.parse("")).toThrow();
      });

      it("should create an error object", () => {
        const error = parser.createError(
          "cell",
          2,
          1,
          'Expected cell to be a nonempty string but received "".'
        );
        expect(error.type).toBe("cell");
        expect(error.row).toBe(2);
        expect(error.column).toBe(1);
        expect(error.message).toBe(
          'Expected cell to be a nonempty string but received "".'
        );
      });

    // });

    describe("validate", () => {
      it("should return an empty array if the contents are valid", () => {
        const contents = parser.readFile("./samples/cart.csv");
        const errors = parser.validate(contents);
        expect(errors).toHaveLength(0);
      });

	  it('should throw an error if a cell is empty', () => {
		const contents = './samples/empty_cell_cart.csv';

		expect(() => parser.parse(contents)).toThrow();
	  });
    });

    describe("parseLine", () => {
      it("should parse a CSV line into an object", () => {
        const line = "Mollis consequat,9.00,2";
        const item = parser.parseLine(line);
        expect(item).toEqual({
          name: "Mollis consequat",
          price: 9,
          quantity: 2,
          id: expect.any(String),
        });
      });
    });

    describe("calcTotal", () => {
      it("should calculate the total price of a cart", () => {

        const cardData = {
          items: [
            {
              price: 1,
              quantity: 2,
            },
            {
              price: 5,
              quantity: 5,
            }
          ]
        };
        const total = parser.calcTotal(cardData.items);
        expect(total).toBeCloseTo(27);
      });
    });

    describe("parse", () => {
      it("should parse a CSV file and return the cart items and total price", () => {
        const result = parser.parse("./samples/cart.csv");
        expect(result.items).toEqual([
          {
            id: expect.any(String),
            name: "Mollis consequat",
            price: 9,
            quantity: 2,
          },
          {
            id: expect.any(String),
            name: "Tvoluptatem",
            price: 10.32,
            quantity: 1,
          },
          {
            id: expect.any(String),
            name: "Scelerisque lacinia",
            price: 18.9,
            quantity: 1,
          },
          {
            id: expect.any(String),
            name: "Consectetur adipiscing",
            price: 28.72,
            quantity: 10,
          },
          {
            id: expect.any(String),
            name: "Condimentum aliquet",
            price: 13.9,
            quantity: 1,
          },
        ]);
        expect(result.total).toBeCloseTo(348.32);
      });

      it("should throw an error if path is incorrect", () => {
        expect(() => parser.parse("/testFiles/invalidCart.csv")).toThrow();
      });
    });

	it('should throw an error if a cell has a negative number', () => {
		const path = './samples/negative_cart.csv';

		expect(() => {
		  parser.parse(path);
		}).toThrow('Validation failed!');
	  });
});

describe("CartParser - integration test", () => {
  test("Parse should read csv file and return JSON for valid path", () => {
    const validCsvPath = path.join(__dirname, "../samples/cart.csv");
    const expectedOutput = {
      items: [
        {
          name: "Mollis consequat",
          price: 9,
          quantity: 2,
          id: expect.any(String),
        },
        {
          name: "Tvoluptatem",
          price: 10.32,
          quantity: 1,
          id: expect.any(String),
        },
        {
          name: "Consectetur adipiscing",
          price: 28.72,
          quantity: 10,
          id: expect.any(String),
        },
        {
          name: "Condimentum aliquet",
          price: 13.9,
          quantity: 1,
          id: expect.any(String),
        },
      ],
      total: 348.32,
    };

    const output = parser.parse(validCsvPath);

    expect(output.list).toEqual(expectedOutput.list);
    expect(output.total).toBe(expectedOutput.total);
  });
});
