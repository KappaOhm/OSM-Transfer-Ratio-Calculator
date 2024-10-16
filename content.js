function checkPlayerPrices() {
    // Get the user's savings amount
    let userSavingsElement = document.querySelector('.pull-right[data-bind="currency: $parent.shouldShowSavings() ? $parent.savings() : animatedProgress(), roundCurrency: RoundCurrency.Downwards, fractionDigitsK: 1, fractionDigits: 1"]');
    // Get all the player price elements
    let playerPriceElements = document.querySelectorAll('[data-bind^="currency: $parent.price"]');

    // Loop through the player price elements and update the color if needed
    playerPriceElements.forEach(function(element) {
        let playerPrice = parsePrice(element.textContent);
        let userMoney = parsePrice(userSavingsElement.textContent);
        if (playerPrice > userMoney) {
            element.style.color = 'red';
        }
    });
}

// Add an event listener for clicks
document.addEventListener("click", function(event) {
    checkPlayerPrices();
    const playerValueElement = document.querySelector('.player-profile-value span[data-bind^="currency: value"]');
    const purchasePriceElement = document.querySelector('.club-funds-amount[data-bind^="currency: price"]');
    const sliderInput = document.querySelector('input.slider.form-control');

    if (playerValueElement && purchasePriceElement && window.location.href.includes("/Transferlist")) {
        console.log('Player value element found:', playerValueElement.innerText);
        console.log('Purchase price element found:', purchasePriceElement.innerText);

        // Parse the values
        const playerValue = parsePrice(playerValueElement.innerText);
        const purchasePrice = parsePrice(purchasePriceElement.innerText);

        console.log('Parsed player value:', playerValue);
        console.log('Parsed purchase price:', purchasePrice);

        // Calculate the coefficient
        const coefficient = purchasePrice / playerValue;
        console.log('Coefficient:', coefficient);

        // Check if the coefficient is already appended
        if (!purchasePriceElement.innerText.includes(' - ')) {
            purchasePriceElement.innerText = purchasePriceElement.innerText + ' - ' + coefficient.toFixed(2);
        }
        // Check if MAX sell value is already appended
        if (!playerValueElement.innerText.includes('=>')) {
            let maxSellValue = (parseFloat(playerValue*2.5)/1e6).toFixed(2);
            let profit = ((maxSellValue-parseFloat(purchasePrice)/1e6)).toFixed(2);
            
            playerValueElement.innerText = playerValueElement.innerText + ' =>' + maxSellValue.replace('.', ',') +'M' + ' =>' + profit.replace('.', ',') +'M';
        }

        // Apply visual clues
        if (coefficient <= 1.55 && coefficient > 1.45) {
            purchasePriceElement.style.color = '#e4ff03';
        } else if (coefficient <= 1.45) {
            purchasePriceElement.style.color = '#1dffad';
        } else {
            purchasePriceElement.style.color = 'red';
        }
    } else if (playerValueElement && sliderInput && window.location.href.includes("/Squad")) {
        const playerValue = parsePrice(playerValueElement.innerText);
        const sellingPrice = sliderInput.dataset.value;
        console.log('Parsed player value:', playerValue);
        console.log('Parsed selling price:', sellingPrice);

        const coefficient = sellingPrice / playerValue;
        const clubFundsAmountElement = document.querySelector('.player-profile-details .club-funds-amount');

        if (coefficient > 1.9 && sellingPrice >= 50000000) {
            clubFundsAmountElement.style.color = '#e4ff03';
        } else {
            clubFundsAmountElement.style.color = '#1dffad';
        }

    } else {
        console.log('Player or price elements not found in the modal!');
    }
});

// Function to parse prices
function parsePrice(priceText) {
    const cleanedPrice = priceText.replace(',', '.');
    const multiplier = cleanedPrice.endsWith('M') ? 1e6 : cleanedPrice.endsWith('K') ? 1e3 : 1;
    return parseFloat(cleanedPrice.replace(/[MK]/, '')) * multiplier;
}