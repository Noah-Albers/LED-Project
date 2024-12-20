import { Defaults } from "@webapp/stores/ProjectStore";
import { z } from "zod";
import { int, min } from "../ZodUtil"
import { BasePreviewSchema } from "./previews/PreviewSchema";

// #region Workspace and node schema

// Base schema used for node exports (Required because it shall be recursive)
const BaseNodeSchema = z.object({
    type: z.string(),
    data: z.record(z.any())
})

export type ExportedNodeType = z.infer<typeof BaseNodeSchema> & {
    subnodes?: ExportedNodeType[]
}

export type ExportedNodeStackType = z.infer<typeof NodeStackSchema>;

const NodeSchema: z.ZodType<ExportedNodeType> = BaseNodeSchema.extend({
    subnodes: z.lazy(() => NodeSchema.array()).optional(),
})

const NodeStackSchema = z.object({
    x: z.number(),
    y: z.number(),
    nodes: z.array(NodeSchema)
})

//#endregion

//#region Schemas

const InternalSchemas = {

    WorkspaceSchema: z.object({
        loop: NodeStackSchema,
        setup: NodeStackSchema,
        other: z.array(NodeStackSchema)
    }),

    // The schema to store user defined variables
    VariablesSchema: z.array(z.object({
        name: z.string(),
        value: z.union([z.number(), z.string()])
    })),

    // The settings schema
    SettingsSchema: z.object({
        codeBlueprint: z.string().optional(),
        hooks: z.object({
            pushleds: z.string().optional(),
            sleep: z.string().optional(),
            sethsv: z.string().optional(),
            millis: z.string().optional(),

            setup: z.string().optional(),
            loop: z.string().optional(),
        }),

        ledApiHooks: z.object({
            globalCode: z.string().optional(),
            includeCode: z.string().optional(),
            pushleds: z.string().optional(),
            sethsv: z.string().optional(),
            reservedVariables: z.string().optional(),
            setupCode: z.string().optional(),
        }),

        selectedPreview: z.union([
            z.any().transform(int()).transform(min(0)),
            z.string()
        ]),

        previews: z.array(BasePreviewSchema),

        pin: z.any().transform(int()).transform(min(0)),
        amount: z.any().transform(int()).transform(min(0)),

        loopPushLeds: z.boolean().default(Defaults.loopPushLeds),
        trimEmptyLines: z.boolean().default(Defaults.trimEmptyLines),

        customReservedKeywords: z.array(z.string()),
        useArduinoReservedKeywords: z.boolean(),
    })
}


export const ProjectSchema = z.object({
    settings: InternalSchemas.SettingsSchema,
    variables: InternalSchemas.VariablesSchema,
    workspace: InternalSchemas.WorkspaceSchema
})

//#endregion

//#region Main Types

export type ExportedProjectType = z.infer<typeof ProjectSchema>;
export type ExportedSettingsType = z.infer<typeof InternalSchemas.SettingsSchema>
export type ExportedWorkspaceType = z.infer<typeof InternalSchemas.WorkspaceSchema>
export type ExportedVariablesType = z.infer<typeof InternalSchemas.VariablesSchema>

//#endregion