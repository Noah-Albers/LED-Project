import { $t, SupportedLanguagesType } from '@localisation/Fluent';
import { defineStore } from 'pinia'
import { reactive, Ref, ref } from 'vue';

// Note: The function to the translation key is so that it isn't initialized until needed (Prevents wrong and invalid translations)
export type View = keyof typeof MainViews

export const ViewVisualizer = "visualizer" as const;
export const ViewCode = "code" as const;
export const ViewSerial = "serial" as const;

export const MainViews = {
    [ViewCode]: { icon: "mdi-code-tags", name: ()=>$t('view_code_name') },
    [ViewVisualizer]: { icon: "mdi-play-box-outline", name: ()=>$t("view_visualizer_name") },
    [ViewSerial]: { icon: "mdi-usb", name: ()=>$t('view_serial_name') }
} as const;

export const DefaultVendors: [string, number][] = [
    ["Arduino", 0x2341],
    ["EspressIF", 0x303A]
];


// List of all buildin previews (Filenames)
export const BuildInPreviews = ["Goggles.svg", "Ring-16px.svg"];

export const useSettingsStore = defineStore('settings', () => {

    // Prevents duplicated default assignments when the restoreDefaults function is called anyway every time the store is initialized
    const __setRef = <T>() => ref(undefined as T);
    const __set = <T>() => undefined as T;

    //#region Settings

    // List of recently opened project paths
    const recentProjectPaths: Ref<string[]> = ref([]);

    // Which language is selected
    const language = __setRef<SupportedLanguagesType>();

    // If the developermode is enabled
    const isDeveloper = __setRef<boolean>();

    // Which view is selected
    const mainView = __setRef<View>();

    // Settings for the serial preview
    // TODO: Maybe remove in the future
    const serialPreview = reactive({
        pin: __set<number>(),
        ledAmount: __set<number>(),
    });

    // Settings for whitelisting USB-Vendors
    const whitelistUsbVendors = reactive({
        // If the whitelist should be enabled
        enabled: true as boolean,
        // Which vendors are whitelisted
        whitelist: __set<[string/*Name*/, number/*VendorID*/][]>()
    });

    const buildConfig = reactive({
        enablePreview: __set<boolean>()
    });

    const defaultPreview = __setRef<string | number>();

    //#endregion

    //#region PWA-Settings

    const preventPWAInstallAd = __setRef<boolean>();

    //#endregion

    //#region USB-Actions

    // Restore the default vendor list
    function restoreVendorDefaults() {
        whitelistUsbVendors.whitelist = DefaultVendors.map(itm => [itm[0], itm[1]]);
    }

    // Add a vendor to the whitelist
    function addVendor(name: string, id: number) {
        whitelistUsbVendors.whitelist.push([name, id]);
    }

    // Remove a vendor from the whitelist
    function removeVendor(id: number) {
        whitelistUsbVendors.whitelist = whitelistUsbVendors.whitelist.filter(itm => itm[1] !== id);
    }

    // Check if a vendor ID exists in the whitelist
    function doesVendorIDExist(id: number): boolean {
        return whitelistUsbVendors.whitelist.some(itm => itm[1] === id);
    }

    //#endregion

    //#region Utilities

    // Adds a recently opened project to the list
    function addRecentProject(proj: string){
        recentProjectPaths.value = recentProjectPaths.value.filter(x=>x !== proj);

        recentProjectPaths.value.push(proj);
    }

    // Restores the default values
    function restoreDefaults(){
        language.value = "en";

        preventPWAInstallAd.value = false;
        isDeveloper.value = window.location.hostname === "localhost";

        mainView.value = ViewVisualizer;

        serialPreview.pin = 2;
        serialPreview.ledAmount = 16;

        whitelistUsbVendors.enabled = true;
        whitelistUsbVendors.whitelist = DefaultVendors.map(itm => [itm[0], itm[1]]);

        buildConfig.enablePreview = false;
        defaultPreview.value = BuildInPreviews[0];
    }

    //#endregion

    // Ensures the default values are set, ah, well by default
    restoreDefaults();

    return {
        mainView, serialPreview, whitelistUsbVendors, buildConfig, language, isDeveloper,
        defaultPreview, recentProjectPaths, preventPWAInstallAd,

        restoreVendorDefaults, addVendor, removeVendor, doesVendorIDExist, restoreDefaults,
        addRecentProject
    };
});