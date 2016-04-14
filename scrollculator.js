//region Helper functions

//key should be String, value can be any Javascript object
function writeToLocalStorage(key, value) {
    if (typeof (Storage) == 'undefined') {
        alert("Your browser doesn't support HTML5 LocalStorage which this site make use of. Some features may not be available. Consider upgrading your browser to the latest version");
        return false;
    }

    value = JSON.stringify(value); //serializing non-string data types to string

    try {
        window.localStorage.setItem(key, value);
    } catch (e) {
        if (e == QUOTA_EXCEEDED_ERR) {
            alert('Local storage Quota exceeded! .Clearing localStorage');
            localStorage.clear();
            window.localStorage.setItem(key, value); //Try saving the preference again
        }
    }

    return true;
}

function readFromLocalStorage(key) {
    if (typeof (Storage) == 'undefined') {
        //Broswer doesnt support local storage
        return null;
    }

    value = JSON.parse(localStorage.getItem(key));
    return value;

}

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this,
            args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

function pxToCm(pixels) {
    //1px = 0.02645833 cm;
    //http://stackoverflow.com/a/10795029/3009194

    return Math.round(pixels * 0.02645833);
}

function pxToInch(pixels) {
    //1inch = 96px
    //http://stackoverflow.com/a/1342059/3009194
    return Math.round(pixels * 0.01041666666667);
}

//endregion helper functions


var UNIT = {
    metric: 'metric',
    inch: 'inch',
    pixels: 'pixels'
}

var defaultSettings = {
    position: 'right', // right , left
    backgroundColor: 'lightpink',
    textColor: 'white',
    numberColor: 'black',
    unit: UNIT.metric
}


var scrollculator = function (settings) {

    var pixelCount = 0;
    var top = window.pageYOffset;

    var srollculatorElement = document.getElementById('scrollculator');
    var pixelCountElement = document.getElementById('pixelCount');
    var unitElement = document.getElementById('unit');
    var resetCounterBtn = document.getElementById('resetCounter');


    var scrollculatorStorageKey = 'scrollculator';

    // this should check if there are stored settings in local storage. and OR passed from the init
    function initSettings() {}

    initSettings();


    function updateScrollAmount(pixels, unit) {
        var scrollAmount;
        var unitText;
        switch (unit) {
        case UNIT.pixels:
            scrollAmount = pixels;
            unitText = 'Pixels';
            break;
        case UNIT.metric:
            scrollAmount = pxToCm(pixels);
            unitText = 'cm';
            break;
        case UNIT.inch:
            scrollAmount = pxToInch(pixels);
            unitText = 'inch';
            break;
        }

        pixelCountElement.innerHTML = scrollAmount;
        unitElement.innerHTML = unitText;
    }


    // this will check if we already visited the website and scrolled some pixels.
    if (readFromLocalStorage(scrollculatorStorageKey) !== null) {
        pixelCount = readFromLocalStorage(scrollculatorStorageKey).totalPixelsScrolled;
        updateScrollAmount(pixelCount, defaultSettings.unit);

    }


    registerEvents();

    var eficientWriteToLocalStorage = debounce(function () {
        writeToLocalStorage(scrollculatorStorageKey, {
            totalPixelsScrolled: pixelCount
        });
        hide();
    }, 1000);

    function hide() {
        srollculatorElement.classList.remove('visible');
    }

    function show() {
        srollculatorElement.classList.add('visible');
    }

    function resetCounter() {
        pixelCount = 0;
        updateAndShow();
    }

    function updateAndShow() {
        updateScrollAmount(pixelCount, defaultSettings.unit);

        show();
        // this will write to local storage the total pixels scrolled after 250ms from when a user stopa scrolling
        eficientWriteToLocalStorage();
    }


    function changeUnit(unit) {
        defaultSettings.unit = UNIT[unit];

        updateScrollAmount(pixelCount, defaultSettings.unit);
    }

    function registerEvents() {


        // TODO: find all the scrollable elements on page and add event listener of scroll on all of them
        var allElementsOnPage = document.querySelectorAll('*');
        for (var i = 0; i < allElementsOnPage.length; i++) {
            var element = allElementsOnPage[i];

            if (window.getComputedStyle(element).overflow == 'auto' || window.getComputedStyle(element).overflow == 'scroll') {
                //                element.style = 'border:1px solid red';
                element.addEventListener('scroll', function () {
                    console.log('scrolling', this);
                });
            }
        }


        // scroll event on window
        window.addEventListener("scroll", function () {
            var newTop = window.pageYOffset;
            if (newTop !== top) {
                pixelCount += Math.abs(newTop - top);
                top = newTop;
            }
            updateAndShow();
        }, false);


        // reset counter event
        resetCounterBtn.addEventListener('click', resetCounter);



        var unitRadioGroup = document.getElementsByName('scrollculatorUnit');
        for (var i = 0; i < unitRadioGroup.length; i++) {
            unitRadioGroup[i].addEventListener('change', function () {
                changeUnit(this.value);
            })
        }

    }

};
