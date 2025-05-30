import { EventArgsPopup } from "./SignalArgumentTypes";

export const Signals = Object.freeze({
    /**
     * Signals which request a specific vue component to render a new component and put it into a different html context
     */
    BLOCKLY_REQUEST_VUE_HTML_INJECT: 9,
    BLOCKLY_REQUEST_VUE_HTML_DETACH: 10,

    /**
     * When a variable is added/removed or changed by the user
     */
    VAR_CHANGE: 1,

    /**
     * Requests the blockly workspace to build the config and then emit the normal events for that
     */
    REQUEST_CONFIG_BUILD: 6,

    /**
     * Requests the application to show a snackbar with the given information
     * @argument {EventArgsSnackbar} the data to display inside the snackbar
     */
    DISPLAY_SNACKBAR: 7,

    /**
     * Request the application to show a mini information display to the user.
     * This is unobstructive
     * @argument {EventArgsMiniInfo} the data to display
     */
    DISPLAY_MINI_INFO: 15,

    /**
     * Requests the application to show a popup with the given message and a yes/no button with custom messages
     * @argument {EventArgsPopup} the data to display to the snackbar
     */
    DISPLAY_POPUP: 13,

    /**
     * Requests the settings tab to open
     */
    OPEN_SETTINGS: 14,

    /** Requests the keyboard-info popup to show */
    OPEN_KEYBOARD_INFO: 16,

    /** Requests the visualizer to copy the loaded led amount to the projects used amount. That only if its loaded */
    REQUEST_COPY_PREVIEW_AMT_TO_LED_AMT: 17,

    //#region Blockly-Events

    /**
     * When a blockly block is selected or unselected.
     * @argument {Block | null} the block that got selected, or null
     */
    BLOCKLY_BLOCK_SELECTION_CHANGE: 0,

    /**
     * When the blockly workspaces (re)creates the config and sends it.
     * Preview is a config based on what the user has selected and all is the full config which includes the setup and loop blocks
     */
    BLOCKLY_PREVIEW_CREATE_CONFIG: 4,
    BLOCKLY_ALL_CREATE_CONFIG: 5,

    /**
     * Requests blockly to send the current workspace instance
     */
    BLOCKLY_REQUEST_WORKSPACE: 8,

    /**
     * Event: When the user click into the blockly workspace
     * Used to ensure vuetify registers blockly click events
     */
    BLOCKLY_CLICK_IN_WORKSAPCE: 11,

    /**
     * Event: Used to set a flag that disabled the application from retreiving and using blockly-events
     * Used to prevent a self dos when loading big project-files
     */
    BLOCKLY_SET_DISABLE_BLOCKLY_EVENTS_FLAG: 12

    //#endregion
})