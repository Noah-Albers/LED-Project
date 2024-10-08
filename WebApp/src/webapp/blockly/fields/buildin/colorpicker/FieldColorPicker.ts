import { Component, watchEffect, WatchStopHandle } from "vue";
import { VueGuiBlockField } from "@webapp/blockly/fields/common/VueGuiBlockField";
import OnBlockColorPicker from "./OnBlockColorPicker.vue";
import { getBlockCacheOfSource, getBlockDataObject } from "@webapp/blockly/OnBlockUtils";
import { watch } from "vue";
import { DropDownDiv } from "blockly";
import { CachedColor, isVariableColor, VariableColorType } from "@nodes/implementations/datasources/ColorDataSource";

export class ColorPickerField extends VueGuiBlockField {

    public static readonly FIELD_NAME = "color"

    // Watches for "external" changes
    private valueWatcher: WatchStopHandle|undefined;
    // Watches for cache changes
    private cacheWatcher: WatchStopHandle|undefined;

    protected getExtraInfo(): undefined { return undefined; }

    protected getPreviewSize(): [number, number] {
        return [35,20]
    }
    
    protected getVueRenderer(): Component {
        return OnBlockColorPicker;
    }

    // Clones the value
    protected cloneValue(value: VariableColorType) : VariableColorType{
        return [...value];
    }

    init(): void {
        super.init();

        // Listen on "cache" changes
        const cache =  getBlockCacheOfSource(this.sourceBlock_!, this.name!);
        const dataObj = getBlockDataObject(this.sourceBlock_!);

        this.cacheWatcher = watch(cache, this.onCacheChange.bind(this));
        this.valueWatcher = watch(dataObj, this.onVueValueUpdate.bind(this))

        // Runs the "init" event
        this.onCacheChange();
        this.value_ = this.cloneValue(dataObj[this.name!]);
    }
    
    // Blockly-Event: Disposes the block
    dispose(): void {
        // Removes the vue listeners
        this.cacheWatcher!();
        this.valueWatcher!();
    }

    // Blockly-Event: the setValue function is called and uses this to validate the value
    protected doClassValidation_(newValue?: unknown): any {
        if(newValue === undefined || newValue === null)
            return this.getValue();

        if(!isVariableColor(newValue))
            return this.getValue();

        const isVueValue = (newValue as any).__vue === true;

        // Removes the flag
        if(isVueValue){
            delete (newValue as any).__vue;
            return newValue;
        }


        // Creates two clone values here to prevent any pass by reference problems
        getBlockDataObject(this.sourceBlock_!)[this.name!] = this.cloneValue(newValue);

        return this.cloneValue(newValue);
    }
    

    // Event: The cache changes (Therefor the color display changes)
    protected onCacheChange(){
        const cache = getBlockCacheOfSource<CachedColor>(this.sourceBlock_!, this.name!).value.display;

        if (this.borderRect_ !== null)
            this.borderRect_!.style.fill = cache;
        DropDownDiv.setColour(cache, "");
    }

    // Handler to debounce the vue value change event function
    private timehandler: NodeJS.Timeout|undefined;

    // Event: When the vue update value event timer is completed
    protected onTimerHit(){
        // Ensures to reset the timer
        this.timehandler = undefined;

        const vueValue = getBlockDataObject(this.sourceBlock_!)[this.name!];
        const blockValue = this.getValue();
        
        // Checks if the value is not equal
        if(blockValue === null || [0,1,2].some(x=>vueValue[x] !== blockValue[x])) {
            // Sets a cloned value
            const clone = this.cloneValue(vueValue);
            (clone as any).__vue = true;
            this.setValue(clone);
        }
    }

    // Event: The vue value is updated
    protected onVueValueUpdate(){
        
        // Debounces the actual function
        if(this.timehandler !== undefined){
            clearTimeout(this.timehandler);
            this.timehandler = undefined;
        }

        // (Re)starts the timer to the set value
        this.timehandler = setTimeout(this.onTimerHit.bind(this), 500);
    }
}