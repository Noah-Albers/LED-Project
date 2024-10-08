import { BlockSvg, utils as BlocklyUtils } from "blockly";
import { ExportedNodeStackType, ExportedNodeType, ExportedSettingsType, ExportedVariablesType, ExportedWorkspaceType, ProjectSchema } from "./ProjectSchema";
import { Registry } from "@registry/Registry";
import { getWorkspace, resetWorkspace } from "@webapp/utils/blockly/BlockUtils";
import { getBlockDataObject, getBlockModel } from "@webapp/blockly/OnBlockUtils";
import { useVariableStore } from "@webapp/stores/VariableStore";
import { useProjectStore } from "@webapp/stores/ProjectStore";
import { BLOCKLY_SUBBLOCKY_NAME } from "@webapp/blockly/RegisterBlockly";
import { $t } from "@localisation/Fluent";
import { SignalDispatcher } from "@webapp/utils/signals/SignalDispatcher";
import { Signals } from "@webapp/utils/signals/Signals";

// Imports the project settings
function importProjectSettings(filename: string, data: ExportedSettingsType, path: string|undefined){
    useProjectStore().importData(filename, data, path);
}

// Imports the variables and returns the new map which can be used to import the nodes
function importVariables(data: ExportedVariablesType){

    const store = useVariableStore();

    // Removes old variables
    store.clearAllVariables();

    // Adds the new variables
    for(let nVar of data)
        store.addNewVariable(nVar.name, nVar.value);
    
    return store.variable2ValueMap;
}

// Takes in exported workspace data and the already importet variables and  then loads the workspace from them
async function importWorkspace(data: ExportedWorkspaceType, variables: {[name: string]: number}){

    // Takes in a single node and retreives the blockly-object from it
    function parseNode(node: ExportedNodeType, appendTo?: BlockSvg){
        // Ignores unregistered nodes
        if(Registry.nodeModels.find(nd=>nd.getModelName() === node.type) === undefined)
            return;

        // Creates a new block
        const block = ws.newBlock(node.type);
        block.initSvg();
        block.render();	

        // Tries to load the data
        const mdl = getBlockModel(block)!;
        const dataObj = getBlockDataObject(block)!;

        // Gets all sources
        const sources = [...new Set([...mdl.getSources(), ...mdl.getOnBlockSources()])];

        for(let src of sources){
            try {
                dataObj[src.getKey()] = src.import(node.data[src.getKey()], variables);
            }catch(err){
                console.warn("Error importing datasource, falling back on default",err);
            }
        }

        // Handles possible subblocks
        if(mdl.hasSubNodes() && node.subnodes !== undefined){
            // Creates the blocks (Reversed to load them correctly)
            for(let i=node.subnodes.length-1; i>=0;i--) {
                const subnode = node.subnodes[i];

                // Parses the block
                const subBlock = parseNode(subnode)!;
                block.getInput(BLOCKLY_SUBBLOCKY_NAME)!.connection!.connect(subBlock.previousConnection);
            }
        }

        if(appendTo !== undefined)
            appendTo.nextConnection.connect(block.previousConnection);

        return block;
    }

    // Takes in a stack of top blocks, loads them and then adds them to the workspace
    function importTopBlock(main: ExportedNodeStackType, attachTo?: BlockSvg){

        // Parses all blocks
        let head = attachTo;
        let previous = attachTo;

        for(let nd of main.nodes){
            let res = parseNode(nd, previous);

            if(head === undefined)
                head = res;

            if(res !== undefined)
                previous = res;
        }

        if(head === undefined)
            return;

        // Moves the head into position
        head.moveTo(new BlocklyUtils.Coordinate(main.x, main.y));

        return head;
    }

    // Disables event-interpretation for blockly events
    SignalDispatcher.emit(Signals.BLOCKLY_SET_DISABLE_BLOCKLY_EVENTS_FLAG,true);

    const ws = await getWorkspace();

    // Resets the workspace
    const { setup, loop } = resetWorkspace(ws);
    
    // Imports setup, loop and any other top blocks
    importTopBlock(data.setup, setup);
    importTopBlock(data.loop, loop);
    data.other.forEach(blg=>importTopBlock(blg));

    // TODO: Add some sort of signal that waits until the workspace has finished being build
    setTimeout(()=>{
        // Enabled event-interpretation for blockly events
        SignalDispatcher.emit(Signals.BLOCKLY_SET_DISABLE_BLOCKLY_EVENTS_FLAG,false);
    },1000);

}

// Function to check if any nodes of the given workspace are not found
function checkUnrecognizedNodes(schema: ExportedWorkspaceType){
    // Find exported nodes which use a node that doesn't exist
    function findNonExistentOfNodeStack(nodeStack: ExportedNodeType[]){
        return (
            nodeStack.filter(itm=>Registry.nodeModels.find(reg=>reg.getModelName() === itm.type) === undefined)
            .map(node=>node.type)
        );
    }

    // Gets a list of all node types which dont exist but are required to fully load t he config
    const noneExistentNodes = [
        schema.loop.nodes,
        schema.setup.nodes,
        ...schema.other.map(x=>x.nodes)
    ].map(findNonExistentOfNodeStack).flatMap(x=>x);

    // Gets the amount of nodes
    const len = noneExistentNodes.length;

    return {
        amount: len,
        names: [...new Set(noneExistentNodes)]
    }
}

type ImportResult = {
    success: boolean,
    message?: string
}

export async function importProject(filename: string, raw: unknown, doAskUser: (msg: string, btnTrue: string, btnFalse: string)=>Promise<boolean>, path: string|undefined) : Promise<ImportResult>{

    // Askes if the user really wants to import the project as his previous work would be gone
    if(!await doAskUser($t('import_prompt_reallywant'), $t('import_prompt_reallywant_yes'), $t('import_prompt_reallywant_no')))
        return { success: false }

    // Ensures the raw project is given
    if(typeof raw === "string"){
        // Tries to parse
        try {
            raw = JSON.parse(raw);
        }catch(err){
            return {
                success: false,
                message: `${err}`
            }
        }
    }

    // Tries to import the project
    var res = ProjectSchema.safeParse(raw);
    if(!res.success)
        return {
            message: res.error.message,
            success: false
        };

    // Checks if there are any unrecognized nodes
    const noneExistentNodes = checkUnrecognizedNodes(res.data.workspace);
    if(noneExistentNodes.amount > 0){
        // Askes the user if he wants to abort importing the project or if he wants to continue
        const msg = $t('import_prompt_unrecognizednodes', {
            amount: noneExistentNodes.amount,
            names: noneExistentNodes.names.join("', '")
        });


        const askRes = await doAskUser(msg, $t('import_prompt_unrecognizednodes_yes'), $t('import_prompt_unrecognizednodes_no'));

        if(askRes !== true)
            return {
                success: false,
                message: undefined   
            }
    }
    
    // 1. Import variables
    const vars = importVariables(res.data.variables);
    
    // 2. Import project settings
    importProjectSettings(filename,res.data.settings, path);
    
    // 3. Import blocks
    await importWorkspace(res.data.workspace, vars);

    // Sends the signal to reconfigure the workspace
    SignalDispatcher.emit(Signals.REQUEST_CONFIG_BUILD);

    return {
        success: true
    }
}
