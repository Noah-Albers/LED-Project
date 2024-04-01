import { CppArgs, ICppFnCallGenerator, IPreCppFn } from "../Types";
import cppTypeToString from "../utils/CppTypesToString";

export class CppFnCallGenerator implements ICppFnCallGenerator {

    // Holds for every registered function, the arguments that must be supplied with a function call.
    private fnRequirements: {[key: string]: string[]};

    constructor(fnRequirements: {[key: string]: string[]}){
        this.fnRequirements = fnRequirements;
    }
    
    /**
     * TODO: Comment
     * @param fn 
     * @param call 
     * @returns 
     * @throws {Error} if the types and values of the supplied data and defined cpp types dont match up
     * @throws {Error} if the supplied function isn't registered with the cpp-generator that created this class
     */
    public getCallFor<Args extends CppArgs>(fn: IPreCppFn<Args>, call: Args): string {
        let name = fn.getName();

        if(this.fnRequirements[name] === undefined) throw new Error("getCallFor was called with a non-registered function");

        let typeByArg = fn.internal_getTypeMappings();
        let requiredArgs = this.fnRequirements[fn.getName()];

        // Prints all arguments to string that can be pasted into a cpp-function call and then joins them all together
        let joinedArgs = requiredArgs.map(arg=>cppTypeToString(typeByArg[arg], call[arg])).join(", ");

        return `${name}(${joinedArgs});`;
    }
}