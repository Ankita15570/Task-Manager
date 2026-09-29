import { BASE_URL } from './ApiPath';

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const addThousandsSeparator = (num) => {
    if(num === null || isNaN(num)) return '';

    const [integerPart, fractionalPart] = num.toString().split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return fractionalPart ? `${formattedInteger}.${fractionalPart}` : formattedInteger;
};

export const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';

    try {
        const parsedUrl = new URL(imageUrl, window.location.origin);

        if (parsedUrl.pathname.startsWith('/uploads/')) {
            return `${BASE_URL}${parsedUrl.pathname}`;
        }
    } catch {
        return imageUrl;
    }

    return imageUrl;
};