
import { FluentBundle, FluentResource, FluentVariable } from '@fluent/bundle'

import enFile from "@localisation/languages/en.ftl?raw";
import deFile from "@localisation/languages/de.ftl?raw";
import { createFluentVue, FluentVue } from 'fluent-vue';

export const SupportedLanguages = [{
    key: "en",
    name: "English"
}, {
    key: "de",
    name: "Deutsch"
}] as const;

export type SupportedLanguagesType = typeof SupportedLanguages[number]["key"];

// Creates the languages and loads them
const loadLanguage = ((lang: SupportedLanguagesType)=> {

    // Loads english in any case as a backup
    const en = new FluentBundle("en");
    en.addResource(new FluentResource(enFile));
    
    const languages = [en];

    switch(lang){
        case "de":
            const de = new FluentBundle("de");
            de.addResource(new FluentResource(deFile));
            languages.unshift(de)
            break;
    }
    
    return languages;
});

export let Fluent: FluentVue = undefined as any;
export let $t: (key: string, value?: Record<string, FluentVariable>) => string = undefined as any;
export let $ta: (key: string, value?: Record<string, FluentVariable>) => Record<string, string> = undefined as any;

export function setupFluent(usedLanguage: SupportedLanguagesType){
    Fluent = createFluentVue({
        bundles: loadLanguage(usedLanguage)
    });

    $t = Fluent.$t;
    $ta = Fluent.$ta;

    return Fluent;
}