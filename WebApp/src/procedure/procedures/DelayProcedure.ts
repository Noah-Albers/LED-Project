import { IDiagnostics } from "@procedure/definitions/ProcDiagnostics";
import { ILEDNode } from "@procedure/definitions/ProcLEDNode";
import { ICppFnManager } from "@cppgen/functionManager";
import { CodeResult, IExtendedCodeSupport } from "@cppgen/generator";
import { IVisualisationController } from "@visualizer/index";
import { CC_CppFnHandles, ICodeConstructor } from "@procedure/definitions/ProcCodeConstructor";
import { ensureNonNaNs } from "@procedure/utils/ProcedurePrepareUtils";

export type DelayProcedureOptions = {
    delay: number
}

export function DelayProcPreparer(cfg: DelayProcedureOptions) {
    ensureNonNaNs(cfg);

    if(cfg.delay < 0)
        cfg.delay = 0;
}

export class DelayProcLEDNode implements ILEDNode<DelayProcedureOptions> {
    async startNode(options: DelayProcedureOptions, ctrl: IVisualisationController): Promise<void> {
        ctrl.pushUpdate();
        await ctrl.sleep(options.delay);
    }
}

export class DelayProcDiagnostics implements IDiagnostics<DelayProcedureOptions> {

    evaluateRuntime(opts: DelayProcedureOptions): number | undefined {
        return opts.delay;
    }

    findAllAccessedLeds(opts: DelayProcedureOptions): Set<number> {
        return new Set();
    }
}

export class DelayProcCodeConstructor implements ICodeConstructor<DelayProcedureOptions> {

    registerFunctions(cppFnManager: ICppFnManager<IExtendedCodeSupport>, calls: DelayProcedureOptions[]) {
        return [];
    }

    constructCode(options: DelayProcedureOptions, genTools: IExtendedCodeSupport, associatedFunctions: CC_CppFnHandles<{}>, dirtyState: boolean): CodeResult {
        
        const code = `${dirtyState ? genTools.pushLeds() : ''}\n${genTools.sleep(options.delay)}`;

        return {
            code: code,
            dirtyState: false
        }
    }
}
