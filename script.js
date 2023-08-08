import confetti from 'https://cdn.skypack.dev/canvas-confetti';

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

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getStatusHolders(){
  const network_id = '1'; 
  const token_addr = '0x993cc015a4940d11ef02eb986532da108b67c428'; 
  const CHAINBASE_API_KEY = "demo";

  let page = 1;
  let quantityHolders;
  let addresses = [];
  let entries = [];

  while(page != null){
    const response = await fetch(`https://api.chainbase.online/v1/token/top-holders?chain_id=${network_id}&contract_address=${token_addr}&page=${page}&limit=100`, {
      method: 'GET',
      headers: {
          'x-api-key': CHAINBASE_API_KEY,
          'accept': 'application/json'
      }
    });

    const data = await response.json();

    if(data.data){
      if(page == 1){
        quantityHolders = data.count;
      }
  
      page = data.next_page || null
  
      data.data.forEach(user => {
        addresses.push(user.wallet_address)
        entries.push(Math.trunc(parseFloat(user.amount)))
      })
    }else{
      console.log("Não respondeu corretamente: ", page)
      await sleep(200);
    }

    await sleep(900);
  }

  return { addresses, entries, quantityHolders }
}

let winnerText = document.querySelector(".winner");
let amountText = document.querySelector(".amount-winner");
let botao = document.querySelector(".raffle");
let participantes = document.querySelector(".participantes");
let loading = document.querySelector(".wrapper");

let confetes;

async function congratulations(){
  confetti();

  confetes = setInterval(() => {
    confetti();
  }, Math.floor(Math.random() * 1000));

  setTimeout(() => {
    clearInterval(confetes);
  }, 8000);
}


async function startRaffle(){

  try {
    const { addresses, entries, quantityHolders } = await getStatusHolders();
    const { winner, amount} = pickWinner(addresses, entries);

    congratulations();
    loading.style.display = "none";

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
  loading.style.display = "block";
  await startRaffle();
})