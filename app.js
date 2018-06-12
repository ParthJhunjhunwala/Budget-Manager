// BUDGET CONTROLLER
var budgetController = (function () {
    
    //Constructor for each entry of inc and exp
    var expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    expense.prototype.calcPercentage = function(totalIncome) {
        
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum = sum + current.value;
        });
        data.totals[type] = sum;
    };
    
    //DAta Structure for storing the data
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //[1 2 3], next id=4,[1 3 5 6],nextid=7
            //id = last id + 1
            
            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            //Create new item based on type
            if (type === 'exp') {
                newItem = new expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new income(ID, des, val);
            }
            
            //Push it into data structure
            data.allItems[type].push(newItem);
            
            //Return the new element
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            
            // Calculate total inc and exp
            calculateTotal('exp');
            calculateTotal('inc');
            
            //Calculate budget: inc - exp
            data.budget = data.totals.inc - data.totals.exp;
            
            //CAlculate the % of income spent
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            } 
        },
        
        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function() {
             var allPerc = data.allItems.exp.map(function(curr) {
                 return curr.getPercentage();
             });
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        testing: function() {
            console.log(data);
        }
        
    };
})();


// UI CONTROLLER
var UIController = (function () {
    
    var DOMStrings = {
        type: '.add__type',
        description: '.add__description',
        value: '.add__value',
        btn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
        var numSplit, int, dec;
    
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.type).value,//exp or inc
                description: document.querySelector(DOMStrings.description).value,
                value: parseFloat(document.querySelector(DOMStrings.value).value)
            };
        },
        
        addListItem: function(obj, type) {
            var html,newHtml,element;
            // Create HTML string with placeholder 
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description"><strong>%description%</strong></div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description"><strong>%description%</strong></div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //REplace placeholder text with data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectoreID) {
            var el = document.getElementById(selectoreID);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.description + ', ' + DOMStrings.value);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '--';
            }
        },
        
        displayPercentage: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensePercLabel);
            
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });
        },
        
        displayDate: function() {
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();// returns the month number
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMStrings.type + ',' + DOMStrings.description + ',' + DOMStrings.value
            );
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.btn).classList.toggle('red');
        },
        
        getDOMStrings: function() {
            return DOMStrings;
        }
    }; 
})();


// GLOBAL APP CONTROLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var eventListerners = function() {
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.btn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                 ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.type).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function() {
        
        // 1. Calculate Budget
        budgetCtrl.calculateBudget();
        
        // 2. Return thee budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display budget on the UI
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function() {
        var percentages;
        
        // 1.CAlculate %
        budgetCtrl.calculatePercentages();
        
        // 2. Read from Budget Ctrl
        percentages = budgetCtrl.getPercentages();
        
        // 3. Display % in UI
        UICtrl.displayPercentage(percentages);
        
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get input data
        input = UICtrl.getInput();        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the Fields
            UICtrl.clearFields();

            // 5. Calculate and Update Budget
            updateBudget();
            
            // 6. Calculate and Update %
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete item from DS
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete from UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update new budget
            updateBudget();
            
            // 4. CAlculate and update %
            updatePercentages();
        }
        
    };
    
    return {
        init: function() {
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            eventListerners();
        }
    };
    
})(budgetController,UIController);

controller.init();




















