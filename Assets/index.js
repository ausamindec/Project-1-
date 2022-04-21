const appId = `1c966549`
const appKey = `aa1d200768be67cd4aaa5edfbee9cc51`;
const baseUrl = `https://api.edamam.com/api/recipes/v2?type=public&app_id=${appId}&app_key=${appKey}`
const searchInp = document.querySelector("#search-inp");
const searchBtn = document.querySelector('#search-btn');
const container = document.querySelector('.container')
const modal = document.querySelector('.modal');
var span = document.getElementsByClassName("close")[0];
const modalTitle = document.querySelector('.modal-title');
const modalContent = document.querySelector('.modal-content')
const recipeIngredients = document.querySelector('.recipe-ingredients');
// const title = document.querySelector('.title');
// const recipeImage = document.querySelector('.recipe-image');

searchBtn.addEventListener('click', ()=>loadrecipies(searchInp.value))
searchInp.addEventListener('keyup', (e) => {
    const inputValue = searchInp.value;
    if (e.keyCode === 13) {
        loadrecipies(inputValue)
    }
})

function loadrecipies(type = 'paneer') {
    const url = baseUrl + `&q=${type}`;
    fetch(url)
        .then(res => res.json())
        .then(data => { renderRecipes(data.hits) })
        .catch(error => console.log(error))
}
loadrecipies()

function renderRecipes(recipeList = []) {
   container.innerHTML = "";
    console.log(recipeList);
    recipeList.forEach(element => {
        const {
            label, ingredientLines, image
        } = element.recipe;
        // console.log(label, ingredientLines, image)
        let recipeContainer = document.createElement('div');
        recipeContainer.classList.add('recipe-container');
        
        let title = document.createElement('div');
        title.classList.add('recipe-title')
        title.textContent = label;
        let recipeImg = document.createElement('div');
        recipeImg.classList.add('recipe-img');
        recipeImage = document.createElement('img')
        recipeImage.src = image;
        recipeImage.alt = `Recipe Image here`;
        recipeImage.setAttribute('id', label);
       
        recipeImg.append(recipeImage);
        recipeContainer.append(title);
        recipeContainer.append(recipeImg);
        // recipeContainer.append(recipeText);
        container.append(recipeContainer)
             
    })
    clickRecipe.addEventListener('click', (e) => {
        console.log(e.target.id)
        let clickedRecipe = recipeList.find(element => {
            // console.log(element.recipe.label)
            return element.recipe.label==(e.target.id)
        })
        let ingList = clickedRecipe.recipe.ingredientLines;
        modal.classList.remove('hide')
        window.opacity=0.5
        renderModal(ingList, e.target.id)
        
    })
}
function displayIngredients(ingredientLines = []) {
    let count = 1;
    
    ingredientLines.forEach(ingredient => {
        let li = document.createElement('li')
        li.innerHTML=`${count}) ${ingredient}`
        recipeIngredients.append(li)
        count++;       
    });
    modalContent.append(recipeIngredients)
}
const clickRecipe = document.querySelector('.container');


function renderModal(ingredientLines, label) {
    modalTitle.innerHTML = label
    recipeIngredients.innerHTML=""
    displayIngredients(ingredientLines);

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.classList.add('hide')

        }
    }
    span.onclick = function () {
        modal.classList.add('hide')
      }
}
