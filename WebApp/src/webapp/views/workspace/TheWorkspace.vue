<template>
    <RequestInject />
    <div ref="blocklyDiv" style="height: 100%"></div>
</template>

<script lang="ts" setup>
import { SignalDispatcher } from '@webapp/utils/signals/SignalDispatcher';
import { Signals } from '@webapp/utils/signals/Signals';
import Blockly, { BlocklyOptions } from 'blockly';
import { ref } from 'vue';
import { resetWorkspace } from "@webapp/utils/blockly/BlockUtils";
import { onMounted } from 'vue';
import { createToolbox } from "@webapp/blockly/RegisterBlockly";
import { buildWorkspaceAndSendEvents } from "./WorkspaceConfigBuilder"; 
import { useSignal } from "@webapp/utils/vue/VueSignalListener";
import RequestInject from "./RequestInject.vue";

const Options: BlocklyOptions = {
    theme: "project_blockly_theme",
    collapse: false,
    comments: false,
    disable: false,
    maxBlocks: Infinity,
    trashcan: true,
    media: "blocklyAssets",
    horizontalLayout: false,
    toolboxPosition: "start",
    css: true,
    rtl: false,
    scrollbars: true,
    sounds: true,
    oneBasedIndex: true,
    grid: {
        spacing: 20,
        length: 1,
        colour: "#888",
        snap: false
    },
    zoom: {
        controls: true,
        wheel: true,
        startScale: 1,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
    }
};

const Toolbox = createToolbox();

// Workspace reference (HTML)
const blocklyDiv = ref(null);
// Workspace reference (Injected)
let workspace: Blockly.WorkspaceSvg;

// Used to disable blockly events
let eventsDisabledFlag: boolean = false;

useSignal([Signals.REQUEST_CONFIG_BUILD, Signals.VAR_CHANGE], ()=>buildWorkspaceAndSendEvents(workspace, true));
useSignal(Signals.BLOCKLY_REQUEST_WORKSPACE,res=>res(workspace));
useSignal(Signals.BLOCKLY_SET_DISABLE_BLOCKLY_EVENTS_FLAG, x=>eventsDisabledFlag=x);

// Event: Blockly fired an event
function onWorkspaceChangeEvent(evt: Blockly.Events.Abstract){
    if(eventsDisabledFlag) return;

    switch(evt.type){
        // Waits for a block change (Select / deselect)
        case Blockly.Events.SELECTED:
            SignalDispatcher.emit(Signals.BLOCKLY_BLOCK_SELECTION_CHANGE, workspace.getBlockById((evt as any).newElementId)!);
        case Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE: case Blockly.Events.CREATE: case Blockly.Events.MOVE: case Blockly.Events.CHANGE:
            // Runs the blockly change event
            buildWorkspaceAndSendEvents(workspace);
            return;
        case Blockly.Events.CLICK:
            // Dispatches an event to signal that the workspace has been clicked
            // Used to help vuetify close some menu's which otherwise wont register the click
            SignalDispatcher.emit(Signals.BLOCKLY_CLICK_IN_WORKSAPCE);
            break;
    }
}

onMounted(() => {

    // Creates the workspace
    workspace = Blockly.inject(blocklyDiv.value!, {
        toolbox: Toolbox,
        ...Options
        // Other configuration options as needed
    });

    Blockly.svgResize(workspace);

    // Awaits a resize event and updates blockly accordingly
    var obs = new ResizeObserver(_ => Blockly.svgResize(workspace));
    obs.observe(blocklyDiv.value!);

    // Creates the default workspace
    resetWorkspace(workspace);

    // Listens for blockly-events
    workspace.addChangeListener(onWorkspaceChangeEvent);
});

</script>