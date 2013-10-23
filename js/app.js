// app.js
var app = app || {},
    windowHeight = window.innerHeight,
    windowWidth = window.innerWidth,
    newContainerHeight,
    scanCartHeight = $('.scan-cart').outerHeight(),
    multisInfoH1 = $('.multis-info h1').outerHeight();

// Adjust container height based on window widths
if (windowWidth < 1175 && windowHeight < 650) {
    newContainerHeight = windowHeight - 190;
} else if (windowWidth >= 1120 && windowWidth < 1210) {
    newContainerHeight = windowHeight - 200;
} else if (windowWidth >= 1210 && windowWidth < 1250) {
    newContainerHeight = windowHeight - 205;
} else if (windowWidth >= 1250 && windowWidth < 1295) {
    newContainerHeight = windowHeight - 210;
} else if (windowWidth >= 1295 && windowWidth < 1340) {
    newContainerHeight = windowHeight - 215;
} else if (windowWidth >= 1340 && windowWidth < 1380) {
    newContainerHeight = windowHeight - 220;
} else if (windowWidth >= 1380 && windowWidth < 1425) {
    newContainerHeight = windowHeight - 225;
} else if (windowWidth >= 1425 && windowWidth < 1465) {
    newContainerHeight = windowHeight - 230;
} else if (windowWidth >= 1465 && windowWidth < 1510) {
    newContainerHeight = windowHeight - 235;
} else if (windowWidth >= 1510 && windowWidth < 1550) {
    newContainerHeight = windowHeight - 240;
} else if (windowWidth >= 1550) {
    newContainerHeight = windowHeight - 265;
} else {
    newContainerHeight = windowHeight - 190;
}

var multisLargeContainerTopHeight = newContainerHeight - 170,
    multisLargeContainerAvailableHeight = multisLargeContainerTopHeight - 50;


$('.item-info').height( newContainerHeight );
$('.multis-large-container-top').height( multisLargeContainerTopHeight );
$('.cart-complete-container').height( newContainerHeight );

$('.scan-cart').css({lineHeight: (newContainerHeight - 85) + 'px'});


function findWithAttr(array, attr, val) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][attr] === val) {
            return i;
        }
    }
}