// Brazilian passenger-vehicle plates: legacy AAA9999 or Mercosur AAA9A99.
export const normalizePlate = value => value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,7);
export const isValidPlate = value => /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(value);
