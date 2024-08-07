
import { SimpleProcedure } from "@procedure/implementations/SimpleProcedure"
import { DelayProcCodeConstructor, DelayProcDiagnostics, DelayProcLEDNode } from "@procedure/procedures/DelayProcedure"
import { LoopProcedure } from "@procedure/procedures/LoopProcedure/LoopProcedure"
import { SetLedRangeSimpleProcCodeConstructor, SetLedRangeSimpleProcDiagnostics, SetLedRangeSimpleProcLEDNode, SetLedRangeSimpleProcPreparer } from "@procedure/procedures/SetLedRangeSimpleProcedure"
import { SetLedSimpleProcCodeConstructor, SetLedSimpleProcDiagnostics, SetLedSimpleProcLEDNode } from "@procedure/procedures/SetLedSimpleProcedure"

// Used to register all procedures
export function registerProcedures() {
    return {
        loop: new LoopProcedure(),
        delay: new SimpleProcedure("delay", new DelayProcCodeConstructor(), new DelayProcDiagnostics(), new DelayProcLEDNode(), { delay: 100 }),
        setLedSimple: new SimpleProcedure("setled_simple", new SetLedSimpleProcCodeConstructor(), new SetLedSimpleProcDiagnostics(), new SetLedSimpleProcLEDNode(), { idx: 0, h: 1, s: 1, v: 1}),
        setLedRangeSimple: new SimpleProcedure("setled_range_simple", new SetLedRangeSimpleProcCodeConstructor(), new SetLedRangeSimpleProcDiagnostics(), new SetLedRangeSimpleProcLEDNode(), { h: 1, s: 1, v: 1, idxEnd: 16, idxStart: 0,ledDelay: 100 }, SetLedRangeSimpleProcPreparer),
    }
}