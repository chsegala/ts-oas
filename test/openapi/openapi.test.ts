import { resolve } from "path";
import { readFileSync, writeFileSync } from "fs";
import { expect } from "chai";
import SwaggerParser from "@apidevtools/swagger-parser";
import TypescriptOAS, { createProgram } from "../../src";

const openapiFile = JSON.parse(readFileSync(resolve(__dirname, `openapi.schema.json`), "utf8"));
const openapiWithRefFile = JSON.parse(readFileSync(resolve(__dirname, `openapi-with-ref.schema.json`), "utf8"));

const typeNames = ["GetAllBooksApi", "EditBookApi"];
const typeNamesForMapperTest = ["GetAllBooksApi", "EditBookApiWithMapper"];

const program = createProgram(["openapi.ts"], {}, resolve(__dirname));

describe("openapi", () => {
    it("should validate against SwaggerParser and json file", async () => {
        const tsoas = new TypescriptOAS(program, { customKeywords: ["thisIsCustom"] });
        const spec = tsoas.getOpenApiSpec(typeNames);

        // writeFileSync(resolve(__dirname, `openapi.schema.json`), JSON.stringify(spec), "utf8");

        expect(spec).to.deep.equal(openapiFile);
        await SwaggerParser.validate(spec as any, {});
    });

    it("should validate against SwaggerParser and json file with refs", async () => {
        const tsoas = new TypescriptOAS(program, { customKeywords: ["thisIsCustom"], ref: true });
        const spec = tsoas.getOpenApiSpec(typeNames);

        // writeFileSync(resolve(__dirname, `openapi-with-ref.schema.json`), JSON.stringify(spec), "utf8");

        expect(spec).to.deep.equal(openapiWithRefFile);
        await SwaggerParser.validate(spec as any, {});
    });

    it("should have custom defaultContentType", async () => {
        const tsoas = new TypescriptOAS(program, {
            customKeywords: ["thisIsCustom"],
            defaultContentType: "application/json",
        });
        const spec = tsoas.getOpenApiSpec(typeNames);

        const pathKeys = Object.keys(spec.paths);
        const pathMethodKeys = Object.keys(spec.paths[pathKeys[0]]);
        expect(spec.paths[pathKeys[0]][pathMethodKeys[0]]["responses"]["200"]["content"]).to.have.property(
            "application/json"
        );
    });

    it("should validate against SwaggerParser and json file using ApiMapper", async () => {
        const tsoas = new TypescriptOAS(program, { customKeywords: ["thisIsCustom"] });
        const spec = tsoas.getOpenApiSpec(typeNamesForMapperTest);

        await SwaggerParser.validate(spec as any, {});
        expect(spec).to.deep.equal(openapiFile);
    });

    it("should validate other docs", async () => {
        const tags = [{ name: "abcd" }, { name: "efg" }];
        const info = { title: "custom title", version: "12.3.4", description: "this is description" };

        const tsoas = new TypescriptOAS(program, { customKeywords: ["thisIsCustom"] });
        const spec = tsoas.getOpenApiSpec(typeNames, { tags, info });

        expect(spec.tags).to.equal(tags);
        expect(spec.info).to.equal(info);
    });
});
