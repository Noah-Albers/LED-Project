<template>
    <!-- Navigation bar -->
    <v-navigation-drawer width="60" permanent location="right">

        <!-- Upper list -->
        <v-list lines="one" density="default">
            <v-list-item v-tooltip:left="item.name()" v-for="(item, key) in MainViews" @click="store.mainView = key" :key="key"
                :active="store.mainView === item.name()" :prepend-icon="item.icon">
            </v-list-item>
        </v-list>

        <!-- Lower list -->
        <template v-slot:append>
            <v-list lines="one" density="comfortable">

                <v-list-item rounded="xl" v-for="(item, idx) in bottomItems" @click="item.action" :key="idx"
                    :prepend-icon="item.icon" v-tooltip:left="item.title">
                </v-list-item>
            </v-list>
        </template>

    </v-navigation-drawer>
</template>

<script setup
    lang="ts">

    import { MainViews, useSettingsStore } from "@webapp/stores/SettingsStore";
    import { Signals } from '@webapp/utils/signals/Signals';
    import { sendSignalAwaitResponse } from "@webapp/utils/signals/SignalAwaiter";
    import { generateCode } from "@webapp/views/codeview/CodeGenerator"
    import { ProcedureWithOptions } from '@procedure/definitions/Procedure';
    import { SignalDispatcher } from "@webapp/utils/signals/SignalDispatcher";
    import { $t } from "@localisation/Fluent";

    const store = useSettingsStore();

    /**
     * When the copy-code button is clicked
     */
    async function onCopyCodeClicked() {

        try {
            // Gets the config
            const { setup, loop } = await sendSignalAwaitResponse(Signals.REQUEST_CONFIG_BUILD, undefined, Signals.BLOCKLY_ALL_CREATE_CONFIG) as { setup: ProcedureWithOptions<any>[], loop: ProcedureWithOptions<any>[] };

            // Build the code
            const code = generateCode(setup, loop);

            await navigator.clipboard.writeText(code);

            SignalDispatcher.emit(Signals.DISPLAY_SNACKBAR, { text: $t('popup_codecopied') })
        } catch (err) {
            console.error("Failed to copy / create code", err);
        }
    }

    // Menu items on the bottom
    const bottomItems = [
        {
            title: $t('navbar_settings'),
            icon: "mdi-cog",
            action: () => SignalDispatcher.emit(Signals.OPEN_SETTINGS)
        },
        {
            title: $t('navbar_copycode'),
            icon: "mdi-code-tags",
            action: onCopyCodeClicked
        }
    ]


    </script>

<style lang="scss"></style>