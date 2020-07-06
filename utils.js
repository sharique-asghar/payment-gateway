async function ccFormat(value) {
    let v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    let matches = v.match(/\d{4,16}/g);
    let match = matches && matches[0] || ''
    let parts = [];
    for (let i=0, len=match.length; i<len; i+=4) {
        parts.push(match.substring(i, i+4));
    }
    if (parts.length) {
        return parts.join(' ');
    } else {
        return value;
    }
}

// Return the value for given key from session storage
function getItemFromLS(key) {
    try {
        if (typeof window === undefined) {
            return undefined;
        }
        return value = JSON.parse(localStorage.getItem(key));
    } catch (e) {
        console.log(e.toString());
        return undefined;
    }
  };

// Update the session storage with given key and value
async function setItemInLS(key, value) {
    try {
        if (typeof window === undefined) {
            return;
        }
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        return;
    }
}

// To detect card type from the card number
function getCardType(number) {
    // Visa
    var re = new RegExp("^4");
    if (number.match(re) != null)
        return "Visa";

    // Mastercard
    if (/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(number))
        return "Mastercard";

    // AMEX
    re = new RegExp("^3[47]");
    if (number.match(re) != null)
        return "AMEX";

    // Discover
    re = new RegExp("^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)");
    if (number.match(re) != null)
        return "Discover";

    // Maestro
    if (/^(5[06-8]\d{4}|6\d{5})/ig.test(number))
        return "Maestro";

    // Diners Club
    re = new RegExp("^30[0-5]");
    if (number.match(re) != null)
        return "DinersClub";

    // JCB
    re = new RegExp("^35(2[89]|[3-8][0-9])");
    if (number.match(re) != null)
        return "JCB";

    return "";
}

let cardTypeLengthObj = {
    "Visa": [13,16],
    "Mastercard": 16,
    "Maestro": [16,17,18,19],
    "AMEX": 15,
    "Discover": 16,
    "DinersClub": 14,
    "JCB": 16
}

// checks card number is valid or not
function checkCardNumber(cardType, num) {
    let cardTypeVal = cardTypeLengthObj[cardType]
    if (cardTypeVal instanceof Array) {
        return cardTypeVal.includes(num) ? true : false;
    } else if (cardTypeVal) {
        return cardTypeVal === num ? true : false;
    } else {
        return false;
    }
}
