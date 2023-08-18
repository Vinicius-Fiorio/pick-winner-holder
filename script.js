import confetti from 'https://cdn.skypack.dev/canvas-confetti';

let quantityHolders = 0;
let addresses = [];
let entries = [];

let winnerText = document.querySelector(".winner");
let amountText = document.querySelector(".amount-winner");
let botao = document.querySelector(".button-raffle");
let participantes = document.querySelector(".participantes");
let listRaffle = document.querySelector(".list-raffle");

(async () => {
  console.time("Duracao:")
  const url = "https://utils0.blob.core.windows.net/mega-dao/WhaleHolders.xlsx";
  const data = await (await fetch(url)).arrayBuffer();

  const workbook = XLSX.read(data);
  const xlsxData = workbook["Sheets"]["Sheet1"]

  delete xlsxData["!margins"]
  delete xlsxData["!ref"]

  quantityHolders = Object.keys(xlsxData).length/2;

  let auxElementHTML = "";

  for (let index = 1; index <= quantityHolders; index++) {
    let keyAdress = "A";
    let keyAmount = "B";

    let address = String(xlsxData[`${keyAdress}${index}`]["v"]);
    let amount = xlsxData[`${keyAmount}${index}`]["v"];

    addresses.push(address);
    entries.push(amount);

    let addressFormatted = address.slice(0,7) + "..." + address.slice(-4);

    auxElementHTML += `
    <div class="row ${address}">
      <div class="col">
        <p>${addressFormatted}</p>
      </div>
      <div class="col">
        <p>${amount}</p>
      </div>
    </div>

    `
  }

  listRaffle.innerHTML = auxElementHTML;
  participantes.innerHTML = `Participantes: ${quantityHolders}`;
  console.timeEnd("Duracao:")
})();

function setWinner(winnerAddress, type){
  let winnerList = document.querySelector(`[class="row ${winnerAddress}"]`);
  winnerList.style.backgroundColor = type == "win" ? "#161e8a" : "#ffffff";
  winnerList.style.color = type == "win" ? "#ffffff" : "#212529";
}

function pickWinner(addresses, entries){
  let sum = entries.reduce((previousValue, currentValue) => previousValue + currentValue, 0)
  const roll = Math.random() * sum;

  for (let index = 0; index < addresses.length; index++) {
    sum -= entries[index];
    
    if(roll >= sum){
      const winner = addresses[index];
      const amount = entries[index];
      return {winner, amount};
    }
  }
}

let confetes;

async function congratulations(){
  confetti();

  confetes = setInterval(() => {
    confetti();
  }, Math.floor(Math.random() * (1200 - 300)) + 300);

  setTimeout(() => {
    clearInterval(confetes);
  }, 8000);
}


async function startRaffle(){
  clearInterval(confetes);
  if(winnerText.innerText != "" || winnerText.innerHTML != "winner")
    setWinner(winnerText.innerText, "reset")

  try {
    const { winner, amount} = pickWinner(addresses, entries);

    setWinner(winner, "win")

    congratulations();

    winnerText.innerHTML = `${winner}`;
    winnerText.style.fontSize = "3vw";
    winnerText.style.visibility = "visible";

    amountText.innerHTML = `${amount} tokens`;
    amountText.style.visibility = "visible";
    
    participantes.innerHTML = `Participantes: ${quantityHolders}`
    participantes.style.visibility = "visible";
    
  } catch (error) {
    console.log(error)
    alert("Erro ao sortear vencedor, tente novamente em 10 segundos");
  }
}

botao.addEventListener('click', async () =>{
  await startRaffle();
})