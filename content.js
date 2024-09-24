document.addEventListener("click", function() {
    setTimeout(() => {
        // Wait for the modal to appear after clicking
        const playerValueElement = document.querySelector('.player-profile-value span[data-bind^="currency: value"]');
        const purchasePriceElement = document.querySelector('.club-funds-amount[data-bind^="currency: price"]');

        if (playerValueElement && purchasePriceElement) {
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

            // Apply visual clues
            if (coefficient <= 1.54 && coefficient > 1.45) {
                purchasePriceElement.style.color = '#e4ff03';
            } 
            else if (coefficient <= 1.45) {
                purchasePriceElement.style.color = '#1dffad';
            }
            else {
                purchasePriceElement.style.color = 'red';
            }
        } else {
            console.log('Player or price elements not found in the modal!');
        }
    }, 500); // Delay to allow the modal to appear
});

function parsePrice(priceText) {
    // Convert European comma decimal style (e.g., 1,2M) to a period decimal style (1.2M)
    const cleanedPrice = priceText.replace(',', '.');

    // Determine if the value is in millions or thousands
    const multiplier = cleanedPrice.endsWith('M') ? 1e6 : cleanedPrice.endsWith('K') ? 1e3 : 1;

    // Parse the numeric part and multiply by the appropriate multiplier
    return parseFloat(cleanedPrice.replace(/[MK]/, '')) * multiplier;
}
