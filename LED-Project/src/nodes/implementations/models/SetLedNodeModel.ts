import { IDataSource } from "@nodes/definitions/DataSource";
import { IDataSourceSupplier, INodeModel, OnBlockSettings } from "@nodes/definitions/Node";
import { NumberDataSource } from "../datasources/NumberDataSource";
import { ColorDataSource, VariableColorType } from "../datasources/ColorDataSource";
import { ColorRangeDataSource } from "../datasources/ColorRangeDataSource";
import { Registry } from "@registry/Registry";

export class SetLedNodeModel implements INodeModel {

    // Index of the field
    private idxField = new NumberDataSource("idx", "0", {
        info: "Index of the led. Starting from 0 (first).",
        type: "int",
        min: 0
    })

    // Field to select the color
    private colorField = new ColorDataSource("clr", [1,1,1], {
        info: "what color should be set"
    });

    getModelName(): string {
        return "setled_simple";
    }
    getOnBlockSettings(): OnBlockSettings {
        return {
            category: "led",
            color: 100
        };
    }
    getBlockMessage(): string {
        return "Led %1 in %2";
    }
    getOnBlockSources(): IDataSource<any, any>[] {
        return [this.idxField, this.colorField]
    }
    getSources(): IDataSource<any, any>[] {
        return this.getOnBlockSources();
    }
    createConfigWithProcedure(supplier: IDataSourceSupplier) {

        const clr = supplier.get(this.colorField);

        return {
            procedure: Registry.procedures.setLedSimple,
            options: {
                idx: supplier.get(this.idxField),
                h: clr[0],
                s: clr[1],
                v: clr[2]
            }
        }
    }

    hasSubNodes(): boolean {
        return false;
    }
}