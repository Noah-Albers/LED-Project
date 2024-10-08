import { ProcedureWithOptions } from "@procedure/definitions/Procedure";
import { IDataSource } from "./DataSource";

export interface IDataSourceSupplier {

    /**
     * Used to get data of a data source
     * @param source 
     */
    get<X>(source: IDataSource<any,X,any>) : X;

    /**
     * Used to retreive the config and procedures of subblocks which have been registered
     * 
     * @note the hasSubNodes Property must return true on the node-model for this to work
     */
    buildConfigOfSubnodes() : ProcedureWithOptions<any,any>[];

    /**
     * Return the value of a variable
     * @param name the name of the requested variable
     * @param defaultValue return value if the variable doesn't exist
     */
    getVariable(name: string, defaultValue: number = 0) : number;

    /**
     * Takes in a math-expression with known variables and uses the solver to get the resulting value
     * 
     * @param exp the math expression
     * @param defaultValue a default value to return if the expression results in an error
     */
    solveExpression(exp: string, defaultValue: number = 0) : number;
}

/**
 * Defines some settings for the blockly block which are used during construction
 */
export type OnBlockSettings = {
    /**
     * Which category the block should be sorted to inside the toolbox
     */
    category: string,
    /**
     * The color HUE which will be the primary color of the block.
     * Values between 0-360
     */
    color: number
}

export interface INodeModel {

    /**
     * @returns if the model has submodels
     */
    hasSubNodes() : boolean;

    /**
     * @returns a key which is unique for every model. This is the name that blockly uses later on to identify the block itself.
     */
    getModelName() : string;

    /**
     * @returns settings that are used to configure the block
     */
    getOnBlockSettings() : OnBlockSettings;

    /**
     * @returns String that represents the message to use for the block
     */
    getBlockMessage() : string;

    /**
     * @returns a list of all Bricks which shall be used to construct the blockly block. 
     */
    getOnBlockSources() : IDataSource<any, any, any>[];

    /**
     * @returns all datasources which the node shall use
     */
    getSources() : IDataSource<any, any, any>[];

    /**
     * This is called once the node shall be evaluated
     * 
     * @param supplier the object to access to get data from the ui
     * @returns a procedure with options to call that procedure.
     */
    createConfigWithProcedure(supplier: IDataSourceSupplier) : ProcedureWithOptions
}