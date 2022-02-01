const choice = document.querySelector(".eth");
const submit = document.querySelector(".paymentMethod");

const metaError = document.querySelector(".metaError");

const to = document.currentScript.getAttribute("to");
const value = document.currentScript.getAttribute("value");
const gas = document.currentScript.getAttribute("gas");
const pay = document.currentScript.getAttribute("pay");



submit.addEventListener("click", () => {
	const radio = document.querySelector(".radio");
	console.log(radio.value)
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


