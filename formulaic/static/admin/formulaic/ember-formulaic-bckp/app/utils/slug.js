/* global slug */

export function generateSlug(value) {
    if (value != null) {
        return slug(value, {lower: true});
    } else {
        return value;
    }
}

export default {
    generateSlug: generateSlug
};
