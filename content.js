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
    const purchasePriceElement = document.querySelector('span.club-funds-amount[data-bind="currency: clubFundsCost(), roundCurrency: 1, fractionDigits: 1"]')
    || document.querySelector('span.club-funds-amount[data-bind="currency: clubFundsCost(), roundCurrency: 2, fractionDigits: 1"]');
    const playerValueElement = document.querySelector('.player-profile-value span[data-bind^="currency: value"]');
    const playerSquadValueElement = document.querySelectorAll('span.club-funds-amount[data-bind*="playerValue"]');
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
        if (purchasePriceElement.getAttribute('data-bind').includes('roundCurrency: 2')) {
            purchasePriceElement.innerText = 'DO NOT BUY' + ' > ' + purchasePriceElement.innerText;
            purchasePriceElement.style.color = 'red';
            purchasePriceElement.style.fontWeight = 'bold';
            return;
        }
        else if (!purchasePriceElement.innerText.includes(' - ')) {
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
    // Selling players    
    } else if (playerSquadValueElement[0] && sliderInput && window.location.href.includes("/Squad")) {
        const playerValue = parsePrice(playerSquadValueElement[0].innerText);
        const sellingPrice = sliderInput.dataset.value;
        console.log('Parsed player value:', playerValue);
        console.log('Parsed selling price:', sellingPrice);

        const coefficient = sellingPrice / playerValue;
        console.log('Coefficient:', coefficient);
        const specificClubFundsElement = document.querySelector('div.set-price-value.font-lg.semi-bold.pull-right .club-funds-amount');

        if (coefficient > 1.9 && sellingPrice >= 50000000) {
            specificClubFundsElement.style.color = '#e4ff03';
        } else {
            specificClubFundsElement.style.color = '#1dffad';
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
    
    // If exact match, return 1
    if (search.fullName === player.fullName) {
        return 1.0;
    }

    // Prioritize last name matches
    if (search.lastName === player.lastName) {
        // If last names match exactly, give a high base score
        let score = 0.8;
        
        // Add bonus for first name match
        if (search.firstName === player.firstName) {
            score += 0.2;
        }
        
        return score;
    }

    // Check if one name contains the other completely
    if (search.fullName.includes(player.fullName) || player.fullName.includes(search.fullName)) {
        return 0.7;
    }

    // Split names into parts
    const searchParts = search.fullName.split(' ');
    const playerParts = player.fullName.split(' ');

    // Initialize score with emphasis on last name
    let score = 0;
    let lastNameMatch = false;

    // Check last name first
    if (searchParts[searchParts.length - 1] === playerParts[playerParts.length - 1]) {
        score += 0.6;
        lastNameMatch = true;
    }

    // Only proceed with first name matching if last name matched or score is still 0
    if (lastNameMatch || score === 0) {
        // Check remaining parts with lower weight
        let remainingMatchCount = 0;
        const searchRemaining = searchParts.slice(0, -1);
        const playerRemaining = playerParts.slice(0, -1);

        searchRemaining.forEach(searchPart => {
            if (playerRemaining.some(playerPart => playerPart === searchPart)) {
                remainingMatchCount++;
            }
        });

        if (searchRemaining.length > 0) {
            score += (remainingMatchCount / searchRemaining.length) * 0.4;
        }
    }

    // Additional checks for edge cases
    if (score < threshold) {
        // Check if the search name's last name is contained within the player's full name
        if (player.fullName.includes(search.lastName)) {
            return 0.5;
        }
        // Check if the search name's full name contains the player's last name
        if (search.fullName.includes(player.lastName)) {
            return 0.5;
        }
    }

    return score;
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
        "ederson santana de moraes": "ederson",
        "lucas tolentino coelho de lima": "lucas paqueta",
        "danilo luiz da silva": "danilo",
        "jorge resurreccion merodio" : "koke",
        "yassine bounou": "bono"
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