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


// initialuze to false to only run once
let alreadyRan = false;
let players = null;
const threshold = 0.29;

function getPlayerPricesAndNames() {
    // Get all player rows
    const playerRows = document.querySelectorAll('tr[data-bind*="click: $parents[2].showBuyPlayerModal"]');
    const playerData = [];

    playerRows.forEach(row => {
        const playerNameElement = row.querySelector('span[data-bind="text: name"]');
        const playerPriceElement = row.querySelector('span[data-bind^="currency: $parent.price"]');

        if (playerNameElement && playerPriceElement) {
            const playerName = playerNameElement.textContent.trim();
            const playerPrice = playerPriceElement.textContent.trim();
            playerData.push({ name: playerName, price: playerPrice });
        }
    });

    alreadyRan = true;
    return playerData;
}

// Add an event listener for clicks
document.addEventListener("click", function(event) {
    
    if(!alreadyRan){
        players = getPlayerPricesAndNames();
        console.log(players);
    }
    checkPlayerPrices();
    const playerNameElement = document.querySelector('h2.player-card-name.ellipsis[data-bind="text: fullNameWithSquadNumber()"]');
    const purchasePriceElement = document.querySelector('span[data-bind="currency: price, roundCurrency: 1, fractionDigits: 1"]')
    || document.querySelector("span.club-funds-amount");
    const playerValueElement = document.querySelector('.player-profile-value span[data-bind^="currency: value"]');
    const sliderInput = document.querySelector('input.slider.form-control');
    const purchasePrice = playerNameElement ? findPlayerPrice(playerNameElement.innerText) : null;

    if (purchasePriceElement && purchasePrice && playerNameElement && playerValueElement && window.location.href.includes("/Transferlist")) {
        playerValueElement.style.fontSize = "17px"; // Adjust to desired font size
        
        console.log('Player value element found:', playerValueElement.innerText);
        console.log('Purchase price element found:', purchasePrice);

        // Parse the values
        const playerValue = parsePrice(playerValueElement.innerText);
        const purchasePriceParsed = parsePrice(purchasePrice);

        console.log('Parsed player value:', playerValue);
        console.log('Parsed purchase price:', purchasePriceParsed);

        // Calculate the coefficient
        const coefficient = purchasePriceParsed / playerValue;
        console.log('Coefficient:', coefficient);

        // Check if the coefficient is already appended
        if (!purchasePriceElement.innerText.includes(' - ')) {
            purchasePriceElement.innerText = purchasePriceElement.innerText + ' - ' + coefficient.toFixed(2);
        }
        // Check if MAX sell value is already appended
        if (!playerValueElement.innerText.includes('>>+')) {
            let maxSellValue = (parseFloat(playerValue * 2.5) / 1e6).toFixed(1);
            let profit = ((maxSellValue - parseFloat(purchasePriceParsed) / 1e6)).toFixed(1);
        
            playerValueElement.innerHTML = `
                ${playerValueElement.innerText} > <span style="color: #e4ff03;">${maxSellValue.replace('.', ',')}M ^ </span> Profit >>+ 
                <span style="color: #1dffad;">${profit.replace('.', ',')}M</span>
            `;
        }
        

        // Apply visual clues
        if (coefficient <= 1.55 && coefficient > 1.45) {
            purchasePriceElement.style.color = '#e4ff03';
        } else if (coefficient <= 1.45) {
            purchasePriceElement.style.color = '#1dffad';
        } else {
            purchasePriceElement.style.color = 'red';
        }
        purchasePriceElement.style.fontWeight = 'bold';
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

// Name matching functions
function normalizeName(name) {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .toLowerCase()
        .replace(/[^a-z\s]/g, " ")       // Replace special chars with space
        .replace(/\s+/g, " ")            // Normalize spaces
        .trim();
}

function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    return (longer.length - levenshteinDistance(longer, shorter)) / longer.length;
}

function levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill().map(() => 
        Array(str1.length + 1).fill(0)
    );
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j - 1][i] + 1,      // deletion
                matrix[j][i - 1] + 1,      // insertion
                matrix[j - 1][i - 1] + cost // substitution
            );
        }
    }
    
    return matrix[str2.length][str1.length];
}

function nameToComponents(name) {
    const parts = normalizeName(name).split(" ");
    return {
        firstName: parts[0],
        lastName: parts[parts.length - 1],
        middleNames: parts.slice(1, -1),
        fullName: parts.join(" ")
    };
}

function calculateNameMatchScore(searchName, playerName) {
    const search = nameToComponents(searchName);
    const player = nameToComponents(playerName);
    
    let score = 0;

    // If exact match, return 1
    if (search.fullName === player.fullName) {
        return 1.0;
    }

    // Check if one name contains the other completely
    if (search.fullName.includes(player.fullName) || player.fullName.includes(search.fullName)) {
        return 0.9;
    }

    // Split names into parts
    const searchParts = search.fullName.split(' ');
    const playerParts = player.fullName.split(' ');

    // Check each part of the search name against each part of the player name
    let matchCount = 0;
    let totalParts = Math.max(searchParts.length, playerParts.length);

    searchParts.forEach(searchPart => {
        if (playerParts.some(playerPart => playerPart === searchPart)) {
            matchCount++;
        }
    });

    score = matchCount / totalParts;
    if (score < threshold){
        return score;
    }

    // Check for name component position matches
    const searchComponents = [search.firstName, ...search.middleNames, search.lastName];
    const playerComponents = [player.firstName, ...player.middleNames, player.lastName];
    
    let positionPenalty = 0;
    searchComponents.forEach((component, index) => {
        const playerIndex = playerComponents.indexOf(component);
        if (playerIndex !== -1) {
            // Penalize if the name appears in a different position
            positionPenalty += Math.abs(index - playerIndex) * 0.1;
        }
    });

    score = Math.max(0, score - positionPenalty);

    // One last check if we did not meet threshold
    if (score < threshold){
        if(search.fullName.includes(player.firstName)){
            return 0.5;
        }
    }
    else {
        return score;
    }
}

function findPlayerPrice(fullName) {
    // Check if players data exists
    if (!players || !Array.isArray(players) || players.length === 0) {
        console.log('Players data not available or empty');
        return null;
    }

    const normalizedSearchName = normalizeName(fullName);
    
    // Check for nickname mappings
    const NICKNAME_MAPPINGS = {
        "pedro gonzalez lopez": "pedri",
        "pedro gonzalez": "pedri",
        "alisson ramses becker": "alisson",
        "alisson becker": "alisson",
        "pablo martin paez gavira": "gavi",
        "rodrigo hernandez cascante": "rodri",
        "raphael dias belloli": "raphinha",
        "son heung-min": "son",
        "vinicius jose paixao de oliveira junior": "vinicius junior",
        "ederson santana de moraes": "ederson"
    };
    
    if (NICKNAME_MAPPINGS[normalizedSearchName]) {
        const nickname = NICKNAME_MAPPINGS[normalizedSearchName];
        const nicknameMatch = players.find(p => 
            normalizeName(p.name).includes(nickname)
        );
        if (nicknameMatch) return nicknameMatch.price;
    }

    let bestMatch = null;
    let bestScore = 0;

    // Add safety check for players array
    if (Array.isArray(players)) {
        for (const player of players) {
            const score = calculateNameMatchScore(fullName, player.name);
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = player;
            }
        }
    }

    if (bestScore >= threshold) {
        console.log(`Match found for "${fullName}": "${bestMatch.name}" (confidence: ${bestScore.toFixed(2)})`);
        return bestMatch.price;
    }

    console.log(`No match found for "${fullName}" (best confidence: ${bestScore.toFixed(2)})`);
    return null;
}