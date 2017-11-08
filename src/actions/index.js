import types from './types';

export function displayTE (boolean) {
    return {
        type: types.DISPLAYTE,
        payload: boolean
}
}