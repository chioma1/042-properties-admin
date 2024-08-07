export const getFromLocalStorage = ({ param }: any) => {
    try {
        return JSON.parse(localStorage.getItem(param) || '');
    } catch (error) {
        return null;
    }
};

export function addCommas(number: { toString: () => any; }) {
    // Convert number to string
    let numStr = number.toString();

    // Split the string into integer and decimal parts
    const parts = numStr.split('.');

    // Add commas to integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Join integer and decimal parts with a dot and return
    return parts.join('.');
}