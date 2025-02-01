// GLOBALS
let players = null;
const threshold = 0.29;
let premiumEnabled = false;
let alreadyRan = false;
// Check premium status at startup
chrome.storage.sync.get('premiumEnabled', function (result) {
    premiumEnabled = result.premiumEnabled || false;
});

function checkPlayerPrices() {
    let userSavingsElement = document.querySelector('.pull-right[data-bind="currency: $parent.shouldShowSavings() ? $parent.savings() : animatedProgress(), roundCurrency: RoundCurrency.Downwards, fractionDigitsK: 1, fractionDigits: 1"]');
    let playerPriceElements = document.querySelectorAll('[data-bind^="currency: $parent.price"]');

    // Loop through the player price elements and update the color if needed
    playerPriceElements.forEach(function (element) {
        let playerPrice = parsePrice(element.textContent);
        let userMoney = parsePrice(userSavingsElement.textContent);
        if (playerPrice > userMoney) {
            element.style.color = 'red';
        }
    });
}

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
document.addEventListener("click", function (event) {

    if (premiumEnabled && window.location.href.includes("/Squad")) {
        const forwards = document.querySelector("#squad-table > tbody:nth-child(2)");
        const midfields = document.querySelector("#squad-table > tbody:nth-child(4)");
        const defenders = document.querySelector("#squad-table > tbody:nth-child(6)");

        let forwardsCount = 0;
        let midfieldsCount = 0;
        let defendersCount = 0;
        
        if (forwards && midfields && defenders) {    
            // Convert HTMLCollection to Array and loop through each player
            Array.from(forwards.children).forEach(player => {
                const div = player.querySelector("div.icon-shirt");
                if (div && div.classList.contains("icon-shirt-blue")) {
                    forwardsCount+=1;
                }
            });
            Array.from(midfields.children).forEach(player => {
                const div = player.querySelector("div.icon-shirt");
                if (div && div.classList.contains("icon-shirt-blue")) {
                    midfieldsCount+=1;
                }
            });
            Array.from(defenders.children).forEach(player => {
                const div = player.querySelector("div.icon-shirt");
                if (div && div.classList.contains("icon-shirt-blue")) {
                    defendersCount+=1;
                }
            });
        }
        const view = document.querySelector("#cached-html-wrapper-squad > div > div.col-xs-12.col-md-4.col-h-md-24.col-lg-3.pull-right > div.row.row-h-md-22.overflow-visible > div > div > div > div > div.row.row-h-xs-3.squad-info-gradient > div > div > h2");
        if (view != null && view.innerText != null) {
            view.innerText = defendersCount + "" + midfieldsCount + "" + forwardsCount;
        }

        const currentTeam = document.querySelector("#team-dropdown-button > span:nth-child(1)");
        const transfersBody = document.querySelector("tbody[data-bind='foreach: getItems()']");
        if (transfersBody) {
            // Select all player transfer rows within the transfersBody
            const playerRows = transfersBody.querySelectorAll("tr");
            let buy = 0;
            let sell = 0;
            let dailyEarn = [1000000, 875000, 750000, 625000, 500000];
            let startingMoney = [5000000, 4200000, 3000000, 2200000, 1200000];
            let dailyEarnValue = 0;
            let startingMoneyValue = 0;
            // Loop through each row and extract the data

            playerRows.forEach((row, index) => {
                const sourceTeam = row.querySelector("td span[data-bind='text: name']")?.textContent.trim();
                const transferValue = row.querySelector("td.td-price span.club-funds-amount")?.textContent.trim();
                if (currentTeam.innerText == sourceTeam) {
                    sell += parsePrice(transferValue);
                } else {
                    buy += parsePrice(transferValue);
                }
                const price = row.querySelector("td.hidden-xs.td-value span.club-funds-amount")?.textContent.trim();
                timestampElement = row.querySelector(`#team-transfers > div > div > table > tbody > tr:nth-child(${index + 1}) > td.hidden-xs.hidden-sm.td-content-width.text-right.td-date`);
                let ratio = (parsePrice(transferValue) / parsePrice(price)).toFixed(2);
                if(timestampElement!= null && !timestampElement.innerText.includes(' | ')) {
                    timestampElement.innerText = ratio + " | " + timestampElement.innerText;
                }
                if(ratio < 2.0) {
                    timestampElement.style.color = '#0d3dbd';
                    timestampElement.style.fontWeight = 'bold';
                }
                });

            const teamNumber = currentTeam.innerText.match(/\d+/); // Match a number in the string
            if (teamNumber) {
                const index = teamNumber[0] - 1;
                if (index >= 0 && index < dailyEarn.length) {
                    dailyEarnValue = dailyEarn[index];
                    startingMoneyValue = startingMoney[index];
                }
            }
            const matchDay = 4 + parseInt(document.querySelector("#team-transfers > div > div > table > tbody > tr:nth-child(1) > td:nth-child(5)").textContent);
            const teamValueElement = document.querySelector("#cached-html-wrapper-squad > div > div.col-xs-12.col-md-4.col-h-md-24.col-lg-3.pull-right > div.row.row-h-md-22.overflow-visible > div > div > div > div > div.row.row-h-xs-5.overflow-visible > div > div > div:nth-child(1) > div > div.col-xs-6.col-h-xs-24.flex-pull-right.squad-info-large-stat-container > div > div.col-xs-9.col-h-xs-24.vertical-center.squad-info-stat-text > span:nth-child(2)");
            teamValueElement.innerText = (parseFloat((sell - buy) + dailyEarnValue * matchDay + startingMoneyValue) / 1e6).toFixed(2) + "M";
            teamValueElement.style.color = '#e4ff03';
            teamValueElement.style.fontWeight = 'bold';
        }
    }

    if (premiumEnabled && window.location.href.includes("/Transferlist")) {

    }

    if (!alreadyRan) {
        players = getPlayerPricesAndNames();
        //console.log(players);
    }
    checkPlayerPrices();
    const playerNameElement = document.querySelector('h2.player-card-name.ellipsis[data-bind="text: fullNameWithSquadNumber()"]');
    let purchasePriceElement = document.querySelector('span.club-funds-amount[data-bind="currency: clubFundsCost(), roundCurrency: 1, fractionDigits: 1"]')
        || document.querySelector('span.club-funds-amount[data-bind="currency: clubFundsCost(), roundCurrency: 2, fractionDigits: 1"]');
    const playerValueElement = document.querySelector('.player-profile-value span[data-bind^="currency: value"]');
    const playerSquadValueElement = document.querySelectorAll('span.club-funds-amount[data-bind*="playerValue"]');
    const sliderInput = document.querySelector('input.slider.form-control');
    const purchasePrice = playerNameElement ? findPlayerPrice(playerNameElement.innerText) : null;
    if (purchasePriceElement == null) {
        purchasePriceElement = document.querySelector('.club-funds-amount');
    }

    if (purchasePriceElement && purchasePrice && playerNameElement && playerValueElement && window.location.href.includes("/Transferlist")) {
        playerValueElement.style.fontSize = "17px"; // Adjust to desired font size

        // Parse the values
        const playerValue = parsePrice(playerValueElement.innerText);
        const partBeforeDash = purchasePriceElement.innerText.includes(' - ') ? purchasePriceElement.innerText.split(' -')[0] : purchasePriceElement.innerText;
        const purchasePriceParsed = partBeforeDash != purchasePrice ? parsePrice(partBeforeDash) : parsePrice(purchasePrice);
        // Calculate the coefficient
        const coefficient = purchasePriceParsed / playerValue;

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
        const coefficient = sellingPrice / playerValue;
        const specificClubFundsElement = document.querySelector('div.set-price-value.font-lg.semi-bold.pull-right .club-funds-amount');

        if (coefficient > 1.90 && sellingPrice >= 50000000) {
            specificClubFundsElement.style.color = '#e4ff03';
        } else {
            specificClubFundsElement.style.color = '#1dffad';
        }

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
        "jorge resurreccion merodio": "koke",
        "yassine bounou": "bono",
        "fabio henrique tavares": "fabinho"
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
        //console.log(`Match found for "${fullName}": "${bestMatch.name}" (confidence: ${bestScore.toFixed(2)})`);
        return bestMatch.price;
    }

    console.log(`No match found for "${fullName}" (best confidence: ${bestScore.toFixed(2)})`);
    return null;
}