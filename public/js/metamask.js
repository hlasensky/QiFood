const choice = document.querySelector(".eth");
const submit = document.querySelector(".paymentMethod");

const metaError = document.querySelector(".metaError");

const to = document.currentScript.getAttribute("to");
const value = document.currentScript.getAttribute("value");
const gas = document.currentScript.getAttribute("gas");
const pay = document.currentScript.getAttribute("pay");



submit.addEventListener("click", () => {
	const radio = document.querySelector(".radio");
	if (radio.value === "eth") {
		ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
			transaction(accounts);
		});
	} else {
		return true;
	};
});

//Sending Ethereum to an address
const transaction = (accounts) => {
	ethereum
		.request({
			method: "eth_sendTransaction",
			params: [
				{
					from: accounts[0],
					to: to,
					value: value,
					gas: gas,
				},
			],
		})
		.then((txHash) => {
			console.log(txHash);
		})
		.catch((error) => {
			console.log(error.code);
			metaError.value = error.code;
		});
};


window.addEventListener( "load", function () {
	function sendData() {
	  const XHR = new XMLHttpRequest();
  
	  // Bind the FormData object and the form element
	  const FD = new FormData( form );
    
	  // Define what happens on successful data submission
	  XHR.addEventListener( "load", function(event) {
		alert( event.target.responseText );
	  } );
  
	  // Define what happens in case of error
	  XHR.addEventListener( "error", function( event ) {
		alert( 'Oops! Something went wrong.' );
	  } );
  
	  // Set up our request
	  XHR.open( "POST", "https://example.com/cors.php" );
  
	  // The data sent is what the user provided in the form
	  XHR.send( FD );
	}
  
	// Access the form element...
	const form = document.getElementById( "myForm" );
  
	// ...and take over its submit event.
	form.addEventListener( "submit", function ( event ) {
	  event.preventDefault();
  
	  sendData();
	} );
  } );