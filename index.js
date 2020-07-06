let cardNumberElement = document.querySelector("#cardNumber");
let expiryMonthElement = document.querySelector("#expiryMonth");
let expiryYearElement = document.querySelector("#expiryYear");
let cvvElement = document.querySelector("#cvvInput");
let cvvDiv = document.querySelector("#cvv");
let nameElement = document.querySelector("#name");
let cardImgElement = document.querySelector("#cardImg");
let cardsContainer = document.querySelector(".cards-container");
let savedCardsContainer = document.querySelector("#savedCards");
let cardDetails = getItemFromLS("details") || [];
let cvvValue = "";

cardNumberElement.onkeyup = cardNumberChange;

// generates card for each saved detail
async function generateCards() {
    try {
        if (!cardDetails && !cardDetails.length) {
            cardsContainer.style.display = "none";
        }
        else {
            await removeCard();
            cardDetails.map((card, index) => {
                let newDiv = document.createElement("div"); // div to display each card
                newDiv.classList.add("card");

                // To display card title, creating card title and image of card_type element
                let titleContainer = document.createElement("div");
                titleContainer.classList.add("card-title-container");
                let title = document.createElement("div");
                title.classList.add("card-title");
                title.innerHTML = "Credit Card";
                let imgDiv = document.createElement("div");
                let img = document.createElement("img");
                img.classList.add("card-type-logo");
                img.src = `./public/images/${card.card_type}.png`;
                imgDiv.innerHTML += img.outerHTML;
                titleContainer.innerHTML += title.outerHTML + imgDiv.outerHTML;

                // To display card_number, creating card number element
                let cardNumberDiv = document.createElement("div");
                cardNumberDiv.innerHTML = card.card_number;

                // To display card_name, expiry_date and providing delete option
                let footerDiv = document.createElement("div");
                footerDiv.classList.add("footer");
                let nameDiv = document.createElement("div");
                nameDiv.classList.add("column-class");
                let nameLabel = document.createElement("div");
                nameLabel.classList.add("label");
                nameLabel.innerHTML = "CARDHOLDER NAME";
                let name = document.createElement("div");
                name.innerHTML = card.name;
                nameDiv.innerHTML = nameLabel.outerHTML + name.outerHTML;
                let expiryDiv = document.createElement("div");
                expiryDiv.classList.add("column-class");
                let dateLabel = document.createElement("div");
                dateLabel.classList.add("label");
                dateLabel.innerHTML = "EXPIRY DATE";
                let expiryDate = document.createElement("div");
                expiryDate.innerHTML = `${card.expiry_month} / ${card.expiry_year}`;
                expiryDiv.innerHTML = dateLabel.outerHTML + expiryDate.outerHTML;
                let buttonDiv = document.createElement('div');
                buttonDiv.classList.add("delete-button-container")
                buttonDiv.innerHTML = `<button id="deleteButton" onclick="deleteCard(${index})"><img class="delete-img" src="./public/images/delete.png"></button>`;
                // let deleteButton = document.createElement("button");
                // deleteButton.onclick = deleteCard;
                // let deleteImg = document.createElement("img");
                // deleteImg.src = "./public/images/delete.png";
                // deleteImg.classList.add("delete-img");
                // buttonDiv.innerHTML += deleteImg.outerHTML;

                footerDiv.innerHTML += nameDiv.outerHTML + expiryDiv.outerHTML + buttonDiv.outerHTML;
                newDiv.innerHTML += titleContainer.outerHTML + cardNumberDiv.outerHTML + footerDiv.outerHTML;
                savedCardsContainer.innerHTML += newDiv.outerHTML;
            });
        }
    } catch (ex) {
        console.log(ex.toString());
    }
};

async function cardNumberChange(event) {
    let value = event.currentTarget.value;
    if (!value) {
        cardImgElement.src = "";
    }
    let cardNumberVal = value.replace(/[^0-9]/g, "").replace(/\W/gi, '').replace(/(.{4})/g, '$1 ');
    await ccFormat(cardNumberVal);
    cardNumberElement.value = cardNumberVal;
    let cardNumberStr = value.replace(/\s/g, '');
    if (cardNumberStr.length > 13) {
        let cardType = getCardType(cardNumberStr);
        if (!cardType) cardImgElement.src = "";
        cardImgElement.src = `./public/images/${cardType}.png`;
        let cvvLength = cardType === "AMEX" ? "4" : "3";
        cvvElement.setAttribute("maxlength", cvvLength);
    }
}

function cvvChange() {
    if (cvvElement.value.length > 1) {
        let replacedValue = cvvElement.value.replace(/\D/g, '');
        cvvValue += replacedValue;
    } else {
        cvvValue = cvvElement.value;
    }
    let value = cvvElement.value.replace(/[0-9]/g, '*');
    cvvElement.value = value;
    cvvDiv.innerHTML = cvvValue;
}

function expiryMonthChange() {
    if (expiryMonthElement.value.length > 1) {
        let value = Number(expiryMonthElement.value);
        if (value < 1 || value > 12) {
            alert("Expiry month should be in between 01-12");
            expiryMonthElement.value = ""
        }
    }
}

// deletes a card from the saved list
async function deleteCard(i) {
    let cardDetailsArr = cardDetails.filter((card, index) => index !== i);
    await setItemInLS("details", cardDetailsArr);
    alert("Card deleted successfully. You can check it by refreshing the page.");
};

// To remove the card present from earlier render
async function removeCard() {
    if (cardDetails && cardDetails.length > 1) {
        while (savedCardsContainer.firstChild) savedCardsContainer.removeChild(savedCardsContainer.firstChild);
    } else {
        return;
    }
};

// on save button click, save the card
function save() {
    try {
        let cardNumber = cardNumberElement.value;
        let expiryMonth = expiryMonthElement.value;
        let expiryYear = expiryYearElement.value;
        let cvv = cvvDiv.innerHTML;
        let name = nameElement.value;
        let cardNumberVal = cardNumber.replace(/\s/g, '');
        let cardType = getCardType(cardNumberVal);

        let cardDetailsObj = {
            card_type: cardType,
            card_number: cardNumber,
            expiry_month: expiryMonth,
            expiry_year: expiryYear,
            cvv,
            name
        }

        let isValid = validateCardDetails(cardDetailsObj);
        if (!isValid) return;

        let existingCardsArr = cardDetails.filter(card => card.card_number === cardNumber);
        if (existingCardsArr.length) {
            alert("This card is already saved");
            return;
        }

        cardDetails.push(cardDetailsObj);
        setItemInLS("details", cardDetails);
        alert("Card Details Saved");
        document.querySelector("#form").reset(); // resetting all form inputs
    } catch (ex) {
        console.log(ex.toString());
        alert("Error in saving card: " + ex.toString());
    }
};

// validate card details before saving
function validateCardDetails(detailsObj) {
    let message = "Error: Please check ";
    let errorMessage = "";
    let today = new Date();
    let expiryDate = new Date();
    expiryDate.setFullYear(`20${detailsObj.expiry_year}`, detailsObj.expiry_month-1, 1);
    let cardNumber = detailsObj.card_number.replace(/\s/g, '');

    // Checking only "Visa", "Mastercard", "Maestro", "AMEX", "Discover", "DinersClub", "JCB"
    let isCardNumberValid = checkCardNumber(detailsObj.card_type, cardNumber.length);

    if (!isCardNumberValid) errorMessage += "Card Number Length";
    if (!(/^[0-9]{3,4}$/.test(detailsObj.cvv))) {
        if (errorMessage) errorMessage += ", "
        errorMessage += "CVV Length";
    }
    if (expiryDate < today) {
        if (errorMessage) errorMessage += ", ";
        errorMessage += "The expiry date is before today's date"
    }

    if (!errorMessage) {
        return true;
    } else {
        message += errorMessage;
        alert(message);
        return false;
    }
};

generateCards(); // create the cards if there is any