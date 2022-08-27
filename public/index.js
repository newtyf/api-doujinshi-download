const btn = document.getElementById('download')
btn.addEventListener('click', getPdf)

function getPdf() {
  const input = document.getElementById('atomicNumber');
  const atomicNumber = input.value
  if (atomicNumber.length === 6) {
    donwloadPdf(atomicNumber)
  } else {
    console.log('numero atomico no valid');
  }
}

async function donwloadPdf(atomicNumber) {
  const loader = document.createElement('p')
  loader.innerText = 'espere un momento mientras descargamos su pdf...'
  document.body.appendChild(loader)
  const res = await fetch(`/download-manga-pdf?atomicNumber=${atomicNumber}`)
  const data = await res.json()
  console.log(data);
  loader.innerText = 'Aqui esta su salsita!!!'
  const redireccion = document.createElement('a')
  redireccion.href = `${window.location.href}${data.res}`
  redireccion.target = '_blank'
  redireccion.innerText = 'Gozalo mi king!'
  document.body.appendChild(redireccion)
}

