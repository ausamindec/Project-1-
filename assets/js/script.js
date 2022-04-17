

let search;
let arrayForMeals = [];
const containerSearchEl = $('#search-results-container');
const ingrediantEl = $("#ingrediant");

const mealSearch = (termSearch) => {
    $.ajax({
        url: "https://www.themealdb.com/api/json/v1/1/search.php?s="+termSearch,
        method: "GET"
    }).then(function(response){
        let searchResultEl = $('#search-results');
        arrayForMeals = response.meals;

        /* display meal options from user search */
        searchResultEl.empty();
        containerSearchEl.css('display', 'block');
        ingrediantEl.css('display', 'none');
  
        /* Get a reference to the search history element for this search */

        if (arrayForMeals === null) {
            const msgSearchFailure = $('<p>').text('Sorry, no results were found. Try another search.');
            $('#search-results').append(msgSearchFailure);
        } else {
            historySearch(termSearch);
            const historyElement = document.querySelector('[data-search="' + termSearch + '"]');

            /* Update search history listing with count of ingrediants returned */
            const addingrediantsReturned = `${termSearch} (${arrayForMeals.length})`;
          
            /* Get the search history object and update the count for this search */
            let searchHistory = JSON.parse(localStorage.getItem('search_history'));
            searchHistory[termSearch].text = addingrediantsReturned;
          
            /* Save the history again */
            localStorage.setItem('search_history', JSON.stringify(searchHistory));

            historyElement.innerHTML = addingrediantsReturned;
            
            /* Print each search result */
            for (obj of arrayForMeals) {
                const elementResult = $('<div>').attr('class', 'column is-3');
                const linkResult = $('<a id="' + obj.idMeal + '">');
                const imgResult = $('<img>').attr('width', '200');
                imgResult.attr('src', obj.strMealThumb);
                const resultPara = $('<p>').text(obj.strMeal);
              
                linkResult.attr("onclick", "selected_ingrediant(event)");
                linkResult.append(imgResult);
                linkResult.append(resultPara);
                elementResult.append(linkResult);
              
                /* Place the new elements for the ingrediant on the page */
                $('#search-results').append(elementResult);
            };
        }
    });
};


function selected_ingrediant(event) {
    // need to determine what was selected since the event doesn't capture the anchor tag
    if(event.target.localName === "img" || event.target.localName === "p"){
        mealSelection(event.target.parentNode.id);
    }else{
        mealSelection(event.target.id);
    }    
}

const mealSelection = (selMealID) => {
    let mealSelectionArray = [];

    let selMealObj = arrayForMeals.find(arrayForMeals => arrayForMeals.idMeal === selMealID);
    const mealTitleEl = $("#title");
    const mealVideoEl = $("#video");
    const mealImgEl = $("#ingrediant_img");
    const ingredientEl = $("#ingredient");
    const magnitudeEl = $("#magnitude");
    const instructionsEl = $("#instructions");

    /* Hide search results and show ingrediant */
    containerSearchEl.css('display', 'none');
    ingrediantEl.css('display', 'block');
    ingredientEl.empty();
    magnitudeEl.empty();

    mealTitleEl.text(selMealObj.strMeal);

    /* Get the Youtube code from the video link */
    const videoCode = selMealObj.strYoutube.split('=')[1];
    mealVideoEl.html(`<iframe width="420" height="315" src="https://www.youtube.com/embed/${videoCode}"></iframe>`);

    mealImgEl.attr("src", selMealObj.strMealThumb);

    instructionsEl.text(selMealObj.strInstructions);
    
    for (let i = 1; i <= 20; i++){
        const ingredient = selMealObj["strIngredient" + i];
        const magnitude = selMealObj["strMeasure" + i];

        if(ingredient !== "" && ingredient !== null){
            const ingredientListItem = $("<li>");

            ingredientListItem.text(ingredient);
            ingredientEl.append(ingredientListItem);
            
            const magnitudeListItem = $("<li>");
            
            magnitudeListItem.text(magnitude);
            magnitudeEl.append(magnitudeListItem);

            mealSelectionArray.push({"ingredient": ingredient, "amount": magnitude});
        } else {
            break;
        };
    };
    getNutrition(mealSelectionArray);
};
// ====================meal.js ==========================






//  Nutritionix API

const foodGroups = {
    1: 'dairy',
    2: 'protein',
    3: 'fruit',
    4: 'vegetable',
    5: 'grain',
    6: 'fat',
    7: 'legume',
    8: '',
    9: '',
};

/* nutrition facts here from API
*/
const getNutrition = (ingredients) => {
    let ingredientStory = '';
    const queryUrl = 'https://trackapi.nutritionix.com/v2/natural/nutrients';
    const NutritionixAppID = '3cff7c33';
    const NutritionixAppKey = 'bc57bf3815504c053f18cfd02f2518c9';
    const headerData = 
        {
            'Content-Type': 'application/json', 
            'accept': 'application/json',
            'x-app-id': NutritionixAppID, 
            'x-app-key': NutritionixAppKey,
            'x-remote-user-id': '0',
            'cache-control': 'no-cache',
        };
    for (ingredient of ingredients) {
        ingredientStory += `${ingredient.amount} ${ingredient.ingredient} and `
    };
    const settings = {
        async: true,
        crossDomain: true,
        url: queryUrl,
        method: 'POST',
        headers: headerData,
        data: JSON.stringify(
            {
                "query": ingredientStory,
            }
        ),
    }
    $.ajax(settings).done(function(response) {
        // Call function to print the ingredients and nutrition from the response */
        printIngredients(response);
    });
};

//  Display ingredients on page 
const printIngredients = (ingredientResponse) => {
    const nutritionBodyEl = $('#body-nutirition');
    nutritionBodyEl.empty();

    //  Define total amounts to be added up in the loop 
    let totalCalories = 0;
    const totalCaloriesEl = $('#total_cal');
    let totalWeight = 0;
    const totalWeightEl = $('#total_Weight');

    // Loop over ingredients  loop in response and print them 
    for (let i=0; i<ingredientResponse.foods.length; i++) {
        const nutritionIngredientRow = $('<tr>');

    
        const amountData = $('<td>').text(ingredientResponse.foods[i].serving_qty);
        nutritionIngredientRow.append(amountData);
        const amountType = $('<td>').text(ingredientResponse.foods[i].serving_unit);
        nutritionIngredientRow.append(amountType);

        // name of ingredients
        const foodName = $('<td>').text(ingredientResponse.foods[i].food_name);
        nutritionIngredientRow.append(foodName);

        
        const thisCalories = ingredientResponse.foods[i].nf_calories;
        totalCalories += thisCalories;
        const caloriesData = $('<td>').text(thisCalories);
        nutritionIngredientRow.append(caloriesData);
        // calories section gos here 

        const thisWeight = ingredientResponse.foods[i].serving_Weight_grams;
        totalWeight += thisWeight;
        const WeightData = $('<td>').text(thisWeight);
        nutritionIngredientRow.append(WeightData);

        // weight section goes here
    
        const foodGroup = foodGroups[ingredientResponse.foods[i].tags.food_group]
        const foodGroupEl = $('<td>').text(foodGroup);
        nutritionIngredientRow.append(foodGroupEl);
        nutritionBodyEl.append(nutritionIngredientRow); 
    };

//    toatals
    totalCaloriesEl.text(`${totalCalories.toFixed(0)} cal`);
    totalWeightEl.text(`${totalWeight.toFixed(2)} g`);
};


// API section ends (nutrionix.js))








// search history section starts 
const historySearch = (newtermSearch) => {
    let searchHistory = {};
    if (localStorage.getItem('search_history')) {
        searchHistory = JSON.parse(localStorage.getItem('search_history'));
    };

    /* Check if search history already includes this term */
    if (newtermSearch in searchHistory) {
        return;
    } else if (newtermSearch && newtermSearch.length > 0) {
        /* If there is a new term, add it to the search history */
        searchHistory[newtermSearch] = {text: newtermSearch};
        localStorage.setItem('search_history', JSON.stringify(searchHistory));
    };

    /* If the search history is not empty, show it on page */
    if (Object.keys(searchHistory).length > 0) {
        $('#search-history-help').addClass('hidden');
        searchHistoryUpgrade(searchHistory);
    }
};

/* Update the element on page with list of search history */
const searchHistoryUpgrade = (searchHistory) => {
    const searchHistoryList = $('#search_list');
    searchHistoryList.empty();
    for (let i=0; i<Object.keys(searchHistory).length; i++) {
        const termSearch = Object.keys(searchHistory)[i];
        const termSearchElement = $('<li>').attr('data-search', termSearch)

        /* Fancy feedback so the user knows that these are links */
        termSearchElement.hover(function() {
            $(this).css('cursor', 'pointer');
            $(this).addClass('has-background-dark has-text-light');
        }, function() {
            $(this).removeClass('has-background-dark has-text-light');
        });

        termSearchElement.text(`${searchHistory[termSearch].text}`);
        searchHistoryList.append(termSearchElement);
        termSearchElement.on('click', function() {
            mealSearch($(this).attr('data-search'));
        });
    };    
};


// search history section ends







$(document).ready(function() {
    // fetch search history from local storage 
    historySearch();
    
    //Event listener for submitting search form directly 
    $('#search-form').on('submit', function(event) {
        event.preventDefault();
        let termSearch = $('#search-field').val();
        startSearch(termSearch);
    });

    // Event listener for clicking on search button 
    $('#search-button').on('click', function(event) {
        let termSearch = $('#search-field').val();
        startSearch(termSearch);
    });

    
    const startSearch = (termSearch) => {
        mealSearch(termSearch);
    };
});

