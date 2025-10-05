import { usePage } from "@inertiajs/react";

export default function useTrans() {
    const { lang } = usePage().props;

    const translations = (lang && lang.translations) || {};
    const locale = (lang && lang.locale) || "en";

    function t(key, replacements = {}) {
        const value = translations[key] ?? key;

        return Object.keys(replacements).reduce((str, k) => {
            return str.replace(
                new RegExp(`(:|\\{)${k}(\\}|)`, "g"),
                replacements[k]
            );
        }, value);
    }

    return { t, locale };
}
