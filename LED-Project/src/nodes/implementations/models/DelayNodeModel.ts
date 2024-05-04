import { IDataSource } from "@nodes/definitions/DataSource";
import { IDataSourceSupplier, INodeModel, OnBlockSettings } from "@nodes/definitions/Node";
import { NumberDataSource } from "../datasources/NumberDataSource";

export class DelayNodeModel implements INodeModel {

    // Field for the delay
    private delayField = new NumberDataSource("delay", "100", {
        info: "How long the block will wait",
        type: "int",
        min: 10
    })

    getModelName(): string {
        return "delay";
    }
    getOnBlockSettings(): OnBlockSettings {
        return {
            category: "control",
            color: 240
        };
    }
    getBlockMessage(): string {
        return "wait %1 ms";
    }
    getOnBlockSources(): IDataSource<any>[] {
        return [this.delayField]
    }
    getSources(): IDataSource<any>[] {
        return [this.delayField]
    }
    createConfigWithProcedure(supplier: IDataSourceSupplier) {
        throw new Error("Method not implemented.");
    }

}