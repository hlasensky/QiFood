const sendEthButton = document.querySelector(".sendEthButton");

const to = document.currentScript.getAttribute('to');
const value = document.currentScript.getAttribute('value');
const gas = document.currentScript.getAttribute('gas');
const pay = document.currentScript.getAttribute('pay');


ethereum.request({ method: "eth_requestAccounts" }).then(accounts => {
	if (pay) {
		transaction(accounts)
	}
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
	.then((txHash) => console.log(txHash))
	.catch((error) => console.error);
}





/*
sendEthButton.addEventListener("click", () => {
	console.log(accounts)
	console.log(to, value, gas)
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
		.then((txHash) => console.log(txHash))
		.catch((error) => console.error);
});*/


//<!--<script src="/js/metamask.js" to="<%= params.to %>" value="<%= params.value %>" gas="<%= params.gas %>"></script>-->