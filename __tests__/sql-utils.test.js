const { formatSqlInsert } = require("../utils/sql-utils");

describe("formatSqlInsert", () => {
    test("When given an empty object returns an columns object containing three empty arrays (columns, params and values)", () => {
        expect(formatSqlInsert({})).toEqual({ columns: [], params: [], values: [] });
    });
    test("When given an empty object returns an optionalColumns object containing three empty arrays (columns, params and values)", () => {
        expect(formatSqlInsert({}, {})).toEqual({ columns: [], params: [], values: [] });
    });
    test("columns, params and values arrays should have always same length)", () => {
        const obj = formatSqlInsert({ name: "john" });
        expect(obj.columns.length).toBe(1);
        expect(obj.params.length).toBe(1);
        expect(obj.values.length).toBe(1);
        const obj2 = formatSqlInsert({ name: "john", age: 23 }, { test: "hi" });
        expect(obj2.columns.length).toBe(3);
        expect(obj2.params.length).toBe(3);
        expect(obj2.values.length).toBe(3);
    });
    test("When properties in optionalColums also exist in columns, optionalColums values should be used", () => {
        expect(formatSqlInsert({ name: "john" }, { name: "mark" }).values).toEqual(["mark"]);
        expect(formatSqlInsert({ age: 23 }, { age: 30 }).values).toEqual([30]);
        expect(formatSqlInsert({ age: 23 }, { age: null }).values).toEqual([null]);
    });
    test("When a property with undefined value is passed in optionalColums should not be added into the arrays.", () => {
        expect(formatSqlInsert({}, { name: undefined })).toEqual({ columns: [], params: [], values: [] });
        expect(formatSqlInsert({}, { name: undefined, age: undefined })).toEqual({ columns: [], params: [], values: [] });
        expect(formatSqlInsert({}, { name: undefined, age: undefined, test: "Hello!" })).toEqual({ columns: ["test"], params: ["$1"], values: ["Hello!"] });
    });
    test("When a property with undefined value is passed in optionalColums should not be added into the arrays even when is defined in columns", () => {
        expect(formatSqlInsert({ name: "john" }, { name: undefined })).toEqual({ columns: [], params: [], values: [] });
        expect(formatSqlInsert({ name: "john", age: 23 }, { name: undefined, age: undefined })).toEqual({ columns: [], params: [], values: [] });
        expect(formatSqlInsert({ name: "john", age: 23, test: "Hello!" }, { name: undefined, age: undefined })).toEqual({ columns: ["test"], params: ["$1"], values: ["Hello!"] });
    });
    describe("When given an object returns an object containing three arrays", () => {
        expect(formatSqlInsert({ name: "john" })).toEqual({ columns: ["name"], params: ["$1"], values: ["john"] });
        expect(formatSqlInsert({}, { name: "john" })).toEqual({ columns: ["name"], params: ["$1"], values: ["john"] });
        expect(formatSqlInsert({ name: "john" }, { age: 23 })).toEqual({ columns: ["name", "age"], params: ["$1", "$2"], values: ["john", 23] });

        const columns = { name: "john", age: 30, username: "john_doe", surname: undefined };
        const optionalColumns = { email: "john@john.co.uk", phone: undefined };
        expect(formatSqlInsert(columns, optionalColumns)).toEqual({
            columns: ["name", "age", "username", "surname", "email"],
            params: ["$1", "$2", "$3", "$4", "$5"],
            values: ["john", 30, "john_doe", undefined, "john@john.co.uk"]
        });
    });
    test("Columns contains the keys of columns object)", () => {
        expect(formatSqlInsert({ name: "john" }).columns).toEqual(["name"]);
        expect(formatSqlInsert({ name: "john", age: 23 }).columns).toEqual(["name", "age"]);
    });
    test("Columns contains the keys of optionalColumns object)", () => {
        expect(formatSqlInsert({}, { name: "john" }).columns).toEqual(["name"]);
        expect(formatSqlInsert({}, { name: "john", age: 23 }).columns).toEqual(["name", "age"]);
    });
    test("Values contains the values of columns object)", () => {
        expect(formatSqlInsert({ name: "john" }).values).toEqual(["john"]);
        expect(formatSqlInsert({ name: "john", age: 23 }).values).toEqual(["john", 23]);
    });
    test("Values contains the values of optionalColumns object)", () => {
        expect(formatSqlInsert({}, { name: "john" }).values).toEqual(["john"]);
        expect(formatSqlInsert({}, { name: "john", age: 23 }).values).toEqual(["john", 23]);
    });
    test("Params contains the SQL parameterized values of columns object)", () => {
        expect(formatSqlInsert({ name: "john" }).params).toEqual(["$1"]);
        expect(formatSqlInsert({ name: "john", age: 23 }).params).toEqual(["$1", "$2"]);
    });
    test("Params contains the SQL parameterized values of optionalColumns object)", () => {
        expect(formatSqlInsert({}, { name: "john" }).params).toEqual(["$1"]);
        expect(formatSqlInsert({}, { name: "john", age: 23 }).params).toEqual(["$1", "$2"]);
    });
    test("Columns contains the keys of the join from columns and optionalColumns objects)", () => {
        expect(formatSqlInsert({ name: "john" }, { age: 23 }).columns).toEqual(["name", "age"]);

        const columns = { name: "john", age: 30, username: "john_doe", surname: undefined };
        const optionalColumns = { email: "john@john.co.uk", phone: undefined };
        expect(formatSqlInsert(columns, optionalColumns).columns).toEqual(["name", "age", "username", "surname", "email"]);
    });
    test("Params contains the SQL parameterized values of the join from columns and optionalColumns objects)", () => {
        expect(formatSqlInsert({ name: "john" }, { age: 23 }).params).toEqual(["$1", "$2"]);

        const columns = { name: "john", age: 30, username: "john_doe", surname: undefined };
        const optionalColumns = { email: "john@john.co.uk", phone: undefined };
        expect(formatSqlInsert(columns, optionalColumns).params).toEqual(["$1", "$2", "$3", "$4", "$5"]);
    });
    test("Values contains the values of the join from columns and optionalColumns objects)", () => {
        expect(formatSqlInsert({ name: "john" }, { age: 23 }).values).toEqual(["john", 23]);

        const columns = { name: "john", age: 30, username: "john_doe", surname: undefined };
        const optionalColumns = { email: "john@john.co.uk", phone: undefined };
        expect(formatSqlInsert(columns, optionalColumns).values).toEqual(["john", 30, "john_doe", undefined, "john@john.co.uk"]);
    });
    describe("Purer function", () => {
        test("Should not mutate original columns object", () => {
            const obj = { name: "john", age: 23 };
            const ref = { ...obj };
            formatSqlInsert(obj, { test: "hi" });
            expect(obj).toEqual(ref);
        });
        test("Should not mutate original optionalColumns object", () => {
            const obj = { name: "john", age: 23 };
            const ref = { ...obj };
            formatSqlInsert({ test: "hi" }, obj);
            expect(obj).toEqual(ref);
        });
    });
});